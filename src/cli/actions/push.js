const fs = require('fs')
const path = require('path')
const { request } = require('undici')
const { logger, keypair } = require('@dotenvx/dotenvx')

const current = require('./../../db/current')
const Organization = require('./../../db/organization')

const sleep = require('./../../lib/helpers/sleep')
const isGitRepo = require('./../../lib/helpers/isGitRepo')
const isGithub = require('./../../lib/helpers/isGithub')
const gitUrl = require('./../../lib/helpers/gitUrl')
const gitRoot = require('./../../lib/helpers/gitRoot')
const extractUsernameName = require('./../../lib/helpers/extractUsernameName')
const forgivingDirectory = require('./../../lib/helpers/forgivingDirectory')
const { createSpinner } = require('./../../lib/helpers/createSpinner')
const encryptValue = require('./../../lib/helpers/encryptValue')

const spinner = createSpinner('pushing')

// constants
const ENCODING = 'utf8'

function _envFilepaths (directory, envFile) {
  if (!Array.isArray(envFile)) {
    return [path.join(directory, envFile)]
  }

  return envFile.map(file => path.join(directory, file))
}

// Create a simple-git instance for the current directory
async function push (directory) {
  spinner.start()

  directory = forgivingDirectory(directory)

  // debug args
  logger.debug(`directory: ${directory}`)

  // debug opts
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  // must be a git repo
  if (!isGitRepo()) {
    spinner.fail('oops, must be a git repository')
    logger.help('? create one with [git init .]')
    process.exit(1)
  }

  // must be a git root
  const gitroot = gitRoot()
  if (!gitroot) {
    spinner.fail('oops, could not determine git repository\'s root')
    logger.help('? create one with [git init .]')
    process.exit(1)
  }

  // must have a remote origin url
  const giturl = gitUrl()
  if (!giturl) {
    spinner.fail('oops, must have a remote origin (git remote -v)')
    logger.help('? create it at [github.com/new] and then run [git remote add origin git@github.com:username/repository.git]')
    process.exit(1)
  }

  // must be a github remote
  if (!isGithub(giturl)) {
    spinner.fail('oops, must be a github.com remote origin (git remote -v)')
    logger.help('? create it at [github.com/new] and then run [git remote add origin git@github.com:username/repository.git]')
    logger.help2('ℹ need support for other origins? [please tell us](https://github.com/dotenvx/dotenvx/issues)')
    process.exit(1)
  }

  // http related
  const hostname = options.hostname
  const pushUrl = `${hostname}/api/push`
  const token = current.token()
  const usernameName = extractUsernameName(giturl)

  const envFilepaths = _envFilepaths(directory, options.envFile)
  for (const envFilepath of envFilepaths) {
    const filepath = path.resolve(envFilepath)

    // file must exist
    if (!fs.existsSync(filepath)) {
      spinner.fail(`oops, missing ${envFilepath} file (${filepath})`)
      logger.help(`? add one with [echo "HELLO=World" > ${envFilepath}]`)
      process.exit(1)
    }

    // get keypairs
    const keypairs = keypair(filepath)

    // publicKey must exist
    const publicKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PUBLIC_KEY'))
    const publicKey = keypairs[publicKeyName]
    if (!publicKey) {
      spinner.fail(`oops, could not locate ${publicKeyName}`)
      logger.help(`? generate ${publicKeyName} (.env.keys) with [dotenvx encrypt]`)
      process.exit(1)
    }

    const privateKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PRIVATE_KEY'))
    const privateKey = keypairs[privateKeyName]
    const organization = new Organization() // TODO: handle different id somehow (without user having to be 'logged into' this organization currently)
    const privateKeyEncryptedWithOrganizationPublicKey = organization.encrypt(privateKey)
    const relativeFilepath = path.relative(gitroot, path.join(process.cwd(), directory, envFilepath)).replace(/\\/g, '/') // smartly determine path/to/.env file from repository root - where user is cd-ed inside a folder or at repo root
    const payload = {
      repo: usernameName,
      filepath: relativeFilepath,
      public_key: publicKey,
      private_key_encrypted_with_organization_public_key: privateKeyEncryptedWithOrganizationPublicKey
    }

    // but instead i could just grab this from the /organization/id/project/id/ETC
    // so maybe what i need instead is a collection of lookups? and maybe a sync file that is focused on that? it's just lookups - like lookup/getOrganizationIdBySlug/:slug => 1
    // lookup/getProjectIdByRepo/motdotla/test1 => 2
    //
    // or POST this data:
    // { repo: filepath: public_key:,  }
    // return
    // { organizationId, repo, public_key:, currentPrivateKeyEncryptedWithOrganizationPublicKey }
    // use organizationId to get organization.encrypt
    // but first decrypt the currentPrivateKeyEncryptedWithOrganizationPublicKey
    //
    // organization = new Organization(organizationId)
    // organization = new Organization(slug)
    //
    // user.organizationIds
    // but we don't know it yet
    // we know the usernameName - which has slug in it
    //

    console.log('payload', payload)
    spinner.succeed('TODO: process payload to api')
  }
}

module.exports = push

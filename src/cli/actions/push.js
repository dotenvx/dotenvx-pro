const fs = require('fs')
const path = require('path')
const { request } = require('undici')
const { logger, keypair } = require('@dotenvx/dotenvx')

const currentUser = require('./../../shared/currentUser')

const sleep = require('./../../lib/helpers/sleep')
const isGitRepo = require('./../../lib/helpers/isGitRepo')
const isGithub = require('./../../lib/helpers/isGithub')
const gitUrl = require('./../../lib/helpers/gitUrl')
const gitRoot = require('./../../lib/helpers/gitRoot')
const extractUsernameName = require('./../../lib/helpers/extractUsernameName')
const forgivingDirectory = require('./../../lib/helpers/forgivingDirectory')
const { createSpinner } = require('./../../lib/helpers/createSpinner')

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
  const token = currentUser.token()
  const usernameName = extractUsernameName(giturl)

  const envFilepaths = _envFilepaths(directory, options.envFile)
  for (const envFilepath of envFilepaths) {
    const filepath = path.resolve(envFilepath)

    // file must exist
    if (!fs.existsSync(filepath)) {
      spinner.fail(`oops, missing ${filepath} file`)
      process.exit(1)
    }

    // get keypairs
    const keypairs = keypair(filepath)

    // publicKey must exist
    const publicKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PUBLIC_KEY'))
    const publicKey = keypairs[publicKeyName]
    if (!publicKey) {
      spinner.fail('oops, could not locate public key')
      process.exit(1)
    }

    const privateKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PRIVATE_KEY'))
    const privateKey = keypairs[privateKeyName]
    const privateKeyEncryptedWithOrganizationPublicKey = privateKey

    const relativeFilepath = path.relative(gitroot, path.join(process.cwd(), directory, envFilepath)).replace(/\\/g, '/') // smartly determine path/to/.env file from repository root - where user is cd-ed inside a folder or at repo root
    const payload = {
      repo: usernameName,
      filepath: relativeFilepath,
      public_key: publicKey,
      private_key_encrypted_with_organization_public_key: privateKeyEncryptedWithOrganizationPublicKey
    }

    console.log('payload', payload)
  }

  // try {
  //   const response = await request(pushUrl, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${oauthToken}`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       username_name: usernameName,
  //       DOTENV_KEYS: dotenvKeysContent,
  //       filepath: relativeEnvKeysFilepath
  //     })
  //   })

  //   const responseData = await response.body.json()

  //   if (response.statusCode >= 400) {
  //     logger.http(responseData)
  //     spinner.fail(responseData.error.message)
  //     if (response.statusCode === 404) {
  //       logger.help(`? try visiting [${hostname}/gh/${usernameName}] in your browser`)
  //     }
  //     process.exit(1)
  //   }
  // } catch (error) {
  //   spinner.fail(error.toString())
  //   process.exit(1)
  // }

  // spinner.succeed(`pushed [${usernameName}]`)
  // logger.help2('ℹ run [dotenvx ext hub open] to view on hub')
  spinner.succeed('implement')
}

module.exports = push

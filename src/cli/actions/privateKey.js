const path = require('path')

const User = require('./../../db/user')
const Organization = require('./../../db/organization')

const isGitRepo = require('./../../lib/helpers/isGitRepo')
const isGithub = require('./../../lib/helpers/isGithub')
const gitUrl = require('./../../lib/helpers/gitUrl')
const gitRoot = require('./../../lib/helpers/gitRoot')
const extractUsernameName = require('./../../lib/helpers/extractUsernameName')
const extractSlug = require('./../../lib/helpers/extractSlug')
const forgivingDirectory = require('./../../lib/helpers/forgivingDirectory')

function _envFilepaths (directory, envFile) {
  if (!Array.isArray(envFile)) {
    return [path.join(directory, envFile)]
  }

  return envFile.map(file => path.join(directory, file))
}

// Create a simple-git instance for the current directory
function privateKey (directory) {
  try {
    directory = forgivingDirectory(directory)

    // debug opts
    const options = this.opts()

    // must be a git repo
    if (!isGitRepo()) {
      console.error('oops, must be a git repository')
      process.exit(1)
    }

    // must be a git root
    const gitroot = gitRoot()
    if (!gitroot) {
      console.error('oops, could not determine git repository\'s root')
      process.exit(1)
    }

    // must have a remote origin url
    const giturl = gitUrl()
    if (!giturl) {
      console.error('oops, must have a remote origin (git remote -v)')
      process.exit(1)
    }

    // must be a github remote
    if (!isGithub(giturl)) {
      console.error('oops, must be a github.com remote origin (git remote -v)')
      process.exit(1)
    }

    // find organization locally
    const usernameName = extractUsernameName(giturl)
    const slug = extractSlug(usernameName)
    const user = new User()
    const lookups = user.lookups()
    const organizationId = lookups[`lookup/organizationIdBySlug/${slug}`]
    if (!organizationId) {
      console.error(`oops, can't find organization [@${slug}]. did you join it? [dotenvx pro settings orgjoin]`)
      process.exit(1)
    }
    const organization = new Organization(organizationId)

    const repositoryId = lookups[`lookup/repositoryIdByUsernameName/${usernameName}`]
    if (!repositoryId) {
      console.error(`oops, can't find project [@${usernameName}]. did you push from it? [dotenvx pro push]`)
      process.exit(1)
    }

    // -f .env,etc
    const envFilepaths = _envFilepaths(directory, options.envFile)
    for (const envFilepath of envFilepaths) {
      const envFileId = lookups[`lookup/envFileIdByUsernameNameFilepath/${usernameName}/${envFilepath}`]
      if (!envFileId) {
        console.error(`oops, can't find project file [@${usernameName}/${envFilepath}]. did you push it? [dotenvx pro push -f ${envFilepath}]`)
        process.exit(1)
      }

      const privateKeyName = organization.store.get(`r/${repositoryId}/e/${envFileId}/ekn`)
      if (!privateKeyName) {
        console.error(`oops, can't find private key name for [@${usernameName}/${envFilepath}]. did you sync? [dotenvx pro sync]`)
        process.exit(1)
      }

      const privateKeyEncrypted = organization.store.get(`r/${repositoryId}/e/${envFileId}/ek/1`)
      if (!privateKeyEncrypted) {
        console.error(`oops, can't find private key for [@${usernameName}/${envFilepath}]. did you sync? [dotenvx pro sync]`)
        process.exit(1)
      }

      const privateKey = organization.decrypt(privateKeyEncrypted)

      console.log(`${privateKeyName}=${privateKey}`)
    }
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

module.exports = privateKey

const path = require('path')

const isGitRepo = require('./../helpers/isGitRepo')
const gitRoot = require('./../helpers/gitRoot')
const gitUrl = require('./../helpers/gitUrl')
const isGithub = require('./../helpers/isGithub')
const forgivingDirectory = require('./../helpers/forgivingDirectory')
const extractUsernameName = require('./../helpers/extractUsernameName')
const extractSlug = require('./../helpers/extractSlug')

const User = require('./../../db/user')
const Organization = require('./../../db/organization')

class PrivateKey {
  constructor (directory, envFile = '.env') {
    this.directory = forgivingDirectory(directory)
    this.envFile = envFile

    this.gitroot = gitRoot()
    this.giturl = gitUrl()
  }

  run () {
    this._validateGit()

    // find organization locally
    const usernameName = extractUsernameName(this.giturl)
    const slug = extractSlug(usernameName)
    const user = new User()
    const lookups = user.lookups()
    const organizationId = lookups[`lookup/organizationIdBySlug/${slug}`]
    if (!organizationId) {
      throw new Error(`oops, can't find organization [@${slug}]. did you join it? [dotenvx pro settings orgjoin]`)
    }
    const organization = new Organization(organizationId)

    const repositoryId = lookups[`lookup/repositoryIdByUsernameName/${usernameName}`]
    if (!repositoryId) {
      throw new Error(`oops, can't find project [@${usernameName}]. did you push it? [dotenvx pro push]`)
    }

    const results = []
    const envFilepaths = this._envFilepaths()
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

      results.push(`${privateKeyName}=${privateKey}`)
    }

    return results
  }

  _validateGit() {
    // must be a git repo
    if (!isGitRepo()) {
      throw new Error('oops, must be a git repository')
    }

    // must be a git root
    if (!this.gitroot) {
      throw new Error('oops, could not determine git repository\'s root')
    }

    // must have a remote origin url
    if (!this.giturl) {
      throw new Error('oops, must have a remote origin (git remote -v)')
    }

    // must be a github remote
    if (!isGithub(this.giturl)) {
      throw new Error('oops, must be a github.com remote origin (git remote -v)')
    }
  }

  _envFilepaths () {
    if (!Array.isArray(this.envFile)) {
      return [path.join(this.directory, this.envFile)]
    }

    return this.envFile.map(file => path.join(this.directory, file))
  }
}

module.exports = PrivateKey

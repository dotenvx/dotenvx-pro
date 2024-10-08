const gitUrl = require('./../helpers/gitUrl')
const ValidateGit = require('./../helpers/validateGit')
const extractSlug = require('./../helpers/extractSlug')
const extractUsernameName = require('./../helpers/extractUsernameName')

// db
const User = require('./../../db/user')
const Organization = require('./../../db/organization')

class DbKeypair {
  constructor (envFile = '.env', key = undefined) {
    this.envFile = envFile
    this.key = key

    this.user = new User()
    this._mem = {}
  }

  run () {
    new ValidateGit().run()

    const out = {}
    for (const envFilepath of this._envFilepaths()) {
      const lookupKey = `lookup/envFileIdByUsernameNameFilepath/${this.usernameName()}/${envFilepath}`
      const envFileId = this.lookups()[lookupKey]
      if (!envFileId) {
        continue
      }

      const publicKeyName = this.organization().store.get(`r/${this.repositoryId()}/e/${envFileId}/pkn`)
      const publicKey = this.organization().store.get(`r/${this.repositoryId()}/e/${envFileId}/pk/1`)
      if (publicKeyName && publicKey) {
        out[publicKeyName] = publicKey
      }

      const privateKeyName = this.organization().store.get(`r/${this.repositoryId()}/e/${envFileId}/ekn`)
      const privateKeyEncrypted = this.organization().store.get(`r/${this.repositoryId()}/e/${envFileId}/ek/1`)
      if (privateKeyName && privateKeyEncrypted) {
        const privateKey = this.organization().decrypt(privateKeyEncrypted)
        out[privateKeyName] = privateKey
      }
    }

    if (this.key) {
      return out[this.key]
    } else {
      return out
    }
  }

  organization () {
    if (this._mem.organization) {
      return this._mem.organization
    }

    const result = new Organization(this.organizationId())
    this._mem.organization = result
    return result
  }

  usernameName () {
    if (this._mem.usernameName) {
      return this._mem.usernameName
    }

    const result = extractUsernameName(this._gitUrl())
    this._mem.usernameName = result
    return result
  }

  slug () {
    if (this._mem.slug) {
      return this._mem.slug
    }

    const result = extractSlug(this.usernameName())
    this._mem.slug = result
    return result
  }

  lookups () {
    if (this._mem.lookups) {
      return this._mem.lookups
    }

    const result = this.user.lookups()
    this._mem.lookups = result
    return result
  }

  organizationId () {
    const id = this.lookups()[`lookup/organizationIdBySlug/${this.slug()}`]

    if (!id) {
      throw new Error(`oops, can't find organization [@${this.slug()}]. did you join it? [dotenvx pro settings orgjoin]`)
    }

    return id
  }

  repositoryId () {
    const id = this.lookups()[`lookup/repositoryIdByUsernameName/${this.usernameName()}`]

    if (!id) {
      throw new Error(`oops, can't find project [@${this.usernameName()}]. did you push it? [dotenvx pro push]`)
    }

    return id
  }

  _gitUrl () {
    return gitUrl()
  }

  _envFilepaths () {
    if (!Array.isArray(this.envFile)) {
      return [this.envFile]
    }

    return this.envFile
  }
}

module.exports = DbKeypair

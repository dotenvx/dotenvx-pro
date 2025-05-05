const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// helpers
const gitUrl = require('./../helpers/gitUrl')
const gitRoot = require('./../helpers/gitRoot')
const ValidateGit = require('./../helpers/validateGit')
const ValidateKeysFile = require('./../helpers/validateKeysFile')
const ValidateLoggedIn = require('./../helpers/validateLoggedIn')
const ValidatePublicKey = require('./../helpers/validatePublicKey')
const extractSlug = require('./../helpers/extractSlug')
const extractUsernameName = require('./../helpers/extractUsernameName')
const forgivingDirectory = require('./../helpers/forgivingDirectory')
const removeKeyFromEnvFile = require('./../helpers/removeKeyFromEnvFile')
const Errors = require('./../helpers/errors')
const encryptValue = require('./../helpers/encryptValue')
const decryptValue = require('./../helpers/decryptValue')

// services
const SyncMe = require('./../../lib/services/syncMe')
const SyncPublicKey = require('./../../lib/services/syncPublicKey')
const SyncOrganization = require('./syncOrganization')
const SyncOrganizationPublicKey = require('./../../lib/services/syncOrganizationPublicKey')
const Keypair = require('./keypair')

// db
const User = require('./../../db/user')
const current = require('./../../db/current')
const UserPrivateKey = require('./../../db/userPrivateKey')

// api calls
const PostPush = require('./../../lib/api/postPush')

class Cloak {
  constructor (hostname = current.hostname(), envFile = '.', directory = '.') {
    this.hostname = hostname
    this.envFile = envFile
    this.directory = forgivingDirectory(directory)

    this._mem = {}
  }

  async run () {
    // validate repo
    new ValidateGit().run()
    new ValidateKeysFile().run()

    // logged in
    new ValidateLoggedIn().run()
    let user = await new SyncMe(this.hostname, current.token()).run()

    // verify/sync public key
    new ValidatePublicKey().run()
    const userPrivateKey = new UserPrivateKey()
    user = await new SyncPublicKey(this.hostname, current.token(), userPrivateKey.publicKey()).run()

    // organization(s)
    const _organizationIds = user.organizationIds()
    if (!_organizationIds || _organizationIds.length < 1) {
      throw new Errors({username: user.username()}).missingOrganization()
    }

    let currentOrganizationId = current.organizationId()

    for (let iOrg = 0; iOrg < _organizationIds.length; iOrg++) {
      const organizationId = _organizationIds[iOrg]

      // for later - to auto-select an organization
      if (!currentOrganizationId) {
        currentOrganizationId = organizationId
      }
      let organization = await new SyncOrganization(this.hostname, current.token(), organizationId).run()

      // generate org keypair for the first time
      const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = userPrivateKey.encrypt(genPrivateKey) // encrypt org private key with user's public key

        organization = await new SyncOrganizationPublicKey(this.hostname, current.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
        user = await new SyncPublicKey(this.hostname, current.token(), userPrivateKey.publicKey()).run()
      }

      const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
      if (!meHasPrivateKeyEncrypted) {
        throw new Errors({slug: organization.slug()}).missingOrganizationPrivateKey()
      }

      const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey())
      if (canDecryptOrganization !== 'true') {
        throw new Errors({slug: organization.slug()}).decryptionFailed()
      }

      await new SyncOrganization(current.hostname(), current.token(), organizationId).run()
    }

    // select current organization
    current.selectOrganization(currentOrganizationId)
    const organization = new Organization()

    // ready to cloak
    logger.success('ready to cloak!')

    return { }
  }

  slug () {
    if (this._mem.slug) {
      return this._mem.slug
    }

    const result = extractSlug(this.usernameName())
    this._mem.slug = result
    return result
  }

  usernameName () {
    if (this._mem.usernameName) {
      return this._mem.usernameName
    }

    const result = extractUsernameName(gitUrl())
    this._mem.usernameName = result
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
      const error = new Error(`connect your account to organization [@${this.slug()}]`)
      error.help = '? connect it with one of the following\n\n  1. run [dotenvx pro sync]\n  2. or connect it [dotenvx pro settings orgconnect]'

      throw error
    }

    return id
  }

  _envFilepaths () {
    if (!Array.isArray(this.envFile)) {
      return [path.join(this.directory, this.envFile)]
    }

    return this.envFile.map(file => path.join(this.directory, file))
  }
}

module.exports = Cloak

const fs = require('fs')
const path = require('path')
const { PrivateKey } = require('eciesjs')

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
const Organization = require('./../../db/organization')

// api calls
const PostPush = require('./../../lib/api/postPush')

class Cloak {
  constructor (hostname = current.hostname(), envFile = '.env', directory = '.') {
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
    this.user = await new SyncMe(this.hostname, current.token()).run()

    // verify/sync public key
    new ValidatePublicKey().run()
    const userPrivateKey = new UserPrivateKey()
    this.user = await new SyncPublicKey(this.hostname, current.token(), userPrivateKey.publicKey()).run()

    // organization(s)
    const _organizations = this.user.organizations()
    const _organizationIds = this.user.organizationIds()
    if (!_organizations || _organizations.length < 1) {
      throw new Errors({ username: this.user.username() }).missingOrganization()
    }

    let currentOrganizationId
    for (let iOrg = 0; iOrg < _organizations.length; iOrg++) {
      const organizationId = _organizations[iOrg].id()
      const organizationSlug = _organizations[iOrg].slug()

      if (organizationSlug.toLowerCase() !== this.slug().toLowerCase()) continue // filters to repo's organization
      currentOrganizationId = organizationId // set new current organization

      let organization = await new SyncOrganization(this.hostname, current.token(), organizationId).run()

      // generate org keypair for the first time
      const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = userPrivateKey.encrypt(genPrivateKey) // encrypt org private key with user's public key

        organization = await new SyncOrganizationPublicKey(this.hostname, current.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
        this.user = await new SyncPublicKey(this.hostname, current.token(), userPrivateKey.publicKey()).run()
      }

      const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
      if (!meHasPrivateKeyEncrypted) {
        throw new Errors({ slug: organization.slug() }).missingOrganizationPrivateKey()
      }

      const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey())
      if (canDecryptOrganization !== 'true') {
        throw new Errors({ slug: organization.slug() }).decryptionFailed()
      }

      await new SyncOrganization(current.hostname(), current.token(), organizationId).run()
    }

    if (!currentOrganizationId) {
      throw new Errors({ username: this.user.username(), slug: this.slug() }).organizationNotConnected()
    }

    // select current organization
    current.selectOrganization(currentOrganizationId) // TODO: should we switch back to the original current org after the cloak/push?
    const organization = new Organization()

    const pushedFilepaths = []
    const privateKeyNames = []
    for (const envFilepath of this._envFilepaths()) {
      const filepath = path.resolve(envFilepath)
      if (!fs.existsSync(filepath)) {
        throw new Errors({ filename: envFilepath, filepath }).missingEnvFile()
      }

      // get keypairs
      const keypairs = new Keypair(envFilepath).run()

      // publicKey must exist
      const publicKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PUBLIC_KEY'))
      const publicKey = keypairs[publicKeyName]
      if (!publicKey) {
        throw new Errors({ filename: envFilepath, filepath, publicKeyName }).missingDotenvPublicKey()
      }

      // privateKey must exist
      const privateKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PRIVATE_KEY'))
      const privateKey = keypairs[privateKeyName]
      if (!privateKey) {
        throw new Errors({ filename: envFilepath, filepath, privateKeyName }).missingDotenvPrivateKey()
      }

      // filepath
      const relativeFilepath = path.relative(gitRoot(), path.join(process.cwd(), this.directory, envFilepath)).replace(/\\/g, '/') // smartly determine path/to/.env file from repository root - where user is cd-ed inside a folder or at repo root

      // text
      const text = fs.readFileSync(filepath, 'utf8')

      const privateKeyEncryptedWithOrganizationPublicKey = organization.encrypt(privateKey)
      await new PostPush(this.hostname, current.token(), 'github', organization.publicKey(), this.usernameName(), relativeFilepath, publicKeyName, privateKeyName, publicKey, privateKeyEncryptedWithOrganizationPublicKey, text).run()

      // sync up
      await new SyncOrganization(this.hostname, current.token(), this.organizationId()).run()
      await new SyncMe(this.hostname, current.token()).run()

      // deal with .env.keys file
      // const envKeysFilepath = path.join(path.dirname(filepath), '.env.keys')
      // if (fs.existsSync(envKeysFilepath)) {
      //   // remove DOTENV_PRIVATE_KEY from .env.keys file
      //   removeKeyFromEnvFile(envKeysFilepath, privateKeyName)

      //   // remove .env.keys file if not more private keys left
      //   const env = fs.readFileSync(envKeysFilepath, 'utf8')
      //   const parsedKeys = dotenv.parse(env)
      //   if (Object.keys(parsedKeys).length <= 0) {
      //     fs.unlinkSync(envKeysFilepath)
      //   }
      // }

      pushedFilepaths.push(relativeFilepath)
      privateKeyNames.push(privateKeyName)
    }

    return { privateKeyNames }
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

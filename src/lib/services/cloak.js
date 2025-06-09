const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { PrivateKey } = require('eciesjs')

// helpers
const gitUrl = require('./../helpers/gitUrl')
const gitRoot = require('./../helpers/gitRoot')
const ValidateGit = require('./../helpers/validateGit')
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
const DbKeypair = require('./dbKeypair')

// db
const current = require('./../../db/current')
const Organization = require('./../../db/organization')

// api calls
const PostPush = require('./../../lib/api/postPush')
const PostOrganization = require('./../../lib/api/postOrganization')

class Cloak {
  constructor (hostname = current.hostname(), envFile = '.env', directory = '.') {
    this.hostname = hostname
    this.envFile = envFile
    this.directory = forgivingDirectory(directory)

    this._mem = {}
    this.processedEnvs = []
    this.changedFilepaths = new Set()
    this.unchangedFilepaths = new Set()
  }

  async run () {
    // validate repo
    new ValidateGit().run()

    // logged in
    new ValidateLoggedIn().run()
    this.user = await new SyncMe(this.hostname, current.token()).run()

    // verify/sync public key
    new ValidatePublicKey().run()
    this.user = await new SyncPublicKey(this.hostname, current.token(), this.user.publicKey()).run()

    // organization(s)
    const _organizationIds = this.user.organizationIds()
    if (!_organizationIds || _organizationIds.length < 1) {
      throw new Errors({ username: this.user.username() }).missingOrganization()
    }

    let currentOrganizationId
    for (const organizationId of this.user.organizationIds()) {
      let organization = await new SyncOrganization(this.hostname, current.token(), organizationId).run()

      if (organization.slug().toLowerCase() !== this.slug().toLowerCase()) continue // filters to repo's organization
      currentOrganizationId = organizationId // set new current organization

      // generate org keypair for the first time
      const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = this.user.encrypt(genPrivateKey) // encrypt org private key with user's public key

        organization = await new SyncOrganizationPublicKey(this.hostname, current.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
        this.user = await new SyncPublicKey(this.hostname, current.token(), this.user.publicKey()).run()
      }

      const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
      if (!meHasPrivateKeyEncrypted) {
        throw new Errors({ slug: organization.slug() }).missingOrganizationPrivateKey()
      }

      const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey(this.user.privateKey()))
      if (canDecryptOrganization !== 'true') {
        throw new Errors({ slug: organization.slug() }).decryptionFailed()
      }

      await new SyncOrganization(current.hostname(), current.token(), organizationId).run()
    }

    if (!currentOrganizationId) {
      // Attempt to create the organization if it doesn't exist
      try {
        await new PostOrganization(this.hostname, current.token(), this.slug()).run()

        // Re-sync user data to get the newly created organization
        this.user = await new SyncMe(this.hostname, current.token()).run()

        // Try to find the organization again after creation
        for (const organizationId of this.user.organizationIds()) {
          let organization = await new SyncOrganization(this.hostname, current.token(), organizationId).run()

          if (organization.slug().toLowerCase() !== this.slug().toLowerCase()) continue
          currentOrganizationId = organizationId

          // generate org keypair for the first time
          const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
          if (!organizationHasPublicKey) {
            const kp = new PrivateKey()
            const genPublicKey = kp.publicKey.toHex()
            const genPrivateKey = kp.secret.toString('hex')
            const genPrivateKeyEncrypted = this.user.encrypt(genPrivateKey) // encrypt org private key with user's public key

            organization = await new SyncOrganizationPublicKey(this.hostname, current.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
            this.user = await new SyncPublicKey(this.hostname, current.token(), this.user.publicKey()).run()
          }

          const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
          if (!meHasPrivateKeyEncrypted) {
            throw new Errors({ slug: organization.slug() }).missingOrganizationPrivateKey()
          }

          const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey(this.user.privateKey()))
          if (canDecryptOrganization !== 'true') {
            throw new Errors({ slug: organization.slug() }).decryptionFailed()
          }

          await new SyncOrganization(current.hostname(), current.token(), organizationId).run()
          break
        }
      } catch (error) {
        // If organization creation fails, fall back to the original error
        if (!currentOrganizationId) {
          throw new Errors({ username: this.user.username(), slug: this.slug() }).organizationNotConnected()
        }
      }

      // Final check - if still no organization found, throw error
      if (!currentOrganizationId) {
        throw new Errors({ username: this.user.username(), slug: this.slug() }).organizationNotConnected()
      }
    }

    // select current organization
    current.selectOrganization(currentOrganizationId) // TODO: should we switch back to the original current org after the cloak/push?
    const organization = new Organization()

    for (const envFilepath of this._envFilepaths()) {
      const row = {
        changed: false
      } // used later for reporting to cli

      const filepath = path.resolve(envFilepath)
      row.filepath = filepath
      row.filename = envFilepath
      if (!fs.existsSync(filepath)) {
        throw new Errors({ filename: envFilepath, filepath }).missingEnvFile()
      }

      const keypairs = new Keypair(envFilepath).run() // file AND db keypairs. db wins.

      // publicKey must exist
      const publicKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PUBLIC_KEY'))
      const publicKey = keypairs[publicKeyName]
      row.publicKeyName = publicKeyName
      row.publicKey = publicKey
      if (!publicKey) {
        throw new Errors({ filename: envFilepath, filepath, publicKeyName }).missingDotenvPublicKey()
      }

      // privateKey must exist
      const privateKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PRIVATE_KEY'))
      const privateKey = keypairs[privateKeyName]
      row.privateKeyName = privateKeyName
      row.privateKey = privateKey
      if (!privateKey) {
        throw new Errors({ filename: envFilepath, filepath, privateKeyName }).missingDotenvPrivateKey()
      }

      const dbkeypairs = new DbKeypair(envFilepath).run()
      if (dbkeypairs[privateKeyName] !== privateKey) {
        row.changed = true // row is changing

        const relativeFilepath = path.relative(gitRoot(), path.join(process.cwd(), this.directory, envFilepath)).replace(/\\/g, '/') // smartly determine path/to/.env file from repository root - where user is cd-ed inside a folder or at repo root
        const text = fs.readFileSync(filepath, 'utf8')
        const privateKeyEncryptedWithOrganizationPublicKey = organization.encrypt(privateKey)

        await new PostPush(this.hostname, current.token(), 'github', organization.publicKey(), this.usernameName(), relativeFilepath, publicKeyName, privateKeyName, publicKey, privateKeyEncryptedWithOrganizationPublicKey, text).run()
        // sync up for good measure
        await new SyncOrganization(this.hostname, current.token(), this.organizationId()).run()
        await new SyncMe(this.hostname, current.token()).run()

        // deal with .env.keys file
        const envKeysFilepath = path.join(path.dirname(filepath), '.env.keys')
        if (fs.existsSync(envKeysFilepath)) {
          // remove DOTENV_PRIVATE_KEY from .env.keys file
          removeKeyFromEnvFile(envKeysFilepath, privateKeyName)

          // remove .env.keys file if not more private keys left
          const env = fs.readFileSync(envKeysFilepath, 'utf8')
          const parsedKeys = dotenv.parse(env)
          if (Object.keys(parsedKeys).length <= 0) {
            fs.unlinkSync(envKeysFilepath)
          }
        }
      }

      if (row.changed) {
        this.changedFilepaths.add(envFilepath)
      } else {
        this.unchangedFilepaths.add(envFilepath)
      }

      this.processedEnvs.push(row)
    }

    return {
      processedEnvs: this.processedEnvs,
      changedFilepaths: [...this.changedFilepaths],
      unchangedFilepaths: [...this.unchangedFilepaths]
    }
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

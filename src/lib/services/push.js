const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const gitUrl = require('./../helpers/gitUrl')
const gitRoot = require('./../helpers/gitRoot')
const ValidateGit = require('./../helpers/validateGit')
const extractSlug = require('./../helpers/extractSlug')
const extractUsernameName = require('./../helpers/extractUsernameName')
const forgivingDirectory = require('./../helpers/forgivingDirectory')
const removeKeyFromEnvFile = require('./../helpers/removeKeyFromEnvFile')
const Errors = require('./../helpers/errors')

// services
const SyncOrganization = require('./syncOrganization')
const Keypair = require('./keypair')

// db
const User = require('./../../db/user')
const current = require('./../../db/current')

// api calls
const PostPush = require('./../../lib/api/postPush')

class Push {
  constructor (hostname = current.hostname(), envFile = '.env', directory = '.') {
    this.hostname = hostname
    this.envFile = envFile
    this.directory = forgivingDirectory(directory)

    this.user = new User()
    this._mem = {}
  }

  async run () {
    new ValidateGit().run()

    const organization = await new SyncOrganization(this.hostname, current.token(), this.organizationId()).run()

    // check for publicKey
    if (!organization.publicKey()) {
      const error = new Error(`oops, can't find orgpublickey for [@${this.slug()}]`)
      error.help = '? try running [dotenvx pro sync]'
      throw error
    }

    const pushedFilepaths = []
    for (const envFilepath of this._envFilepaths()) {
      const filepath = path.resolve(envFilepath)

      // file must exist
      if (!fs.existsSync(filepath)) {
        throw new Errors({ filename: envFilepath, filepath }).missingEnvFile()
      }

      // get keypairs
      const keypairs = new Keypair(envFilepath).run()

      // publicKey must exist
      const publicKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PUBLIC_KEY'))
      const publicKey = keypairs[publicKeyName]
      if (!publicKey) {
        const error = new Error(`oops, could not locate ${publicKeyName}`)
        error.help = `? generate ${publicKeyName} (.env.keys) with [dotenvx encrypt]`
        throw error
      }

      // privateKey
      const privateKeyName = Object.keys(keypairs).find(key => key.startsWith('DOTENV_PRIVATE_KEY'))
      const privateKey = keypairs[privateKeyName]
      const privateKeyEncryptedWithOrganizationPublicKey = organization.encrypt(privateKey)

      // filepath
      const relativeFilepath = path.relative(gitRoot(), path.join(process.cwd(), this.directory, envFilepath)).replace(/\\/g, '/') // smartly determine path/to/.env file from repository root - where user is cd-ed inside a folder or at repo root

      // text
      const text = fs.readFileSync(filepath, 'utf8')

      await new PostPush(this.hostname, current.token(), 'github', organization.publicKey(), this.usernameName(), relativeFilepath, publicKeyName, privateKeyName, publicKey, privateKeyEncryptedWithOrganizationPublicKey, text).run()

      // sync org
      await new SyncOrganization(this.hostname, current.token(), this.organizationId()).run()

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

      pushedFilepaths.push(relativeFilepath)
    }

    return pushedFilepaths
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
      const error = new Error(`oops, can't find organization [@${this.slug()}]`)
      error.help = '? try running [dotenvx pro sync] or joining organization [dotenvx pro settings orgconnect]'

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

module.exports = Push

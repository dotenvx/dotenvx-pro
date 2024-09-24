const Conf = require('conf')

const current = require('./current')
const UserPrivateKey = require('./userPrivateKey')

const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')

class Organization {
  constructor (organizationId = current.organizationId()) {
    this.hostfolder = current.hostfolder()
    this.userId = current.id()
    this.organizationId = organizationId

    if (!this.userId) {
      throw new Error('missing user. Log in with [dotenvx pro login].')
    }

    if (!this.organizationId) {
      throw new Error('missing organization. Try running [dotenvx pro sync].')
    }

    this.store = new Conf({
      cwd: process.env.DOTENVX_CONFIG || undefined,
      projectName: 'dotenvx',
      configName: `${this.hostfolder}/user-${this.userId}-organization-${this.organizationId}`,
      projectSuffix: '',
      fileExtension: 'json'
    })
  }

  configPath () {
    return this.store.path
  }

  id () {
    return this.store.get('id')
  }

  slug () {
    return this.store.get('slug')
  }

  publicKey () {
    return this.store.get('public_key/1')
  }

  privateKeyEncrypted () {
    return this.store.get(`user/${this.userId}/private_key_encrypted/1`)
  }

  privateKey () {
    const value = this.privateKeyEncrypted()

    if (!value || value.length < 1) {
      return ''
    }

    const userPrivateKey = new UserPrivateKey()

    return decryptValue(value, userPrivateKey.privateKey())
  }

  encrypt (value) {
    return encryptValue(value, this.publicKey())
  }

  userIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      // user/2/username
      const match = key.match(/^user\/(\d+)\/username/)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add user id
      }
    }

    return ids
  }

  userIdsMissingPrivateKeyEncrypted () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      // user/2/private_key_encrypted
      const match = key.match(/^user\/(\d+)\/private_key_encrypted/)

      if (match && json[key] == null) {
        ids.push(match[1]) // add user id
      }
    }

    return ids
  }
}

module.exports = Organization

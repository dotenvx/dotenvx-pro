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
    return this.organizationId
  }

  slug () {
    return this.store.get('slug')
  }

  publicKey () {
    return this.store.get('public_key/1')
  }

  privateKeyEncrypted () {
    return this.store.get(`u/${this.userId}/ek/1`)
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

  decrypt (value) {
    return decryptValue(value, this.privateKey())
  }

  userIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      // u/2/uu (user/2/username)
      const match = key.match(/^u\/(\d+)\/uu/)

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
      // u/2/ek (user/2/private_key_encrypted)
      const match = key.match(/^u\/(\d+)\/ek/)

      if (match && json[key] == null) {
        ids.push(match[1]) // add user id
      }
    }

    return ids
  }

  repositoryIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      // r/2/uun (repository/2/username_name)
      const match = key.match(/^r\/(\d+)\/unn/)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add repository id
      }
    }

    return ids
  }

  envFileIds (repositoryId) {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      // r/2/e/3/f (repository/2/env_file/3/filepath)
      const regex = new RegExp(`^r/${repositoryId}/e/(\\d+)/f`)
      const match = key.match(regex)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add env file id
      }
    }

    return ids
  }

  lookups () {
    const h = {}

    for (const repositoryId of this.repositoryIds()) {
      const usernameName = this.store.get(`r/${repositoryId}/unn`)
      h[`lookup/repositoryIdByUsernameName/${usernameName}`] = repositoryId

      for (const envFileId of this.envFileIds(repositoryId)) {
        const filepath = this.store.get(`r/${repositoryId}/e/${envFileId}/f`)
        h[`lookup/envFileIdByUsernameNameFilepath/${usernameName}/${filepath}`] = envFileId
      }
    }

    return h
  }
}

module.exports = Organization

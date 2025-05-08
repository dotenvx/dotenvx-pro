const Conf = require('conf')
const { PrivateKey } = require('eciesjs')
const bip39 = require('bip39')

const Errors = require('../lib/helpers/errors')
const encryptValue = require('./../lib/helpers/encryptValue')

const current = require('./current')
const Organization = require('./organization')
const Device = require('./device')
const UserPrivateKey = require('./userPrivateKey')

class User {
  constructor (userId = current.id()) {
    this.userId = userId
    this.hostfolder = current.hostfolder()

    if (!this.userId) {
      const error = new Errors().loginRequired()
      throw error
    }

    this.store = new Conf({
      cwd: process.env.DOTENVX_CONFIG || undefined,
      projectName: 'dotenvx',
      configName: `${this.hostfolder}/user-${this.userId}`,
      projectSuffix: '',
      fileExtension: 'json'
    })
  }

  configPath () {
    return this.store.path
  }

  username () {
    return this.store.get('username')
  }

  emergencyKitGeneratedAt () {
    return this.store.get('emergency_kit_generated_at')
  }

  privateKey () {
    // user current device
    const device = new Device()

    // lookup user data by publicKey
    const devicePublicKey = device.publicKey()
    const deviceId = this.lookups()[`lookup/deviceIdByPublicKey/${devicePublicKey}`]
    const userPrivateKeyEncrypted = this.store.get(`device/${deviceId}/user_private_key_encrypted/1`)
    if (userPrivateKeyEncrypted) {
      const decryptedUserPrivateKey = device.decrypt(userPrivateKeyEncrypted)
      return decryptedUserPrivateKey
    }

    // fallback to old userPrivateKey method TODO: remove this someday
    const userPrivateKey = new UserPrivateKey()
    return userPrivateKey.privateKey()
  }

  publicKey () {
    // must have private key to try and get public key
    const privateKeyHex = this.privateKey()
    if (!privateKeyHex || privateKeyHex.length < 1) {
      return ''
    }

    // create keyPair object from hex string
    const _privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

    return _privateKey.publicKey.toHex()
  }

  recoveryPhrase () {
    // must have private key to try and get public key
    const privateKeyHex = this.privateKey()
    if (!privateKeyHex || privateKeyHex.length < 1) {
      return ''
    }

    return bip39.entropyToMnemonic(privateKeyHex)
  }

  encrypt (value) {
    return encryptValue(value, this.publicKey())
  }

  deviceIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      const match = key.match(/^device\/(\d+)\/public_key/)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add device id
      }
    }

    return ids
  }

  devices () {
    const c = []

    const json = this.store.store
    for (const deviceId of this.deviceIds()) {
      const o = {
        id: deviceId,
        publicKey: json[`device/${deviceId}/public_key/1`],
        userPrivateKeyEncrypted: json[`device/${deviceId}/user_private_key_encrypted/1`],
      }

      c.push(o)
    }

    return c
  }

  organizationIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      const match = key.match(/^organization\/(\d+)\/private_key_encrypted/)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add organization id
      }
    }

    return ids
  }

  organizations () {
    const c = []

    for (const organizationId of this.organizationIds()) {
      const o = new Organization(organizationId)

      c.push(o)
    }

    return c
  }

  lookups () {
    let h = {}

    for (const device of this.devices()) {
      h[`lookup/deviceIdByPublicKey/${device.publicKey}`] = device.id
    }

    for (const organization of this.organizations()) {
      h[`lookup/organizationIdBySlug/${organization.slug()}`] = organization.id()

      h = { ...h, ...organization.lookups() }
    }

    return h
  }
}

module.exports = User

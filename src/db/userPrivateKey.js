const Conf = require('conf')
const { PrivateKey } = require('eciesjs')
const bip39 = require('bip39')

const current = require('./current')
const encryptValue = require('./../lib/helpers/encryptValue')
const Errors = require('./../lib/helpers/errors')

class UserPrivateKey {
  constructor (userId = current.id()) {
    this.userId = userId
    this.hostfolder = current.hostfolder()

    if (!this.userId) {
      throw new Errors().loginRequired()
    }

    this.store = new Conf({
      cwd: process.env.DOTENVX_CONFIG || undefined,
      projectName: 'dotenvx',
      configName: `${this.hostfolder}/user-${this.userId}-private-key`,
      projectSuffix: '',
      fileExtension: 'json',
      encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
    })
  }

  configPath () {
    return this.store.path
  }

  publicKey () {
    // must have private key to try and get public key
    const privateKeyHex = this.privateKey()
    if (!privateKeyHex || privateKeyHex.length < 1) {
      return ''
    }

    // create keyPair object from hex string
    const _privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

    // compute publicKey from privateKey
    return _privateKey.publicKey.toHex()
  }

  privateKey () {
    // must have id to try and lazily generate private key
    const _id = this.userId
    if (!_id || _id.length < 1) {
      return ''
    }

    const currentPrivateKey = this.store.get('private_key/1')
    if (currentPrivateKey && currentPrivateKey.length > 0) {
      this.store.set('private_key/1', currentPrivateKey)

      return currentPrivateKey
    }

    // generate privateKey for the first time
    const kp = new PrivateKey()
    const _privateKey = kp.secret.toString('hex')

    this.store.set('private_key/1', _privateKey)

    return _privateKey
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

  recover (privateKeyHex) {
    // must have id to try and lazily generate private key
    const _id = this.userId
    if (!_id || _id.length < 1) {
      return ''
    }

    this.store.set('private_key/1', privateKeyHex)

    return privateKeyHex
  }
}

module.exports = UserPrivateKey

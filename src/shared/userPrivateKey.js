const Conf = require('conf')
const { logger } = require('@dotenvx/dotenvx')
const { PrivateKey } = require('eciesjs')
const bip39 = require('bip39')

const currentUser = require('./currentUser')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')
const parseUsernameFromFullUsername = require('./helpers/parseUsernameFromFullUsername')

let _store

function initializeConfStore () {
  if (!currentUser.id()) {
    logger.error('[unauthorized] please log in with [dotenvx pro login]')
    process.exit(1)
  }

  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: `${currentUser.hostfolder()}/user-${currentUser.id()}-private-key`,
    projectSuffix: '',
    fileExtension: 'json',
    encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
  })
}

// Ensure store is initialized before accessing it
function store () {
  if (!_store) {
    initializeConfStore()
  }
  return _store
}

const configPath = function () {
  return store().path
}

const publicKey = function () {
  // must have private key to try and get public key
  const privateKeyHex = privateKey()
  if (!privateKeyHex || privateKeyHex.length < 1) {
    return ''
  }

  // create keyPair object from hex string
  const _privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

  // compute publicKey from privateKey
  return _privateKey.publicKey.toHex()
}

const privateKey = function () {
  // must have id to try and lazily generate private key
  const _id = currentUser.id()
  if (!_id || _id.length < 1) {
    return ''
  }

  const currentPrivateKey = store().get('private_key/1')
  if (currentPrivateKey && currentPrivateKey.length > 0) {
    store().set('private_key/1', currentPrivateKey)

    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const _privateKey = kp.secret.toString('hex')

  store().set('private_key/1', _privateKey)

  return _privateKey
}

const recoveryPhrase = function () {
  // must have private key to try and get public key
  const privateKeyHex = privateKey()
  if (!privateKeyHex || privateKeyHex.length < 1) {
    return ''
  }

  return bip39.entropyToMnemonic(privateKeyHex)
}

const encrypt = function (value) {
  return encryptValue(value, publicKey())
}

const recover = function (privateKeyHex) {
  // must have id to try and lazily generate private key
  const _id = currentUser.id()
  if (!_id || _id.length < 1) {
    return ''
  }

  store().set('private_key/1', privateKeyHex)

  return privateKeyHex
}

module.exports = {
  store,
  configPath,
  publicKey,
  privateKey,
  recoveryPhrase,
  encrypt,
  recover,
}

const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const extractSubdomainAndDomain = require('./helpers/extractSubdomainAndDomain')

let _store

function initializeConfStore () {
  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: '.env',
    projectSuffix: '',
    fileExtension: '',
    serialize: function (json) {
      return jsonToEnv(json)
    },
    // Convert .env format to an object
    deserialize: function (env) {
      return dotenv.parse(env)
    }
  })
}

// Ensure _store is initialized before accessing it
function store () {
  if (!_store) {
    initializeConfStore()
  }
  return _store
}

const configPath = function () {
  return store().path
}

//
// Set/Delete
//
const login = function (hostname, id, accessToken) {
  if (!hostname) {
    throw new Error('DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  if (!id) {
    throw new Error('DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().set('DOTENVX_PRO_HOSTNAME', hostname)
  store().set('DOTENVX_PRO_CURRENT_USER', id)
  store().set('DOTENVX_PRO_TOKEN', accessToken)

  return accessToken
}

const logout = function (hostname, id, accessToken) {
  if (!hostname) {
    throw new Error('DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  if (!id) {
    throw new Error('DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().delete('DOTENVX_PRO_HOSTNAME')
  store().delete('DOTENVX_PRO_CURRENT_USER')
  store().delete('DOTENVX_PRO_TOKEN')

  return true
}

const recover = function (privateKeyHex) {
  const key = 'DOTENVX_PRO_CURRENT_PRIVATE_KEY'

  store().set(key, privateKeyHex)

  return privateKeyHex
}

//
// Get
//
const hostname = function () {
  return store().get('DOTENVX_PRO_HOSTNAME') || 'https://pro.dotenvx.com'
}

const hostfolder = function () {
  const _hostname = hostname()

  return extractSubdomainAndDomain(_hostname)
}

const token = function () {
  return store().get('DOTENVX_PRO_TOKEN') || ''
}

const id = function () {
  return store().get('DOTENVX_PRO_CURRENT_USER') || ''
}

const privateKey = function () {
  // must have id to try and lazily generate private key
  const _id = id()
  if (!_id || _id.length < 1) {
    return ''
  }

  const key = 'DOTENVX_PRO_CURRENT_PRIVATE_KEY'
  const memoryKey = `DOTENVX_PRO_USER_${_id}_PRIVATE_KEY`
  const currentPrivateKey = store().get(key) || store().get(memoryKey)

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    store().set(key, currentPrivateKey)
    store().set(memoryKey, currentPrivateKey)

    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const _privateKey = kp.secret.toString('hex')

  store().set(key, _privateKey)
  store().set(memoryKey, _privateKey)

  return _privateKey
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

const recoveryPhrase = function () {
  // must have private key to try and get public key
  const privateKeyHex = privateKey()
  if (!privateKeyHex || privateKeyHex.length < 1) {
    return ''
  }

  return bip39.entropyToMnemonic(privateKeyHex)
}

module.exports = {
  store,
  configPath,

  // Set/Delete
  login,
  logout,
  recover,

  // Get
  hostname,
  hostfolder,
  token,
  id,
  publicKey,
  privateKey,
  recoveryPhrase
}

const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const extractSubdomainAndDomain = require('./helpers/extractSubdomainAndDomain')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')

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
  store().delete('DOTENVX_PRO_CURRENT_ORGANIZATION')
  store().delete('DOTENVX_PRO_TOKEN')

  return true
}

const linkOrganization = function (_organizationId, privateKeyEncrypted) {
  if (!_organizationId) {
    throw new Error('organizationId is required. Try running [dotenvx pro sync]')
  }

  if (!privateKeyEncrypted) {
    throw new Error('privateKeyEncrypted is required. Try running [dotenvx pro sync]')
  }

  const key = `DOTENVX_PRO_ORGANIZATION_${_organizationId}_PRIVATE_KEY_ENCRYPTED`
  store().set(key, privateKeyEncrypted)

  return privateKeyEncrypted
}

const chooseOrganization = function (_organizationId) {
  if (!_organizationId) {
    throw new Error('DOTENVX_PRO_CURRENT_ORGANIZATION not set. Run [dotenvx pro organizations choose]')
  }

  store().set('DOTENVX_PRO_CURRENT_ORGANIZATION', _organizationId)

  return _organizationId
}

const recover = function (privateKeyHex) {
  // must have id to try and lazily generate private key
  const _id = id()
  if (!_id || _id.length < 1) {
    return ''
  }

  const key = `DOTENVX_PRO_USER_${_id}_PRIVATE_KEY`

  store().set(key, privateKeyHex)

  return privateKeyHex
}

const encrypt = function (value) {
  return encryptValue(value, publicKey())
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

const organizationId = function () {
  return store().get('DOTENVX_PRO_CURRENT_ORGANIZATION') || ''
}

const privateKey = function () {
  // must have id to try and lazily generate private key
  const _id = id()
  if (!_id || _id.length < 1) {
    return ''
  }

  const key = `DOTENVX_PRO_USER_${_id}_PRIVATE_KEY`
  const currentPrivateKey = store().get(key)

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    store().set(key, currentPrivateKey)

    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const _privateKey = kp.secret.toString('hex')

  store().set(key, _privateKey)

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

const organizationPrivateKey = function (_organizationId) {
  // must have organizationId
  if (!_organizationId) {
    return ''
  }

  const key = `DOTENVX_PRO_ORGANIZATION_${_organizationId}_PRIVATE_KEY_ENCRYPTED`
  const value = store().get(key)

  if (!value || value.length < 1) {
    return ''
  }

  return decryptValue(value, privateKey())
}

const organizationPublicKey = function (_organizationId) {
  // must have private key to try and get public key
  const privateKeyHex = organizationPrivateKey(_organizationId)
  if (!privateKeyHex || privateKeyHex.length < 1) {
    return ''
  }

  // create keyPair object from hex string
  const _privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

  // compute publicKey from privateKey
  return _privateKey.publicKey.toHex()
}

module.exports = {
  store,
  configPath,

  // Set/Delete
  login,
  logout,
  recover,
  encrypt,

  // Get
  hostname,
  hostfolder,
  token,
  id,
  organizationId,
  publicKey,
  privateKey,
  recoveryPhrase,

  // organization
  organizationPublicKey,
  organizationPrivateKey,
  linkOrganization,
  chooseOrganization
}

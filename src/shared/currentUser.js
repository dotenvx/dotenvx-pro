const Conf = require('conf')
const { PrivateKey } = require('eciesjs')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const extractSubdomainAndDomain = require('./helpers/extractSubdomainAndDomain')
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
    throw new Error('DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().set('DOTENVX_PRO_USER', id)
  store().set('DOTENVX_PRO_TOKEN', accessToken)
  store().set('DOTENVX_PRO_HOSTNAME', hostname)

  return accessToken
}

const logout = function (hostname, id, accessToken) {
  if (!hostname) {
    throw new Error('DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  if (!id) {
    throw new Error('DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().delete('DOTENVX_PRO_USER')
  store().delete('DOTENVX_PRO_TOKEN')
  store().delete('DOTENVX_PRO_HOSTNAME')
  store().delete('DOTENVX_PRO_CURRENT_ORGANIZATION')

  return true
}

const linkOrganization = function (_organizationId, privateKeyEncrypted) {
  if (!_organizationId) {
    throw new Error('organizationId is required. Try running [dotenvx pro sync]')
  }

  if (!privateKeyEncrypted) {
    throw new Error('privateKeyEncrypted is required. Try running [dotenvx pro sync]')
  }

  const key = `DOTENVX_PRO_USER_${id()}_ORGANIZATION_${_organizationId}_PRIVATE_KEY_ENCRYPTED`
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
  return store().get('DOTENVX_PRO_USER') || ''
}

const organizationId = function () {
  return store().get('DOTENVX_PRO_CURRENT_ORGANIZATION') || ''
}

const organizationPrivateKey = function (_organizationId) {
  // must have organizationId
  if (!_organizationId) {
    return ''
  }

  const key = `DOTENVX_PRO_USER_${id()}_ORGANIZATION_${_organizationId}_PRIVATE_KEY_ENCRYPTED`
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

  // Get
  hostname,
  hostfolder,
  token,
  id,
  organizationId,

  // organization
  organizationPublicKey,
  organizationPrivateKey,
  linkOrganization,
  chooseOrganization
}

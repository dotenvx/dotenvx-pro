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
// Set
//
const setUser = function (hashid, accessToken) {
  if (!hashid) {
    throw new Error('DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().set('DOTENVX_PRO_CURRENT_USER', hashid)
  store().set('DOTENVX_PRO_TOKEN', accessToken)

  return accessToken
}

const setHostname = function (hostname) {
  store().set('DOTENVX_PRO_HOSTNAME', hostname)

  return hostname
}

//
// Delete
//
const logout = function () {
  store().delete('DOTENVX_PRO_TOKEN')
  store().delete('DOTENVX_PRO_CURRENT_USER')
  store().delete('DOTENVX_PRO_HOSTNAME')

  return true
}

//
// Get
//
const getHostname = function () {
  return store().get('DOTENVX_PRO_HOSTNAME') || 'https://pro.dotenvx.com'
}

const getHostfolder = function () {
  const hostname = getHostname()

  return extractSubdomainAndDomain(hostname)
}

const getToken = function () {
  return store().get('DOTENVX_PRO_TOKEN')
}

const getHashid = function () {
  const hashid = store().get('DOTENVX_PRO_CURRENT_USER')

  if (!hashid) {
    throw new Error('DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  return hashid
}

const getPrivateKey = function () {
  const key = `DOTENVX_PRO_USER_${getHashid()}_PRIVATE_KEY`

  const currentPrivateKey = store().get(key)

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const privateKey = kp.secret.toString('hex')

  store().set(key, privateKey)

  return privateKey
}

const getPublicKey = function () {
  // create keyPair object from hex string
  const privateKeyHex = getPrivateKey()
  const privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

  // compute publicKey from privateKey
  return privateKey.publicKey.toHex()
}

const getRecoveryPhrase = function () {
  const privateKeyHex = getPrivateKey()

  return bip39.entropyToMnemonic(privateKeyHex)
}

module.exports = {
  store,
  configPath,

  // Set
  setUser,
  setHostname,

  // Delete
  logout,

  // Get
  getHostname,
  getHostfolder,
  getToken,
  getHashid,
  getPrivateKey,
  getPublicKey,
  getRecoveryPhrase
}

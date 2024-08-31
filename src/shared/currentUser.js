const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const extractSubdomainAndDomain = require('./helpers/extractSubdomainAndDomain')

const confStore = new Conf({
  projectName: 'dotenvx',
  configName: '.env',
  // looks better on user's machine
  // https://github.com/sindresorhus/conf/tree/v10.2.0#projectsuffix.
  projectSuffix: '',
  fileExtension: '',
  // encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro',
  // in the spirit of dotenv and format inherently puts limits on config complexity
  serialize: function (json) {
    return jsonToEnv(json)
  },
  // Convert .env format to an object
  deserialize: function (env) {
    return dotenv.parse(env)
  }
})

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

  confStore.set('DOTENVX_PRO_CURRENT_USER', hashid)
  confStore.set('DOTENVX_PRO_TOKEN', accessToken)

  return accessToken
}

const setHostname = function (hostname) {
  confStore.set('DOTENVX_PRO_HOSTNAME', hostname)

  return hostname
}

//
// Delete
//
const logout = function () {
  confStore.delete('DOTENVX_PRO_TOKEN')
  confStore.delete('DOTENVX_PRO_CURRENT_USER')
  confStore.delete('DOTENVX_PRO_HOSTNAME')

  return true
}

//
// Get
//
const getHostname = function () {
  return confStore.get('DOTENVX_PRO_HOSTNAME') || 'https://pro.dotenvx.com'
}

const getHostfolder = function () {
  const hostname = getHostname()

  return extractSubdomainAndDomain(hostname)
}

const getToken = function () {
  return confStore.get('DOTENVX_PRO_TOKEN')
}

const getHashid = function () {
  const hashid = confStore.get('DOTENVX_PRO_CURRENT_USER')

  if (!hashid) {
    throw new Error('DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  return hashid
}

const getPrivateKey = function () {
  const key = `DOTENVX_PRO_USER_${getHashid()}_PRIVATE_KEY`

  const currentPrivateKey = confStore.get(key)

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const privateKey = kp.secret.toString('hex')

  confStore.set(key, privateKey)

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

//
// Other
//
const configPath = function () {
  return confStore.path
}

module.exports = {
  confStore,
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
  getRecoveryPhrase,
  configPath
}

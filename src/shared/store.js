const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const parseUsernameFromFullUsername = require('./helpers/parseUsernameFromFullUsername')
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
const setUser = function (fullUsername, accessToken, hashid) {
  // current logged in user
  confStore.set('DOTENVX_PRO_TOKEN', accessToken)
  confStore.set('DOTENVX_PRO_FULL_USERNAME', fullUsername)
  confStore.set('DOTENVX_PRO_HASHID', hashid)

  return accessToken
}

const setHostname = function (hostname) {
  confStore.set('DOTENVX_PRO_HOSTNAME', hostname)

  return hostname
}

// used for recovery only - see getPrivateKey for first-time onboarding
const setPrivateKey = function (privateKey) {
  confStore.set('DOTENVX_PRO_PRIVATE_KEY', privateKey)

  return privateKey
}

//
// Delete
//
const deleteToken = function () {
  confStore.delete('DOTENVX_PRO_TOKEN')

  return true
}

const deleteHostname = function () {
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

const getTokenShort = function () {
  return (getToken() || '').slice(0, 11)
}

const getHashid = function () {
  return confStore.get('DOTENVX_PRO_HASHID')
}

const getFullUsername = function () {
  return confStore.get('DOTENVX_PRO_FULL_USERNAME')
}

const getUsername = function () {
  const key = getFullUsername()

  if (key) {
    return parseUsernameFromFullUsername(key)
  } else {
    return null
  }
}

const getPrivateKey = function () {
  const currentPrivateKey = confStore.get('DOTENVX_PRO_PRIVATE_KEY')

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const privateKey = kp.secret.toString('hex')

  confStore.set('DOTENVX_PRO_PRIVATE_KEY', privateKey)

  return privateKey
}

const getPrivateKeyShort = function () {
  return getPrivateKey().slice(0, 7)
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
  setPrivateKey,
  // Delete
  deleteToken,
  deleteHostname,
  // Get
  getHostname,
  getHostfolder,
  getToken,
  getTokenShort,
  getHashid,
  getUsername,
  getFullUsername,
  getPrivateKey,
  getPrivateKeyShort,
  getPublicKey,
  getRecoveryPhrase,
  configPath
}

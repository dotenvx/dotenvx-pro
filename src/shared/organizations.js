const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')

const confStore = new Conf({
  projectName: 'dotenvx',
  configName: 'organizations',
  // looks better on user's machine
  // https://github.com/sindresorhus/conf/tree/v10.2.0#projectsuffix.
  projectSuffix: '',
  fileExtension: 'json'
  // encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
})

//
// Set
//
const setOrganization = function (hashid, privateKey) {
  const payload = {
    privateKey
  }
  confStore.set(hashid, payload)

  return payload
}

//
// Get
//
const getPrivateKey = function (hashid) {
  const currentPrivateKey = confStore.get([hashid, 'privateKey'])

  if (currentPrivateKey && currentPrivateKey.length > 0) {
    return currentPrivateKey
  }

  // generate privateKey for the first time
  const kp = new PrivateKey()
  const privateKey = kp.secret.toString('hex')

  confStore.set(hashid, { privateKey })

  return privateKey
}

const getPrivateKeyShort = function (hashid) {
  return getPrivateKey(hashid).slice(0, 7)
}

const getPublicKey = function (hashid) {
  // create keyPair object from hex string
  const privateKeyHex = getPrivateKey(hashid)
  const privateKey = new PrivateKey(Buffer.from(privateKeyHex, 'hex'))

  // compute publicKey from privateKey
  return privateKey.publicKey.toHex()
}

const getRecoveryPhrase = function (hashid) {
  const privateKeyHex = getPrivateKey(hashid)

  return bip39.entropyToMnemonic(privateKeyHex)
}

module.exports = {
  confStore,

  // Set
  setOrganization,
  // Get
  getPrivateKey,
  getPrivateKeyShort,
  getPublicKey,
  getRecoveryPhrase
}

const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')

const coreStore = require('./store')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')

const confStore = new Conf({
  projectName: 'dotenvx',
  configName: `${coreStore.getHostfolder()}/db`,
  // looks better on user's machine
  // https://github.com/sindresorhus/conf/tree/v10.2.0#projectsuffix.
  projectSuffix: '',
  fileExtension: 'json'
  // encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
})

//
// Set
//
const setUserOrganizationPrivateKey = function (hashid, organizationHashid, privateKey) {
  const key = `user/${hashid}/organization/${organizationHashid}/organization_private_key_encrypted_with_user_public_key`

  const publicKey = coreStore.getPublicKey()
  const encryptedValue = encryptValue(privateKey, publicKey)

  console.log('encryptedValue', encryptedValue)

  confStore.set(key, encryptedValue)

  return privateKey
}

const setSync = function (syncData) {
  // iterate over each key and set it
  for (const key in syncData) {
    const value = syncData[key]

    confStore.set(key, value)
  }

  // should i handle deletes?

  return syncData
}

//
// Get
//
const getUserPublicKey = function (hashid) {
  const key = `user/${hashid}/public_key`

  return confStore.get(key)
}

const getOrganizationPrivateKey = function (hashid) {
  // 1. get current user's privateKey
  const privateKey = coreStore.getPrivateKey()
  const userHashid = coreStore.getHashid()

  if (!privateKey || !userHashid) {
    return null
  }

  // 2. use that to grab the encrypted organization private key
  const key = `user/${userHashid}/organization/${hashid}/organization_private_key_encrypted_with_user_public_key`
  const organizationPrivateKeyEncrypted = confStore.get(key)

  if (!organizationPrivateKeyEncrypted) {
    return null
  }

  // 3. decrypt it
  const decryptedValue = decryptValue(organizationPrivateKeyEncrypted, privateKey)

  return decryptedValue
}

const getJson = function () {
  const j = {}
  for (const key in confStore.store) {
    const value = confStore.store[key]

    j[key] = value

    // for null values
    if (!value && key.includes('organization_private_key_encrypted_with_user_public_key')) {

      // use regex to extract user_id and organization_id
      const pattern = /^user\/([^\/]+)\/organization\/([^\/]+)\/.*$/
      const match = key.match(pattern)
      if (match) {
        const userHashid = match[1]
        const organizationHashid = match[2]

        const usersPublicKey = getUserPublicKey(userHashid)
        console.log('usersPublicKey', usersPublicKey)

        const currentUserHashid = 'implement' // IMPLEMENT

        const organizationPrivateKey = getOrganizationPrivateKey(currentUserHashid, organizationHashid)
        console.log('organizationPrivateKey', organizationPrivateKey)

        // find user's publicKey
        // find org's privateKey

        // const encryptedValue = encryptValue(privateKey, publicKey)
        // j[key] = encryptedValue
      }
    }
  }

  return j

  // get the confStore.store
  // iterate over any null keys and smartly populate them if possible
  //   1. organization_private_key_encrypted_with_user_public_key
  //   2. if seen, and if the associated org public_key exists
  //   3. and if the associated user public_key exists then attempt to replace null with a value
}

module.exports = {
  confStore,

  // Set
  setSync,
  setUserOrganizationPrivateKey,

  // Get
  getJson,
}

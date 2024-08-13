const Conf = require('conf')
const { logger } = require('./logger')

const coreStore = require('./store')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')
const parseUsernameFromFullUsername = require('./helpers/parseUsernameFromFullUsername')

let confStore

function initializeConfStore () {
  if (!coreStore.getHashid()) {
    logger.error('[unauthorized] please log in with [dotenvx pro login]')
    process.exit(1)
  }

  confStore = new Conf({
    projectName: 'dotenvx',
    configName: `${coreStore.getHostfolder()}/${coreStore.getHashid()}/db`,
    projectSuffix: '',
    fileExtension: 'json'
    // encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
  })
}

// Ensure confStore is initialized before accessing it
function getConfStore () {
  if (!confStore) {
    initializeConfStore()
  }
  return confStore
}

//
// Set
//
const setUserOrganizationPrivateKey = function (hashid, organizationHashid, privateKey) {
  const key = `user/${hashid}/organization/${organizationHashid}/organization_private_key_encrypted_with_user_public_key`

  const publicKey = coreStore.getPublicKey()
  const encryptedValue = encryptValue(privateKey, publicKey)

  console.log('encryptedValue', encryptedValue)

  getConfStore().set(key, encryptedValue)

  return privateKey
}

const setUser = function (hashid, fullUsername) {
  const key = `user/${hashid}/full_username`

  getConfStore().set(key, fullUsername)

  return hashid
}

const setSync = function (syncData) {
  // iterate over each key and set it
  for (const key in syncData) {
    const value = syncData[key]

    getConfStore().set(key, value)
  }

  // should i handle deletes?

  return syncData
}

//
// Get
//
const getCurrentUserHashid = function () {
  return coreStore.getHashid()
}

const getUserPublicKey = function (hashid) {
  const key = `user/${hashid}/public_key`

  return getConfStore().get(key)
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
  const organizationPrivateKeyEncrypted = getConfStore().get(key)

  if (!organizationPrivateKeyEncrypted) {
    return null
  }

  // 3. decrypt it
  const decryptedValue = decryptValue(organizationPrivateKeyEncrypted, privateKey)

  return decryptedValue
}

const getCurrentUserFullUsername = function () {
  const key = `user/${getCurrentUserHashid()}/full_username`

  return getConfStore().get(key)
}

const getCurrentUserUsername = function () {
  const key = getCurrentUserFullUsername()

  if (key) {
    return parseUsernameFromFullUsername(key)
  } else {
    return null
  }
}

const getJson = function () {
  const j = {}
  for (const key in getConfStore().store) {
    const value = getConfStore().store[key]

    j[key] = value

    // for null values
    if (!value && key.includes('organization_private_key_encrypted_with_user_public_key')) {
      // use regex to extract user_id and organization_id
      const pattern = /^user\/([^/]+)\/organization\/([^/]+)\/.*$/
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
}

module.exports = {
  confStore,

  // Set
  setUser,
  setSync,
  setUserOrganizationPrivateKey,

  // Get
  getCurrentUserHashid,
  getCurrentUserUsername,
  getCurrentUserFullUsername,
  getJson
}

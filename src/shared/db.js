const Conf = require('conf')
const { logger } = require('./logger')

const currentUser = require('./currentUser')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')
const parseUsernameFromFullUsername = require('./helpers/parseUsernameFromFullUsername')

let confStore

function initializeConfStore () {
  if (!currentUser.getHashid()) {
    logger.error('[unauthorized] please log in with [dotenvx pro login]')
    process.exit(1)
  }

  confStore = new Conf({
    projectName: 'dotenvx',
    configName: `${currentUser.getHostfolder()}/${currentUser.getHashid()}/db`,
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

const configPath = function () {
  return getConfStore().path
}

//
// Set
//
const setUserOrganizationPrivateKey = function (hashid, organizationHashid, privateKey) {
  const publicKey = getUserPublicKey(hashid)
  const encryptedValue = encryptValue(privateKey, publicKey)

  const key = `user/${hashid}/organization/${organizationHashid}/organization_private_key_encrypted_with_user_public_key`
  getConfStore().set(key, encryptedValue)

  return encryptedValue
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
  return currentUser.getHashid()
}

const getUserPublicKey = function (hashid) {
  if (currentUser.getHashid() === hashid) {
    return currentUser.getPublicKey()
  } else {
    const key = `user/${hashid}/public_key`
    return getConfStore().get(key)
  }
}

const getOrganizationPrivateKey = function (organizationHashid) {
  // 1. get current user's privateKey
  const privateKey = currentUser.getPrivateKey()
  const userHashid = currentUser.getHashid()

  if (!privateKey || !userHashid) {
    return null
  }

  // 2. use that to grab the encrypted organization private key
  const findKey = `user/${userHashid}/organization/${organizationHashid}/organization_private_key_encrypted_with_user_public_key`
  const organizationPrivateKeyEncrypted = getConfStore().get(findKey)

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
        const organizationPrivateKey = getOrganizationPrivateKey(organizationHashid)

        if (organizationPrivateKey) {
          const organizationPrivateKeyEncryptedWithUserPublicKey = setUserOrganizationPrivateKey(userHashid, organizationHashid, organizationPrivateKey)
          j[key] = organizationPrivateKeyEncryptedWithUserPublicKey
        }
      }
    }
  }

  return j
}

module.exports = {
  getConfStore,
  configPath,

  // Set
  setUser,
  setSync,
  setUserOrganizationPrivateKey,

  // Get
  getCurrentUserHashid,
  getUserPublicKey,
  getCurrentUserUsername,
  getCurrentUserFullUsername,
  getJson
}

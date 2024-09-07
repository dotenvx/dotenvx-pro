const Conf = require('conf')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./currentUser')
const encryptValue = require('./../lib/helpers/encryptValue')
const decryptValue = require('./../lib/helpers/decryptValue')
const parseUsernameFromFullUsername = require('./helpers/parseUsernameFromFullUsername')

let _store

function initializeConfStore () {
  if (!currentUser.getId()) {
    logger.error('[unauthorized] please log in with [dotenvx pro login]')
    process.exit(1)
  }

  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: `${currentUser.getHostfolder()}/${currentUser.getId()}/db`,
    projectSuffix: '',
    fileExtension: 'json'
    // encryptionKey: 'dotenvxpro dotenvxpro dotenvxpro'
  })
}

// Ensure store is initialized before accessing it
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
const setUserOrganizationPrivateKey = function (id, organizationId, privateKey) {
  const publicKey = getUserPublicKey(id)
  const encryptedValue = encryptValue(privateKey, publicKey)

  const key = `user/${id}/organization/${organizationId}/organization_private_key_encrypted_with_user_public_key`
  store().set(key, encryptedValue)

  return encryptedValue
}

const setSync = function (syncData) {
  // iterate over each key and set it
  for (const key in syncData) {
    const value = syncData[key]

    store().set(key, value)
  }

  // should i handle deletes?

  return syncData
}

//
// Get
//
const getUserPublicKey = function (id) {
  if (currentUser.getId() === id) {
    return currentUser.getPublicKey()
  } else {
    const key = `user/${id}/public_key`
    return store().get(key)
  }
}

const getOrganizationPrivateKey = function (organizationId) {
  // 1. get current user's privateKey
  const privateKey = currentUser.getPrivateKey()
  const userId = currentUser.getId()

  if (!privateKey || !userId) {
    return null
  }

  // 2. use that to grab the encrypted organization private key
  const findKey = `user/${userId}/organization/${organizationId}/organization_private_key_encrypted_with_user_public_key`
  const organizationPrivateKeyEncrypted = store().get(findKey)

  if (!organizationPrivateKeyEncrypted) {
    return null
  }

  // 3. decrypt it
  const decryptedValue = decryptValue(organizationPrivateKeyEncrypted, privateKey)

  return decryptedValue
}

const getCurrentUserFullUsername = function () {
  const key = `user/${currentUser.getId()}/full_username`

  return store().get(key)
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
  for (const key in store().store) {
    const value = store().store[key]

    j[key] = value

    // for null values
    if (!value && key.includes('organization_private_key_encrypted_with_user_public_key')) {
      // use regex to extract user_id and organization_id
      const pattern = /^user\/([^/]+)\/organization\/([^/]+)\/.*$/
      const match = key.match(pattern)
      if (match) {
        const userId = match[1]
        const organizationId = match[2]
        const organizationPrivateKey = getOrganizationPrivateKey(organizationId)

        if (organizationPrivateKey) {
          const organizationPrivateKeyEncryptedWithUserPublicKey = setUserOrganizationPrivateKey(userId, organizationId, organizationPrivateKey)
          j[key] = organizationPrivateKeyEncryptedWithUserPublicKey
        }
      }
    }
  }

  return j
}

module.exports = {
  store,
  configPath,

  // Set
  setSync,
  setUserOrganizationPrivateKey,

  // Get
  getUserPublicKey,
  getCurrentUserUsername,
  getCurrentUserFullUsername,
  getJson
}

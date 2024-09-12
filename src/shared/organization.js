const Conf = require('conf')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./currentUser')
const userPrivateKey = require('./userPrivateKey')

const decryptValue = require('./../lib/helpers/decryptValue')

let _store

function initializeConfStore () {
  if (!currentUser.id()) {
    logger.error('[unauthorized] please log in with [dotenvx pro login]')
    process.exit(1)
  }

  if (!currentUser.organizationId()) {
    logger.error('organization is not set')
    process.exit(1)
  }

  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: `${currentUser.hostfolder()}/user-${currentUser.id()}-organization-${currentUser.organizationId()}`,
    projectSuffix: '',
    fileExtension: 'json'
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

const id = function () {
  return store().get('id')
}

const slug = function () {
  return store().get('slug')
}

const publicKey = function () {
  return store().get('public_key/1')
}

const privateKeyEncrypted = function () {
  return store().get(`user/${currentUser.id()}/private_key_encrypted/1`)
}

const privateKey = function () {
  const value = privateKeyEncrypted()

  if (!value || value.length < 1) {
    return ''
  }

  return decryptValue(value, userPrivateKey.privateKey())
}

const userIds = function () {
  const ids = []

  const json = store().store
  for (const key in json) {
    // user/2/username
    const match = key.match(/^user\/(\d+)\/username/)

    if (match && json[key] !== undefined) {
      ids.push(match[1]) // add user id
    }
  }

  return ids
}

const userIdsMissingPrivateKeyEncrypted = function () {
  const ids = []

  const json = store().store
  for (const key in json) {
    // user/2/private_key_encrypted
    const match = key.match(/^user\/(\d+)\/private_key_encrypted/)

    if (match && json[key] == null) {
      ids.push(match[1]) // add user id
    }
  }

  return ids
}

module.exports = {
  store,
  configPath,
  id,
  slug,
  publicKey,
  privateKeyEncrypted,
  privateKey,
  userIds,
  userIdsMissingPrivateKeyEncrypted
}

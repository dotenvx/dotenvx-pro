const Conf = require('conf')
const bip39 = require('bip39')
const { PrivateKey } = require('eciesjs')

const coreStore = require('./store')

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
const setUserPublicKey = function (hashid, publicKey) {
  const key = `user/${hashid}/public_key`

  confStore.set(key, publicKey)

  return publicKey
}

const setUserOrganizationIds = function (hashid, organizationIds) {
  const key = `user/${hashid}/organization_ids`

  confStore.set(key, organizationIds)

  return organizationIds
}

const setOrganizationPublicKey = function (hashid, publicKey) {
  const key = `organization/${hashid}/public_key`

  confStore.set(key, publicKey)

  return publicKey
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

module.exports = {
  confStore,

  // Set
  setSync,
  setUserPublicKey,
  setUserOrganizationIds,
  setOrganizationPublicKey,
}

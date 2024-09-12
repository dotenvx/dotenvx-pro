const Conf = require('conf')

const current = require('./current')

let _store

function initializeConfStore () {
  if (!current.id()) {
    console.error('missing user. Log in with [dotenvx pro login].')
    process.exit(1)
  }

  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: `${current.hostfolder()}/user-${current.id()}`,
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

const username = function () {
  return store().get('username')
}

const emergencyKitGeneratedAt = function () {
  return store().get('emergency_kit_generated_at')
}

const organizationIds = function () {
  const ids = []

  const json = store().store
  for (const key in json) {
    const match = key.match(/^organization\/(\d+)\/private_key_encrypted/)

    if (match && json[key] !== undefined) {
      ids.push(match[1]) // add organization id
    }
  }

  return ids
}

module.exports = {
  store,
  configPath,
  username,
  emergencyKitGeneratedAt,
  organizationIds
}

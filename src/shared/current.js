const Conf = require('conf')
const dotenv = require('dotenv')

const jsonToEnv = require('./helpers/jsonToEnv')
const extractSubdomainAndDomain = require('./helpers/extractSubdomainAndDomain')

let _store

function initializeConfStore () {
  _store = new Conf({
    cwd: process.env.DOTENVX_CONFIG || undefined,
    projectName: 'dotenvx',
    configName: '.env',
    projectSuffix: '',
    fileExtension: '',
    serialize: function (json) {
      return jsonToEnv(json)
    },
    // Convert .env format to an object
    deserialize: function (env) {
      return dotenv.parse(env)
    }
  })
}

// Ensure _store is initialized before accessing it
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
// Set/Delete
//
const login = function (hostname, id, accessToken) {
  if (!hostname) {
    throw new Error('DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  if (!id) {
    throw new Error('DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().set('DOTENVX_PRO_USER', id)
  store().set('DOTENVX_PRO_TOKEN', accessToken)
  store().set('DOTENVX_PRO_HOSTNAME', hostname)

  return accessToken
}

const selectOrganization = function (_organizationId) {
  if (!_organizationId) {
    throw new Error('DOTENVX_PRO_ORGANIZATION not set. Run [dotenvx pro settings orgselect]')
  }

  store().set('DOTENVX_PRO_ORGANIZATION', _organizationId)

  return _organizationId
}

const logout = function (hostname, id, accessToken) {
  if (!hostname) {
    throw new Error('DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  if (!id) {
    throw new Error('DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  if (!accessToken) {
    throw new Error('DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  store().delete('DOTENVX_PRO_USER')
  store().delete('DOTENVX_PRO_TOKEN')
  store().delete('DOTENVX_PRO_HOSTNAME')
  store().delete('DOTENVX_PRO_ORGANIZATION')

  return true
}

//
// Get
//
const hostname = function () {
  return store().get('DOTENVX_PRO_HOSTNAME') || 'https://pro.dotenvx.com'
}

const hostfolder = function () {
  const _hostname = hostname()

  return extractSubdomainAndDomain(_hostname)
}

const token = function () {
  return store().get('DOTENVX_PRO_TOKEN') || ''
}

const id = function () {
  return store().get('DOTENVX_PRO_USER') || ''
}

const organizationId = function () {
  return store().get('DOTENVX_PRO_ORGANIZATION') || ''
}

module.exports = {
  store,
  configPath,

  // Set/Delete
  login,
  selectOrganization,
  logout,

  // Get
  hostname,
  hostfolder,
  token,
  id,
  organizationId
}

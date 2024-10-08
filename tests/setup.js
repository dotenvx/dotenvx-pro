const fs = require('fs')
const os = require('os')
const path = require('path')

const current = require('../src/db/current')
const User = require('../src/db/user')
const UserPrivateKey = require('../src/db/userPrivateKey')
const Organization = require('../src/db/organization')

const HOSTNAME = 'http://example.com'
const ID = 1
const ORGANIZATION_ID = 99
const TOKEN = 'dxo_1234'
const ME = {
  id: 1,
  token: 'dxo_40KZWsg658R4inMVXSNZSGe61Ri9Lo3dPCuy',
  hostname: 'http://localhost:3000',
  username: 'motdotla',
  'public_key/1': '02f4da02c08394d2ee665d571642a6caaf2ca1df93b4d9e02ba8b3571a06f254cf',
  emergency_kit_generated_at: null,
  'organization/99/private_key_encrypted/1': 'BHL5Nvc426sKAsptOVpZUK/RKaD3BfT9swV2d09wBHvtLKA1rQ9ab9NQOVQP2QW7hhMoudbSdECRATu4XHRN9W2God9oWiltvJs9reyGP3LPsQnLEY6WAPmmLsr2iBe+cYW8hCiBAdQHN3FTJtteoVECGsq0rQ4HCbeHkyqduMdEMaEVHzqY1bfLiqSahJOCfPQdJ5rsb78g1Nml4CHY8Y4='
}
const USER_PRIVATE_KEY = {
  'private_key/1': '9b1e733825f5b959242bb45a15c9156efdd877acb22342472baf772968c4a17e'
}

const ORGANIZATION = {
  id: 99,
  slug: 'dotenvx',
  'public_key/1': '03dffdcf05b41663081005c6b6fcf8d05b3b723d9672a504bf72a727ca34e7d59f',
  'u/1/un': 'motdotla',
  'u/1/pk/1': '02f4da02c08394d2ee665d571642a6caaf2ca1df93b4d9e02ba8b3571a06f254cf',
  'u/1/ek/1': 'BHL5Nvc426sKAsptOVpZUK/RKaD3BfT9swV2d09wBHvtLKA1rQ9ab9NQOVQP2QW7hhMoudbSdECRATu4XHRN9W2God9oWiltvJs9reyGP3LPsQnLEY6WAPmmLsr2iBe+cYW8hCiBAdQHN3FTJtteoVECGsq0rQ4HCbeHkyqduMdEMaEVHzqY1bfLiqSahJOCfPQdJ5rsb78g1Nml4CHY8Y4=',
  'r/1/unn': 'dotenvx/app1',
  'r/1/e/1/f': '.env',
  'r/1/e/1/pkn': 'DOTENV_PUBLIC_KEY',
  'r/1/e/1/pk/1': '020666fa64c3e4ea8f7cc6ee48ef56641ecb7ed5cb829016066dd4dfd7ce05f5e3',
  'r/1/e/1/ekn': 'DOTENV_PRIVATE_KEY',
  'r/1/e/1/ek/1': 'BPKfcmDGm4iuOcGC49o85C6u695RTveHsh74fDzqIBOp5iVXaui7nigaqf9W18faTy46NBXRSpKcVjb35Bz+9vML+Fbh66efWzS9XyI4tzmWM2rgrXZP7J6hI227GTe2f9nRTlKanHezRSd4hM0oesnbMTy0N85mFnAZdt0ank2VuQQNqboQV9ld7yQnBIIfdj3lH7FSqeVtUuns5gMYlvU=',
  'r/1/e/2/f': '.env.production',
  'r/1/e/2/pkn': 'DOTENV_PUBLIC_KEY_PRODUCTION',
  'r/1/e/2/pk/1': '03d3c4466f712579a38b012406a1bdbef5c0b66410a358dd61bfc2af9af11e2915',
  'r/1/e/2/ekn': 'DOTENV_PRIVATE_KEY_PRODUCTION',
  'r/1/e/2/ek/1': 'BFRCNb+o5gjD5ivVIw1c+/hsT/hAYMEYfYGJSuvcCC1k2vv+WQIib5xpjzRyfbhCASG5brB8QBn2ab6lQrQ3+br2G6asfj+S38D58AtWRuOu8l0VyCb1+ZWAPo2wvPTDHmQkfXRk6bP6Z+0jZpuZQV9zhvjBs5qrLU9ddSurSpyuZpcwI4BGHTrbLs1Fdj/ay7UfFIpiyTRwOYglATJquJo='
}

module.exports = (t) => {
  t.beforeEach(ct => {
    // Create a temporary directory for DOTENVX_CONFIG
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotenvx-pro-conf-'))

    // Clear process.env and set DOTENVX_CONFIG to the temp directory
    process.env = {}
    process.env.DOTENVX_CONFIG = tempDir

    // set up current
    current.login(HOSTNAME, ID, TOKEN)
    current.selectOrganization(ORGANIZATION_ID)

    // set up user
    const user = new User(ID)
    user.store.store = ME

    // set up userPrivateKey
    const userPrivateKey = new UserPrivateKey(ID)
    userPrivateKey.store.store = USER_PRIVATE_KEY

    // set up organization
    const organization = new Organization(ORGANIZATION_ID)
    organization.store.store = ORGANIZATION
  })

  t.afterEach(ct => {
  })
}

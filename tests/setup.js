const fs = require('fs')
const os = require('os')
const path = require('path')

const current = require('../src/db/current')

const HOSTNAME = 'http://example.com'
const ID = 1
const ORGANIZATION_ID = 99
const TOKEN = 'dxo_1234'

module.exports = (t) => {
  t.beforeEach(ct => {
    // Create a temporary directory for DOTENVX_CONFIG
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotenvx-pro-conf-'))

    // Clear process.env and set DOTENVX_CONFIG to the temp directory
    process.env = {}
    process.env.DOTENVX_CONFIG = tempDir

    current.login(HOSTNAME, ID, TOKEN)
    current.selectOrganization(ORGANIZATION_ID)
  })

  t.afterEach(ct => {
  })
}

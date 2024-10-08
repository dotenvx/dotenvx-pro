const t = require('tap')
require('../setup')(t)

const current = require('../../src/db/current')

const HOSTNAME = 'http://example.com'
const ID = 1
const TOKEN = 'dxo_1234'

t.beforeEach((ct) => {
})

t.test('#configPath', ct => {
  ct.ok(current.configPath().endsWith('.env'))

  ct.end()
})

t.test('#hostname', ct => {
  ct.equal(current.hostname(), 'http://example.com')

  ct.end()
})

t.test('#hostname (when no hostname)', ct => {
  current.store().delete('DOTENVX_PRO_HOSTNAME')

  ct.equal(current.hostname(), 'https://pro.dotenvx.com')

  ct.end()
})

t.test('#hostfolder', ct => {
  ct.equal(current.hostfolder(), 'example.com')

  ct.end()
})

t.test('#hostfolder', ct => {
  ct.equal(current.hostfolder(), 'example.com')

  ct.end()
})

t.test('#token', ct => {
  ct.equal(current.token(), 'dxo_1234')

  ct.end()
})

t.test('#token (missing)', ct => {
  current.store().delete('DOTENVX_PRO_TOKEN')

  ct.equal(current.token(), '')

  ct.end()
})

t.test('#id', ct => {
  ct.equal(current.id(), '1')

  ct.end()
})

t.test('#id (missing)', ct => {
  current.store().delete('DOTENVX_PRO_USER')

  ct.equal(current.id(), '')

  ct.end()
})

t.test('#id', ct => {
  ct.equal(current.id(), '1')

  ct.end()
})

t.test('#organizationId', ct => {
  ct.equal(current.organizationId(), '99')

  ct.end()
})

t.test('#organizationId (missing)', ct => {
  current.store().delete('DOTENVX_PRO_ORGANIZATION')

  ct.equal(current.organizationId(), '')

  ct.end()
})

t.test('#login (missing hostname)', ct => {
  try {
    current.login()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#login (missing id)', ct => {
  try {
    current.login(HOSTNAME)

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#login (missing accessToken)', ct => {
  try {
    current.login(HOSTNAME, ID)

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#login', ct => {
  current.login(HOSTNAME, ID, TOKEN)

  ct.equal(current.store().get('DOTENVX_PRO_USER'), '1')
  ct.equal(current.store().get('DOTENVX_PRO_TOKEN'), 'dxo_1234')
  ct.equal(current.store().get('DOTENVX_PRO_HOSTNAME'), 'http://example.com')

  ct.end()
})

t.test('#logout (missing hostname)', ct => {
  try {
    current.logout()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_HOSTNAME not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#logout (missing id)', ct => {
  try {
    current.logout(HOSTNAME)

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_USER not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#logout (missing accessToken)', ct => {
  try {
    current.logout(HOSTNAME, ID)

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#logout', ct => {
  current.logout(HOSTNAME, ID, TOKEN)

  ct.equal(current.store().get('DOTENVX_PRO_USER'), undefined)
  ct.equal(current.store().get('DOTENVX_PRO_TOKEN'), undefined)
  ct.equal(current.store().get('DOTENVX_PRO_HOSTNAME'), undefined)

  ct.end()
})

t.test('#selectOrganization (missing id)', ct => {
  try {
    current.selectOrganization()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_ORGANIZATION not set. Run [dotenvx pro settings orgselect]')
  }

  ct.end()
})

t.test('#selectOrganization', ct => {
  current.selectOrganization(88)

  ct.equal(current.store().get('DOTENVX_PRO_ORGANIZATION'), '88')

  ct.end()
})

const t = require('tap')
require('../setup')(t)

const sinon = require('sinon')

const current = require('../../src/db/current')
const Organization = require('../../src/db/organization')

const decryptValue = require('../../src/lib/helpers/decryptValue')

let org

t.beforeEach((ct) => {
  org = new Organization()
})

t.test('constructor missing userId', ct => {
  const originalUserId = current.id()

  try {
    current.store().delete('DOTENVX_PRO_USER')

    // eslint-disable-next-line no-new
    new Organization('')

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'missing user. Log in with [dotenvx pro login].')
  }

  current.store().set('DOTENVX_PRO_USER', originalUserId)

  ct.end()
})

t.test('constructor missing organizationId', ct => {
  try {
    // eslint-disable-next-line no-new
    new Organization('')

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'missing organization. Try running [dotenvx pro sync].')
  }

  ct.end()
})

t.test('#configPath', ct => {
  ct.ok(org.configPath().endsWith('.json'))

  ct.end()
})

t.test('#id', ct => {
  ct.same(org.id(), '99')

  ct.end()
})

t.test('#slug', ct => {
  ct.same(org.slug(), 'dotenvx')

  ct.end()
})

t.test('#publicKey', ct => {
  ct.same(org.publicKey(), '03dffdcf05b41663081005c6b6fcf8d05b3b723d9672a504bf72a727ca34e7d59f')

  ct.end()
})

t.test('#privateKeyEncrypted', ct => {
  ct.same(org.privateKeyEncrypted(), 'BHL5Nvc426sKAsptOVpZUK/RKaD3BfT9swV2d09wBHvtLKA1rQ9ab9NQOVQP2QW7hhMoudbSdECRATu4XHRN9W2God9oWiltvJs9reyGP3LPsQnLEY6WAPmmLsr2iBe+cYW8hCiBAdQHN3FTJtteoVECGsq0rQ4HCbeHkyqduMdEMaEVHzqY1bfLiqSahJOCfPQdJ5rsb78g1Nml4CHY8Y4=')

  ct.end()
})

t.test('#privateKey', ct => {
  ct.same(org.privateKey(), '0b754aae965afa21b631f24ee113167736bc8ea6a17b39a720ec7ffd23499841')

  ct.end()
})

t.test('#privateKey (missing privateKeyEncrypted)', ct => {
  sinon.stub(org, 'privateKeyEncrypted').returns('')

  ct.same(org.privateKey(), '')

  sinon.restore()

  ct.end()
})

t.test('#encrypt', ct => {
  const encrypted = org.encrypt('hello')

  const decrypted1 = decryptValue(encrypted, '0b754aae965afa21b631f24ee113167736bc8ea6a17b39a720ec7ffd23499841')
  const decrypted2 = decryptValue(encrypted, org.privateKey())
  const decrypted3 = org.decrypt(encrypted)

  ct.same(decrypted1, 'hello')
  ct.same(decrypted2, 'hello')
  ct.same(decrypted3, 'hello')

  ct.end()
})

t.test('#userIds', ct => {
  ct.same(org.userIds(), ['1'])

  ct.end()
})

t.test('#userIdsMissingPrivateKeyEncrypted', ct => {
  ct.same(org.userIdsMissingPrivateKeyEncrypted(), [])

  ct.end()
})

t.test('#userIdsMissingPrivateKeyEncrypted (when not found)', ct => {
  org.store.set('u/1/ek/1', null)

  ct.same(org.userIdsMissingPrivateKeyEncrypted(), ['1'])

  ct.end()
})

t.test('#repositoryIds', ct => {
  ct.same(org.repositoryIds(), ['1'])

  ct.end()
})

t.test('#envFileIds', ct => {
  ct.same(org.envFileIds(1), ['1', '2'])

  ct.end()
})

t.test('#lookups', ct => {
  ct.same(org.lookups(), {
    'lookup/repositoryIdByUsernameName/dotenvx/testing123': '1',
    'lookup/envFileIdByUsernameNameFilepath/dotenvx/testing123/.env': '1',
    'lookup/envFileIdByUsernameNameFilepath/dotenvx/testing123/.env.production': '2'
  })

  ct.end()
})

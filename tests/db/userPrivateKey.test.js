const t = require('tap')
require('../setup')(t)

const sinon = require('sinon')
const Conf = require('conf')

const UserPrivateKey = require('../../src/db/userPrivateKey')

const decryptValue = require('../../src/lib/helpers/decryptValue')

const HOSTNAME = 'http://example.com'
const ID = 1
const TOKEN = 'dxo_1234'

let inst

t.beforeEach((ct) => {
  inst = new UserPrivateKey()
})

t.test('constructor missing userId', ct => {
  try {
    new UserPrivateKey('')

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'missing user. Log in with [dotenvx pro login].')
  }

  ct.end()
})

t.test('#configPath', ct => {
  ct.ok(inst.configPath().endsWith('.json'))

  ct.end()
})

t.test('#publicKey', ct => {
  ct.ok(inst.publicKey())

  ct.end()
})

t.test('#publicKey (when privateKey is empty)', ct => {
  sinon.stub(inst, 'privateKey').returns('')

  ct.same(inst.publicKey(), '')

  ct.end()
})

t.test('#privateKey', ct => {
  ct.ok(inst.privateKey())

  ct.end()
})

t.test('#privateKey (when no userId)', ct => {
  inst.userId = ''

  ct.same(inst.privateKey(), '')

  ct.end()
})

t.test('#recoveryPhrase', ct => {
  ct.ok(inst.recoveryPhrase())

  ct.end()
})

t.test('#recoveryPhrase (when privateKey is empty)', ct => {
  sinon.stub(inst, 'privateKey').returns('')

  ct.same(inst.recoveryPhrase(), '')

  ct.end()
})

t.test('#encrypt', ct => {
  const encrypted = inst.encrypt('hello')
  const decrypted = decryptValue(encrypted, inst.privateKey())

  ct.same(decrypted, 'hello')

  ct.end()
})

t.test('#recover', ct => {
  inst.recover('some private key hex')

  ct.same(inst.store.get('private_key/1'), 'some private key hex')

  ct.end()
})

t.test('#recover (when userId is empty)', ct => {
  inst.userId = ''
  const result = inst.recover('some private key hex')
  ct.same(result, '')

  ct.end()
})

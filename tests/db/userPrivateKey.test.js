const t = require('tap')
require('../setup')(t)

const sinon = require('sinon')

const UserPrivateKey = require('../../src/db/userPrivateKey')

const decryptValue = require('../../src/lib/helpers/decryptValue')

let inst

t.beforeEach((ct) => {
  inst = new UserPrivateKey()
})

t.test('constructor missing userId', ct => {
  try {
    // eslint-disable-next-line no-new
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
  ct.same(inst.publicKey(), '02f4da02c08394d2ee665d571642a6caaf2ca1df93b4d9e02ba8b3571a06f254cf')

  ct.end()
})

t.test('#publicKey (when privateKey is empty)', ct => {
  sinon.stub(inst, 'privateKey').returns('')

  ct.same(inst.publicKey(), '')

  sinon.restore()

  ct.end()
})

t.test('#privateKey', ct => {
  ct.same(inst.privateKey(), '9b1e733825f5b959242bb45a15c9156efdd877acb22342472baf772968c4a17e')

  ct.end()
})

t.test('#privateKey (when no userId)', ct => {
  inst.userId = ''

  ct.same(inst.privateKey(), '')

  ct.end()
})

t.test('#privateKey (when one does not yet exist it creates one)', ct => {
  inst.store.set('private_key/1', null)

  ct.ok(inst.privateKey())

  ct.end()
})

t.test('#recoveryPhrase', ct => {
  ct.same(inst.recoveryPhrase(), 'only vicious sock episode fortune prosper mouse isolate foam purity earn target talk design ready dutch drastic deer type unusual notable girl magnet sheriff')

  ct.end()
})

t.test('#recoveryPhrase (when privateKey is empty)', ct => {
  sinon.stub(inst, 'privateKey').returns('')

  ct.same(inst.recoveryPhrase(), '')

  sinon.restore()

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

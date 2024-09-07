const t = require('tap')
const fs = require('fs')
const tmp = require('tmp')
const sinon = require('sinon')
const { PrivateKey } = require('eciesjs')

const currentUser = require('../../src/shared/currentUser')

let setStub
let deleteStub

const tmpDir = tmp.dirSync()

const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'

t.beforeEach((ct) => {
  process.env = {}
  process.env.DOTENVX_CONFIG = tmpDir.name

  sinon.restore()
  setStub = sinon.stub(currentUser.store(), 'set')
  deleteStub = sinon.stub(currentUser.store(), 'delete')

  // stub kp.secret.toString('hex')
  sinon.stub(PrivateKey.prototype, 'secret').get(() => Buffer.from(privateKey, 'hex'))
})

t.test('#configPath', ct => {
  const result = currentUser.configPath()

  ct.same(result, `${tmpDir.name}/.env`)

  ct.end()
})

t.test('confStore#serialize', ct => {
  setStub.restore() // restore so we can test real serialization

  currentUser.store().set('KEY', 'value')

  const result = currentUser.store().get('KEY')

  ct.same(result, 'value')

  ct.end()
})

t.test('#setUser', ct => {
  const result = currentUser.setUser('AAABBB', 'dxo_1234')

  ct.same(result, 'dxo_1234')
  ct.ok(setStub.calledWith('DOTENVX_PRO_TOKEN', 'dxo_1234'), 'set DOTENVX_PRO_TOKEN')
  ct.ok(setStub.calledWith('DOTENVX_PRO_CURRENT_USER', 'AAABBB'), 'set DOTENVX_PRO_CURRENT_USER')

  ct.end()
})

t.test('#setUser - undefined id', ct => {
  try {
    currentUser.setUser(undefined, 'dxo_1234')
    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#setUser - undefined accessToken', ct => {
  try {
    currentUser.setUser('AAABBB', undefined)
    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_TOKEN not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#setHostname', ct => {
  const result = currentUser.setHostname('http://localhost:3000')

  ct.same(result, 'http://localhost:3000')
  ct.ok(setStub.calledWith('DOTENVX_PRO_HOSTNAME', 'http://localhost:3000'), 'set DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#logout', ct => {
  const result = currentUser.logout()

  ct.same(result, true)
  ct.ok(deleteStub.calledWith('DOTENVX_PRO_TOKEN'), 'delete DOTENVX_PRO_TOKEN')
  ct.ok(deleteStub.calledWith('DOTENVX_PRO_CURRENT_USER'), 'delete DOTENVX_PRO_CURRENT_USER')
  ct.ok(deleteStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'delete DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#hostname', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns(undefined)

  const result = currentUser.hostname()

  ct.same(result, 'https://pro.dotenvx.com')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#hostname - custom', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns('http://localhost:3000')

  const result = currentUser.hostname()

  ct.same(result, 'http://localhost:3000')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#hostname', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns(undefined)

  const result = currentUser.hostname()

  ct.same(result, 'pro.dotenvx.com')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#getToken', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_TOKEN').returns('dxo_123456789')

  const result = currentUser.getToken()

  ct.same(result, 'dxo_123456789')
  ct.ok(getStub.calledWith('DOTENVX_PRO_TOKEN'), 'get DOTENVX_PRO_TOKEN')

  ct.end()
})

t.test('#id', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = currentUser.id()

  ct.same(result, 'AAABBB')
  ct.ok(getStub.calledWith('DOTENVX_PRO_CURRENT_USER'), 'get DOTENVX_PRO_CURRENT_USER')

  ct.end()
})

t.test('#id - without writing instead of stubbing', ct => {
  fs.writeFileSync(currentUser.configPath(), `DOTENVX_PRO_TOKEN="dxo_1234"
DOTENVX_PRO_HOSTNAME="http://pro.dotenvx.com"
DOTENVX_PRO_CURRENT_USER="AAABBB"`)

  const result = currentUser.id()

  ct.same(result, 'AAABBB')

  ct.end()
})

t.test('#privateKey - user exists and privateKey exists', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.privateKey()

  ct.same(result, privateKey)
  ct.ok(getStub.calledWith('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY'), 'get DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY')

  ct.end()
})

t.test('#privateKey - missing user', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  try {
    currentUser.privateKey()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#privateKey - missing privateKey then it generates it', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(undefined)

  const result = currentUser.privateKey()
  ct.same(result, privateKey)
  ct.ok(setStub.calledWith('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY', privateKey), 'set DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY')

  ct.end()
})

t.test('#publicKey', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.publicKey()

  ct.same(result, '034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e')
  ct.ok(getStub.called, 'confStore.get')

  ct.end()
})

t.test('#recoveryPhrase', ct => {
  const getStub = sinon.stub(currentUser.store(), 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.recoveryPhrase()

  ct.same(result, 'clutch only already insect forest summer brush actual maximum scorpion road tennis jar april across wrap satisfy same concert ecology finger concert nation alarm')
  ct.ok(getStub.called, 'confStore.get')

  ct.end()
})

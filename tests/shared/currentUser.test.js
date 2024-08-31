const t = require('tap')
const fs = require('fs')
const tmp = require('tmp')
const sinon = require('sinon')
const { PrivateKey } = require('eciesjs')

const currentUser = require('../../src/shared/currentUser')

let setStub
let deleteStub
let tmpFile

const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'

t.beforeEach((ct) => {
  sinon.restore()
  setStub = sinon.stub(currentUser.confStore, 'set')
  deleteStub = sinon.stub(currentUser.confStore, 'delete')

  // stub kp.secret.toString('hex')
  sinon.stub(PrivateKey.prototype, 'secret').get(() => Buffer.from(privateKey, 'hex'))

  tmpFile = tmp.fileSync()
  currentUser.confStore.path = tmpFile.name // /tmp path for testing
  fs.writeSync(tmpFile.fd, `DOTENVX_PRO_TOKEN="dxo_1234"
DOTENVX_PRO_FULL_USERNAME="gh/username"
DOTENVX_PRO_HOSTNAME="https://pro.dotenvx.com"`)
})

t.test('confStore#serialize', ct => {
  setStub.restore() // restore so we can test real serialization

  currentUser.confStore.set('KEY', 'value')

  const result = currentUser.confStore.get('KEY')

  ct.same(result, 'value')

  ct.end()
})

t.test('#getHostname', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns(undefined)

  const result = currentUser.getHostname()

  ct.same(result, 'https://pro.dotenvx.com')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#getHostname - custom', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns('http://localhost:3000')

  const result = currentUser.getHostname()

  ct.same(result, 'http://localhost:3000')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#getHostfolder', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_HOSTNAME').returns(undefined)

  const result = currentUser.getHostfolder()

  ct.same(result, 'pro.dotenvx.com')
  ct.ok(getStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'get DOTENVX_PRO_HOSTNAME')

  ct.end()
})

t.test('#getToken', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_TOKEN').returns('dxo_123456789')

  const result = currentUser.getToken()

  ct.same(result, 'dxo_123456789')
  ct.ok(getStub.calledWith('DOTENVX_PRO_TOKEN'), 'get DOTENVX_PRO_TOKEN')

  ct.end()
})

t.test('#getHashid', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = currentUser.getHashid()

  ct.same(result, 'AAABBB')
  ct.ok(getStub.calledWith('DOTENVX_PRO_CURRENT_USER'), 'get DOTENVX_PRO_CURRENT_USER')

  ct.end()
})

t.test('#getPrivateKey - user exists and privateKey exists', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.getPrivateKey()

  ct.same(result, privateKey)
  ct.ok(getStub.calledWith('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY'), 'get DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY')

  ct.end()
})

t.test('#getPrivateKey - missing user', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  try {
    currentUser.getPrivateKey()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'DOTENVX_PRO_CURRENT_USER not set. Run [dotenvx pro login]')
  }

  ct.end()
})

t.test('#getPrivateKey - missing privateKey then it generates it', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(undefined)

  const result = currentUser.getPrivateKey()
  ct.same(result, privateKey)
  ct.ok(setStub.calledWith('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY', privateKey), 'set DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY')

  ct.end()
})

t.test('#getPublicKey', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.getPublicKey()

  ct.same(result, '034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e')
  ct.ok(getStub.called, 'confStore.get')

  ct.end()
})

t.test('#getRecoveryPhrase', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get')
  getStub.withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')
  getStub.withArgs('DOTENVX_PRO_USER_AAABBB_PRIVATE_KEY').returns(privateKey)

  const result = currentUser.getRecoveryPhrase()

  ct.same(result, 'clutch only already insect forest summer brush actual maximum scorpion road tennis jar april across wrap satisfy same concert ecology finger concert nation alarm')
  ct.ok(getStub.called, 'confStore.get')

  ct.end()
})

t.test('#configPath', ct => {
  const result = currentUser.configPath()

  ct.same(result, tmpFile.name)

  ct.end()
})

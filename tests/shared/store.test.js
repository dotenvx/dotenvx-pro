const t = require('tap')
const fs = require('fs')
const tmp = require('tmp')
const sinon = require('sinon')
const { PrivateKey } = require('eciesjs')

const store = require('../../src/shared/store')

let setStub
let deleteStub
let tmpFile

const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'

t.beforeEach((ct) => {
  sinon.restore()
  setStub = sinon.stub(store.confStore, 'set')
  deleteStub = sinon.stub(store.confStore, 'delete')

  // stub kp.secret.toString('hex')
  sinon.stub(PrivateKey.prototype, 'secret').get(() => Buffer.from(privateKey, 'hex'))

  tmpFile = tmp.fileSync()
  store.confStore.path = tmpFile.name // /tmp path for testing
  fs.writeSync(tmpFile.fd, `DOTENVX_PRO_TOKEN="dxo_1234"
DOTENVX_PRO_FULL_USERNAME="gh/username"
DOTENVX_PRO_HOSTNAME="https://pro.dotenvx.com"`)
})

t.test('confStore#serialize', ct => {
  setStub.restore() // restore so we can test real serialization

  store.confStore.set('KEY', 'value')

  const result = store.confStore.get('KEY')

  ct.same(result, 'value')

  ct.end()
})

// t.test('#setUser', ct => {
//   const result = store.setUser('gh/username', 'dxo_1234')
//
//   ct.same(result, 'dxo_1234')
//   ct.ok(setStub.calledWith('DOTENVX_PRO_TOKEN', 'dxo_1234'), 'set DOTENVX_PRO_TOKEN')
//   ct.ok(setStub.calledWith('DOTENVX_PRO_FULL_USERNAME', 'gh/username'), 'set DOTENVX_PRO_FULL_USERNAME')
//
//   ct.end()
// })
//
// t.test('#setHostname', ct => {
//   const result = store.setHostname('http://localhost:3000')
//
//   ct.same(result, 'http://localhost:3000')
//   ct.ok(setStub.calledWith('DOTENVX_PRO_HOSTNAME', 'http://localhost:3000'), 'set DOTENVX_PRO_HOSTNAME')
//
//   ct.end()
// })
//
// t.test('#setPrivateKey', ct => {
//   const result = store.setPrivateKey(privateKey)
//
//   ct.same(result, privateKey)
//   ct.ok(setStub.calledWith('DOTENVX_PRO_PRIVATE_KEY', privateKey), 'set DOTENVX_PRO_PRIVATE_KEY')
//
//   ct.end()
// })
//
// t.test('#deleteToken', ct => {
//   const result = store.deleteToken()
//
//   ct.same(result, true)
//   ct.ok(deleteStub.calledWith('DOTENVX_PRO_TOKEN'), 'delete DOTENVX_PRO_TOKEN')
//
//   ct.end()
// })
//
// t.test('#deleteHostname', ct => {
//   const result = store.deleteHostname()
//
//   ct.same(result, true)
//   ct.ok(deleteStub.calledWith('DOTENVX_PRO_HOSTNAME'), 'delete DOTENVX_PRO_HOSTNAME')
//
//   ct.end()
// })
//

t.test('#configPath', ct => {
  const result = store.configPath()

  ct.same(result, tmpFile.name)

  ct.end()
})

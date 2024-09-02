const t = require('tap')
const fs = require('fs')
const tmp = require('tmp')
const sinon = require('sinon')
const { PrivateKey } = require('eciesjs')

const decryptValue = require('../../src/lib/helpers/decryptValue')

let db
let setStub
let currentUser

const tmpDir = tmp.dirSync()

const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'
const organizationPrivateKey = '1fc1cafa954a7a2bf0a6fbff46189c9e03e3a66b4d1133108ab9fcdb9e154b70'

t.beforeEach((ct) => {
  process.env = {}
  process.env.DOTENVX_CONFIG = tmpDir.name

  db = require('../../src/shared/db')
  currentUser = require('../../src/shared/currentUser')

  fs.writeFileSync(currentUser.configPath(), `DOTENVX_PRO_TOKEN="dxo_1234"
DOTENVX_PRO_HOSTNAME="http://pro.dotenvx.com"
DOTENVX_PRO_CURRENT_USER="AAABBB"`)

  sinon.restore()
  setStub = sinon.stub(db.store(), 'set')
  sinon.stub(db.store(), 'delete')
  sinon.stub(currentUser.store(), 'set')
  sinon.stub(currentUser.store(), 'delete')

  // stub kp.secret.toString('hex')
  sinon.stub(PrivateKey.prototype, 'secret').get(() => Buffer.from(privateKey, 'hex'))

  fs.writeFileSync(db.configPath(), `{
    "user/AAABBB/public_key": "034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e",
    "user/AAABBB/full_username": "gh/motdotla",
    "user/CCCDDD/public_key": "02b106c30579baf896ae1fddf077cbcb4fef5e7d457932974878dcb51f42b45498"
  }`)
})

t.test('confStore#serialize', ct => {
  setStub.restore() // restore so we can test real serialization

  db.store().set('KEY', 'value')

  const result = db.store().get('KEY')

  ct.same(result, 'value')

  ct.end()
})

t.test('#configPath', ct => {
  const result = db.configPath()

  ct.same(result, `${tmpDir.name}/pro.dotenvx.com/AAABBB/db.json`)

  ct.end()
})

t.test('#getCurrentUserFullUsername', ct => {
  sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getCurrentUserFullUsername()

  ct.same(result, 'gh/motdotla')

  ct.end()
})

t.test('#getCurrentUserUsername', ct => {
  sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getCurrentUserUsername()

  ct.same(result, 'motdotla')

  ct.end()
})

t.test('#getUserPublicKey - current user', ct => {
  sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getUserPublicKey('AAABBB')

  ct.same(result, '034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e')

  ct.end()
})

t.test('#getUserPublicKey - other user', ct => {
  sinon.stub(currentUser.store(), 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getUserPublicKey('CCCDDD')

  ct.same(result, '02b106c30579baf896ae1fddf077cbcb4fef5e7d457932974878dcb51f42b45498')

  ct.end()
})

t.test('#setUser', ct => {
  const result = db.setUser('AAABBB', 'gh/motdotla')

  ct.same(result, 'AAABBB')
  ct.ok(setStub.calledWith('user/AAABBB/full_username', 'gh/motdotla'), 'set user/AAABBB/full_username')

  ct.end()
})

t.test('#setUserOrganizationPrivateKey', ct => {
  const result = db.setUserOrganizationPrivateKey('AAABBB', 'ORGORG', organizationPrivateKey)

  const decryptedResult = decryptValue(result, privateKey)

  ct.same(decryptedResult, organizationPrivateKey)
  ct.ok(setStub.calledWith('user/AAABBB/organization/ORGORG/organization_private_key_encrypted_with_user_public_key', result), 'set user/AAABBB/organization/ORGORG/organization_private_key_encrypted_with_user_public_key')

  ct.end()
})

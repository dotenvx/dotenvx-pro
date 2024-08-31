const t = require('tap')
const fs = require('fs')
const tmp = require('tmp')
const sinon = require('sinon')
const { PrivateKey } = require('eciesjs')

const db = require('../../src/shared/db')
const currentUser = require('../../src/shared/currentUser')

const decryptValue = require('../../src/lib/helpers/decryptValue')

let setStub
let deleteStub
let tmpFile

const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'
const organizationPrivateKey = '1fc1cafa954a7a2bf0a6fbff46189c9e03e3a66b4d1133108ab9fcdb9e154b70'

t.beforeEach((ct) => {
  sinon.restore()
  setStub = sinon.stub(db.getConfStore(), 'set')
  deleteStub = sinon.stub(db.getConfStore(), 'delete')

  // stub kp.secret.toString('hex')
  sinon.stub(PrivateKey.prototype, 'secret').get(() => Buffer.from(privateKey, 'hex'))

  tmpFile = tmp.fileSync()
  db.getConfStore().path = tmpFile.name // /tmp path for testing
  fs.writeSync(tmpFile.fd, `{
    "user/AAABBB/public_key": "034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e",
    "user/AAABBB/full_username": "gh/motdotla",
    "user/CCCDDD/public_key": "02b106c30579baf896ae1fddf077cbcb4fef5e7d457932974878dcb51f42b45498"
  }`)
})

t.test('confStore#serialize', ct => {
  setStub.restore() // restore so we can test real serialization

  db.getConfStore().set('KEY', 'value')

  const result = db.getConfStore().get('KEY')

  ct.same(result, 'value')

  ct.end()
})

t.test('#configPath', ct => {
  const result = db.configPath()

  ct.same(result, tmpFile.name)

  ct.end()
})

t.test('#getCurrentUserHashid', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getCurrentUserHashid()

  ct.same(result, 'AAABBB')

  ct.end()
})

t.test('#getCurrentUserFullUsername', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getCurrentUserFullUsername()

  ct.same(result, 'gh/motdotla')

  ct.end()
})

t.test('#getCurrentUserUsername', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getCurrentUserUsername()

  ct.same(result, 'motdotla')

  ct.end()
})

t.test('#getUserPublicKey - current user', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

  const result = db.getUserPublicKey('AAABBB')

  ct.same(result, '034ffa5eed0b1b7eec8df8f1c5332e93f672478f9637ba7f137f993ba62a30d45e')

  ct.end()
})

t.test('#getUserPublicKey - other user', ct => {
  const getStub = sinon.stub(currentUser.confStore, 'get').withArgs('DOTENVX_PRO_CURRENT_USER').returns('AAABBB')

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


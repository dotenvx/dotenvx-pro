const t = require('tap')
require('../setup')(t)

const Device = require('../../src/db/device')

let device

t.beforeEach((ct) => {
  device = new Device()
})

t.test('#configPath', ct => {
  ct.ok(device.configPath().includes('.device-key'))

  ct.end()
})

t.test('#touch', ct => {
  const result = device.touch()

  ct.type(result, 'object')
  ct.ok(result.privateKey)
  ct.ok(result.publicKey)
  ct.type(result.privateKey, 'string')
  ct.type(result.publicKey, 'string')

  ct.end()
})

t.test('#privateKey', ct => {
  const privateKey = device.privateKey()

  ct.type(privateKey, 'string')
  ct.ok(privateKey.length > 0)

  ct.end()
})

t.test('#privateKey (consistency)', ct => {
  const privateKey1 = device.privateKey()
  const privateKey2 = device.privateKey()

  ct.same(privateKey1, privateKey2)

  ct.end()
})

t.test('#publicKey', ct => {
  const publicKey = device.publicKey()

  ct.type(publicKey, 'string')
  ct.ok(publicKey.length > 0)

  ct.end()
})

t.test('#publicKey (consistency)', ct => {
  const publicKey1 = device.publicKey()
  const publicKey2 = device.publicKey()

  ct.same(publicKey1, publicKey2)

  ct.end()
})

t.test('#encrypt', ct => {
  const testValue = 'hello world'
  const encrypted = device.encrypt(testValue)

  ct.type(encrypted, 'string')
  ct.ok(encrypted.length > 0)
  ct.not(encrypted, testValue)

  ct.end()
})

t.test('#decrypt', ct => {
  const testValue = 'hello world'
  const encrypted = device.encrypt(testValue)
  const decrypted = device.decrypt(encrypted)

  ct.same(decrypted, testValue)

  ct.end()
})

t.test('#encrypt and #decrypt roundtrip', ct => {
  const testValues = [
    'simple string',
    'string with spaces',
    'string-with-dashes',
    'string_with_underscores',
    'StringWithCamelCase',
    '123456789',
    'special!@#$%^&*()characters',
    ''
  ]

  for (const value of testValues) {
    const encrypted = device.encrypt(value)
    const decrypted = device.decrypt(encrypted)
    ct.same(decrypted, value, `Failed roundtrip for value: "${value}"`)
  }

  ct.end()
})

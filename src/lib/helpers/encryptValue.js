const { encrypt } = require('eciesjs')

function encryptValue (value, publicKey) {
  const ciphertext = encrypt(publicKey, Buffer.from(value))

  return Buffer.from(ciphertext, 'hex').toString('base64') // base64 encode ciphertext
}

module.exports = encryptValue

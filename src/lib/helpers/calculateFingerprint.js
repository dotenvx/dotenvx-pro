const crypto = require('crypto')
const systemInformation = require('./systemInformation')

async function calculateFingerprint () {
  const info = await systemInformation()

  const hash = crypto.createHash('sha256')
  hash.update(JSON.stringify(info))

  return hash.digest('hex')
}

module.exports = calculateFingerprint

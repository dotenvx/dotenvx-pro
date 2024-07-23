const calculateFingerprint = require('./../../../lib/helpers/calculateFingerprint')

async function fingerprint () {
  const fp = await calculateFingerprint()

  process.stdout.write(fp)
}

module.exports = fingerprint

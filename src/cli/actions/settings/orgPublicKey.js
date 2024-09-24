const organizationDb = require('./../../../db/organization')

function orgPublicKey () {
  const publicKey = organizationDb.publicKey()
  if (publicKey) {
    process.stdout.write(publicKey)
  } else {
    console.error('missing public key. Try generating one with [dotenvx pro login].')
    process.exit(1)
  }
}

module.exports = orgPublicKey

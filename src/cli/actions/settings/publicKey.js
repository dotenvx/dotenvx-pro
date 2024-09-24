const userPrivateKey = require('./../../../db/userPrivateKey')

function publicKey () {
  const publicKey = userPrivateKey.publicKey()
  if (publicKey) {
    process.stdout.write(publicKey)
  } else {
    console.error('missing public key. Try generating one with [dotenvx pro login].')
    process.exit(1)
  }
}

module.exports = publicKey

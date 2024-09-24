const UserPrivateKey = require('./../../../db/userPrivateKey')

function publicKey () {
  try {
    const userPrivateKey = new UserPrivateKey()
    const publicKey = userPrivateKey.publicKey()

    if (publicKey) {
      process.stdout.write(publicKey)
    } else {
      console.error('missing public key. Try generating one with [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = publicKey

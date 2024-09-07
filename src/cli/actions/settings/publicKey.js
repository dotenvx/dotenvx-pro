const currentUser = require('./../../../shared/currentUser')

function publicKey () {
  const publicKey = currentUser.publicKey()
  if (publicKey) {
    process.stdout.write(publicKey)
  } else {
    console.error('missing public key. Try generating one with [dotenvx pro login].')
    process.exit(1)
  }
}

module.exports = publicKey

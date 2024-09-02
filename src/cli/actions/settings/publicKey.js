const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')

function publicKey () {
  const publicKey = currentUser.getPublicKey()
  if (publicKey) {
    process.stdout.write(publicKey)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = publicKey

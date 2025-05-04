const { logger } = require('@dotenvx/dotenvx')

const UserPrivateKey = require('./../../../db/userPrivateKey')

function publicKey () {
  try {
    const userPrivateKey = new UserPrivateKey()
    const publicKey = userPrivateKey.publicKey()

    if (publicKey) {
      process.stdout.write(publicKey)
    } else {
      logger.error('missing public key. Try generating one with [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = publicKey

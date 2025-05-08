const { logger } = require('@dotenvx/dotenvx')

const User = require('./../../../db/user')

function publicKey () {
  try {
    const user = new User()
    const publicKey = user.publicKey()

    if (publicKey && publicKey.length > 0) {
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

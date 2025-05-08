const { logger } = require('@dotenvx/dotenvx')

const User = require('./../../../db/user')
const smartMask = require('./../../../lib/helpers/smartMask')

function privateKey () {
  const options = this.opts()

  try {
    const user = new User()
    const privateKey = user.privateKey()

    if (privateKey && privateKey.length > 0) {
      process.stdout.write(smartMask(privateKey, options.unmask))
    } else {
      logger.error('missing private key. Try generating one with [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = privateKey

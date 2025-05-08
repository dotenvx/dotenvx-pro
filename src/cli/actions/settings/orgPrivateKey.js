const { logger } = require('@dotenvx/dotenvx')

const User = require('./../../../db/user')
const Organization = require('./../../../db/organization')
const smartMask = require('./../../../lib/helpers/smartMask')

function orgPrivateKey () {
  const options = this.opts()

  try {
    const user = new User()
    const organization = new Organization()
    const privateKey = organization.privateKey(user.privateKey())

    if (privateKey && privateKey.length > 0) {
      process.stdout.write(smartMask(privateKey, options.unmask))
    } else {
      logger.error('missing private key. Try running [dotenvx pro sync].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = orgPrivateKey

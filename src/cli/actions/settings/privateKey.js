const currentUser = require('./../../../shared/currentUser')
const { logger } = require('./../../../shared/logger')
const smartMask = require('./../../../lib/helpers/smartMask')

function privateKey () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const privateKey = currentUser.getPrivateKey()
  if (privateKey) {
    process.stdout.write(smartMask(privateKey, options.unmask))
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = privateKey

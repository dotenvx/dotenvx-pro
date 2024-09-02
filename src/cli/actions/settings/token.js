const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')
const smartMask = require('./../../../lib/helpers/smartMask')

function token () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  if (token) {
    process.stdout.write(smartMask(token, options.unmask, 11))
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = token

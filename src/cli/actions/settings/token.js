const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../../db/current')
const smartMask = require('./../../../lib/helpers/smartMask')

function token () {
  const options = this.opts()

  const token = current.token()
  if (token && token.length > 1) {
    process.stdout.write(smartMask(token, options.unmask, 11))
  } else {
    logger.error('missing token. Try generating one with [dotenvx pro login].')
    process.exit(1)
  }
}

module.exports = token

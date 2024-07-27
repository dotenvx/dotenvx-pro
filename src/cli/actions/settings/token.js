const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const mask = require('./../../../lib/helpers/mask')

function token () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = store.getToken()
  if (token) {
    let output = mask(token, 11)
    if (options.unmask) {
      output = token // unmask output
    }

    process.stdout.write(output)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = token

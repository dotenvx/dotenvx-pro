const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const mask = require('./../../../lib/helpers/mask')

function privateKey () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const privateKey = store.getPrivateKey()
  if (privateKey) {
    let output = mask(privateKey)
    if (options.unmask) {
      output = privateKey // unmask output
    }

    process.stdout.write(output)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = privateKey

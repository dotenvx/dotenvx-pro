const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')

function privateKey () {
  const privateKey = store.getPrivateKey()
  if (privateKey) {
    process.stdout.write(privateKey)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = privateKey

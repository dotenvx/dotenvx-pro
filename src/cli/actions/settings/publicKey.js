const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')

function publicKey () {
  const publicKey = store.getPublicKey()
  if (publicKey) {
    process.stdout.write(publicKey)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = publicKey

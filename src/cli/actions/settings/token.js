const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')

async function token () {
  const token = store.getToken()
  if (token) {
    process.stdout.write(token)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = token

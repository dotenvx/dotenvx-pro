const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')

async function status () {
  const username = store.getUsername()

  if (username) {
    logger.success(`logged in as ${username}`)
  } else {
    logger.info('logged out')
    logger.help('? to log in: [dotenvx pro login]')
  }
}

module.exports = status

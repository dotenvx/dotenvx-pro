const { logger } = require('@dotenvx/dotenvx')

const User = require('./../../../db/user')

async function username () {
  try {
    const user = new User()
    const username = user.username()

    if (username) {
      process.stdout.write(username)
    } else {
      logger.error('login required. Try running [dotenvx pro sync].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = username

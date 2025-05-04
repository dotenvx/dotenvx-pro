const { logger } = require('@dotenvx/dotenvx')

const Organization = require('./../../../db/organization')

function org () {
  try {
    const organization = new Organization()
    const slug = organization.slug()

    if (slug) {
      process.stdout.write(slug)
    } else {
      logger.error('missing slug. Try running [dotenvx pro sync].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = org

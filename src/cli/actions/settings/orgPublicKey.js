const Organization = require('./../../../db/organization')

function orgPublicKey () {
  try {
    const organization = new Organization()
    const publicKey = organization.publicKey()

    if (publicKey) {
      process.stdout.write(publicKey)
    } else {
      logger.error('missing public key. Try generating one with [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = orgPublicKey

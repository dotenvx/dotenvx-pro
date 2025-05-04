const UserPrivateKey = require('./../../../db/userPrivateKey')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')
const smartMaskRecoveryPhrase = require('./../../../lib/helpers/smartMaskRecoveryPhrase')

function recoveryPhrase () {
  const options = this.opts()

  try {
    const userPrivateKey = new UserPrivateKey()
    const recoveryPhrase = userPrivateKey.recoveryPhrase()

    if (recoveryPhrase && recoveryPhrase.length > 0) {
      process.stdout.write(formatRecoveryPhrase(smartMaskRecoveryPhrase(recoveryPhrase, options.unmask)))
    } else {
      logger.error('missing recovery phrase. Try generating one with [dotenvx pro login].')

      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = recoveryPhrase

const userPrivateKey = require('./../../../db/userPrivateKey')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')
const smartMaskRecoveryPhrase = require('./../../../lib/helpers/smartMaskRecoveryPhrase')

function recoveryPhrase () {
  const options = this.opts()

  const recoveryPhrase = userPrivateKey.recoveryPhrase()
  if (recoveryPhrase && recoveryPhrase.length > 0) {
    process.stdout.write(formatRecoveryPhrase(smartMaskRecoveryPhrase(recoveryPhrase, options.unmask)))
  } else {
    console.error('missing recovery phrase. Try generating one with [dotenvx pro login].')

    process.exit(1)
  }
}

module.exports = recoveryPhrase

const bip39 = require('bip39')

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')
const maskRecoveryPhrase = require('./../../../lib/helpers/maskRecoveryPhrase')

function recoveryPhrase () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const privateKey = store.getPrivateKey()
  if (privateKey) {
    let output = bip39.entropyToMnemonic(privateKey) // use privateKey as entropy

    if (!options.unmask) {
      output = maskRecoveryPhrase(output) // mask output
    }

    output = formatRecoveryPhrase(output)

    process.stdout.write(output)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = recoveryPhrase

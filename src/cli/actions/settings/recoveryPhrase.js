const bip39 = require('bip39')

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')

function recoveryPhrase () {
  const privateKey = store.getPrivateKey()
  if (privateKey) {
    const recoveryPhrase = bip39.entropyToMnemonic(privateKey) // use privateKey as entropy
    const formattedRecoveryPhrase = formatRecoveryPhrase(recoveryPhrase)

    process.stdout.write(formattedRecoveryPhrase)
  } else {
    logger.error('not found')

    process.exit(1)
  }
}

module.exports = recoveryPhrase

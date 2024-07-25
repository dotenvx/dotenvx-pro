const bip39 = require('bip39')

function convertRecoveryPhraseToPrivateKey (recoveryPhrase) {
  return bip39.mnemonicToEntropy(recoveryPhrase)
}

module.exports = convertRecoveryPhraseToPrivateKey

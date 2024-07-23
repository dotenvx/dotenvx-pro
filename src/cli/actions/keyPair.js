const bip39 = require('bip39')

const store = require('./../../shared/store')
const { logger } = require('./../../shared/logger')

const { PrivateKey } = require('eciesjs')

function keyPair () {
  const fullUsername = store.getFullUsername()

  if (fullUsername) {
    const privateKey = store.getPrivateKey()
    const publicKey = store.getPublicKey()

    logger.blank(`privateKey: ${privateKey}`)
    logger.blank(`publicKey: ${publicKey}`)

    // convert privateKey to BIP39 mnemonic
    const entropy = privateKey // use privateKey as entropy
    const mnemonic = bip39.entropyToMnemonic(entropy)

    console.log(mnemonic)
  } else {
    logger.info('log in first')
  }
}

module.exports = keyPair

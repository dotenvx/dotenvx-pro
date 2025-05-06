const { keypair } = require('@dotenvx/dotenvx')

class FileKeypair {
  constructor (envFile = '.env', key = undefined) {
    this.envFile = envFile
    this.key = key
  }

  run () {
    const keypairs = keypair(this.envFile)

    if (this.key) {
      return keypairs[this.key]
    } else {
      return keypairs
    }
  }
}

module.exports = FileKeypair

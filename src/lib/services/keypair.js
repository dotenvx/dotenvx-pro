const { keypair } = require('@dotenvx/dotenvx')

class Keypair {
  constructor (envFile = '.env', key = undefined) {
    this.envFile = envFile
    this.key = key
  }

  run () {
    const keypairs = keypair(this.envFile, this.key)

    return keypairs
  }
}

module.exports = Keypair

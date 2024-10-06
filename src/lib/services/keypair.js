const { keypair } = require('@dotenvx/dotenvx')

const DbKeypair = require('./dbKeypair')

class Keypair {
  constructor (envFile = '.env', key = undefined) {
    this.envFile = envFile
    this.key = key

    this._mem = {}
  }

  run () {
    const keypairs = keypair(this.envFile)
    const dbKeypairs = new DbKeypair(this.envFile).run()
    const out = { ...keypairs, ...dbKeypairs } // db keypairs win

    if (this.key) {
      return out[this.key]
    } else {
      return out
    }
  }
}

module.exports = Keypair

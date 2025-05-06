const DbKeypair = require('./dbKeypair')
const FileKeypair = require('./fileKeypair')

class Keypair {
  constructor (envFile = '.env', key = undefined) {
    this.envFile = envFile
    this.key = key
  }

  run () {
    const fileKeypairs = new FileKeypair(this.envFile).run()
    const dbKeypairs = new DbKeypair(this.envFile).run()
    const out = { ...fileKeypairs, ...dbKeypairs } // db keypairs win

    if (this.key) {
      return out[this.key]
    } else {
      return out
    }
  }
}

module.exports = Keypair

const PrivateKey = require('./../../lib/services/privateKey')

function privateKey (directory) {
  try {
    const options = this.opts()

    const results = new PrivateKey(directory, options.envFile).run()

    for (const result of results) {
      console.log(result)
    }
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

module.exports = privateKey

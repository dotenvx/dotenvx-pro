const Keypair = require('./../../lib/services/keypair')

function keypair (key) {
  try {
    const options = this.opts()

    const results = new Keypair(options.envFile, key).run()

    if (typeof results === 'object' && results !== null) {
      let space = 0
      if (options.prettyPrint) {
        space = 2
      }

      console.log(JSON.stringify(results, null, space))
    } else {
      if (results === undefined) {
        console.log('')
        process.exit(1)
      } else {
        console.log(results)
      }
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

module.exports = keypair

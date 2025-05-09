const { logger } = require('@dotenvx/dotenvx')

const Keypair = require('./../../lib/services/keypair')

function keypair (key) {
  try {
    const options = this.opts()

    const results = new Keypair(options.envFile, key).run()

    if (typeof results === 'object' && results !== null) {
      // inline shell format - env $(dotenvx keypair --format=shell) your-command
      if (options.format === 'shell') {
        let inline = ''
        for (const [key, value] of Object.entries(results)) {
          inline += `${key}=${value || ''} `
        }
        inline = inline.trim()

        console.log(inline)
      // json format
      } else {
        let space = 0
        if (options.prettyPrint) {
          space = 2
        }

        console.log(JSON.stringify(results, null, space))
      }
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
      logger.error(error.message)
    } else {
      logger.error(error)
    }
    process.exit(1)
  }
}

module.exports = keypair

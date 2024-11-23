const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Pull = require('./../../lib/services/pull')

const spinner = createSpinner('pulling')

async function pull () {
  try {
    spinner.start()

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const pulledFilepaths = await new Pull(options.hostname, options.envFile).run()
    for (const filepath of pulledFilepaths) {
      spinner.succeed(`pulled (${filepath})`)
    }
  } catch (error) {
    if (error.message) {
      spinner.fail(error.message)
    } else {
      spinner.fail(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    process.exit(1)
  }
}

module.exports = pull

const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Cloak = require('./../../lib/services/cloak')

const spinner = createSpinner('cloaking')

async function cloak () {
  try {
    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    spinner.start()

    const { privateKeyNames } = await new Cloak(options.hostname, options.envFile).run()
    spinner.succeed(`cloaked (${privateKeyNames.join(',')})`)
    logger.help('⮕ next run [dotenvx pro sync]')
  } catch (error) {
    spinner.stop()
    if (error.message) {
      logger.error(error.message)
    } else {
      logger.error(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    if (error.stack) {
      logger.debug(error.stack)
    }
    process.exit(1)
  }
}

module.exports = cloak

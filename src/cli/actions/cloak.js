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

    const {
      changedFilepaths,
      unchangedFilepaths
    } = await new Cloak(options.hostname, options.envFile).run()

    spinner.stop()

    if (changedFilepaths.length > 0) {
      logger.success(`✔ cloaked (${changedFilepaths.join(',')})`)
    } else if (unchangedFilepaths.length > 0) {
      logger.info(`✔ cloaked (${unchangedFilepaths.join(',')})`)
    } else {
      // do nothing - scenario when no .env files found
    }

    logger.help('⮕ have your teammate(s) to run [dotenvx pro sync]')
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

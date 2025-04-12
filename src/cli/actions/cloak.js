const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Cloak = require('./../../lib/services/cloak')

const spinner = createSpinner('cloaking')

async function cloak () {
  try {
    spinner.start()

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const { privateKeyNames } = await new Cloak(options.hostname).run()
    // for (const privateKeyName of privateKeyNames) {
    //   spinner.succeed(`cloaked (${privateKeyName})`)
    // }
    logger.help('⮕ next run [dotenvx pro sync]')
    spinner.succeed(`cloaked ${privateKeyNames}`)
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

module.exports = cloak

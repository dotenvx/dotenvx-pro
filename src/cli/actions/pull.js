const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Pull = require('./../../lib/services/pull')

const spinner = createSpinner('pulling')

async function pull () {
  try {
    logger.warn('[DOTENVX_PRO_DEPRECATED] Pro no longer maintained – and will shutdown February 2026. Please switch to [Dotenvx Ops](https://dotenvx.com/ops).')

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

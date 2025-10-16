const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Sync = require('./../../lib/services/sync')

const spinner = createSpinner('syncing')

async function sync () {
  try {
    logger.warn('[DOTENVX_PRO_DEPRECATED] Pro no longer maintained – and will shutdown February 2026. Please switch to [Dotenvx Ops](https://dotenvx.com/ops).')

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    spinner.start()

    const {
      username,
      emergencyKitGeneratedAt,
      slugs
    } = await new Sync(options.hostname, options.envFile).run()

    spinner.stop()

    logger.success(`✔ synced [user:${username}] with [orgs:${slugs.join(',')}]`)

    if (!emergencyKitGeneratedAt) {
      logger.warn(`⚠ [${username}] emergency kit recommended. Generate it with [dotenvx pro settings emergencykit --unmask].`)
    }
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

module.exports = sync

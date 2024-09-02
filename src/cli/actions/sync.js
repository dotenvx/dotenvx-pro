const db = require('./../../shared/db')
const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Sync = require('./../../lib/services/sync')

const spinner = createSpinner('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const hostname = options.hostname
  const apiSyncUrl = `${hostname}/api/sync`

  spinner.start('syncing')

  const { response, responseData } = await new Sync(apiSyncUrl).run()

  logger.debug(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  } else {
    db.setSync(responseData) // sync to local
    spinner.succeed('synced')
  }
}

module.exports = sync

const ora = require('ora')
const db = require('./../../shared/db')
const store = require('./../../shared/store')
const { request } = require('undici')
const { logger } = require('./../../shared/logger')

const spinner = ora('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = store.getToken()
  const hostname = options.hostname
  const apiSyncUrl = `${hostname}/api/sync`

  spinner.start('syncing')

  const response = await request(apiSyncUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })

  const responseData = await response.body.json()

  logger.http(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  } else {
    db.setSync(responseData) // sync to local

    spinner.succeed(`synced`)
    logger.blank(JSON.stringify(responseData, null, 2))
  }
}

module.exports = sync

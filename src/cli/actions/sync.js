const ora = require('ora')
const db = require('./../../shared/db')
const currentUser = require('./../../shared/currentUser')
const { request } = require('undici')
const { logger } = require('./../../shared/logger')

const spinner = ora('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  const hostname = options.hostname
  const apiSyncUrl = `${hostname}/api/sync`
  const dbJson = db.getJson()

  spinner.start('syncing')

  const body = JSON.stringify({
    db: dbJson
  })
  const response = await request(apiSyncUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body
  })

  const responseData = await response.body.json()

  logger.http(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  } else {
    db.setSync(responseData) // sync to local
    spinner.succeed('synced')
  }
}

module.exports = sync

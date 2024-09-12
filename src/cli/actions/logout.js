const { logger } = require('@dotenvx/dotenvx')
const current = require('./../../shared/current')
const { request } = require('undici')

const { createSpinner } = require('./../../lib/helpers/createSpinner')
const truncate = require('./../../lib/helpers/truncate')

const spinner = createSpinner('waiting on browser authorization')

async function logout () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = current.token()
  const hostname = options.hostname
  const apiLogoutUrl = `${hostname}/api/logout`
  const settingsDevicesUrl = `${hostname}/settings/devices`

  const response = await request(apiLogoutUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })

  const responseData = await response.body.json()

  logger.debug(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  } else {
    const hostname = responseData.hostname
    const id = responseData.id
    const username = responseData.username
    const accessToken = responseData.access_token

    current.logout(hostname, id, accessToken)
    spinner.succeed(`logged out [${username}] from this device and revoked token [${truncate(accessToken, 11)}]`)
    logger.help(`⮕ next visit [${settingsDevicesUrl}] to view your devices`)
  }
}

module.exports = logout

const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../shared/currentUser')
const { request } = require('undici')

const { createSpinner } = require('./../../lib/helpers/createSpinner')
const truncate = require('./../../lib/helpers/truncate')

const spinner = createSpinner('waiting on browser authorization')

async function logout () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
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

    currentUser.logout(hostname, id, accessToken)
    spinner.succeed(`logged out [${username}] from this machine, revoking token [${truncate(accessToken, 11)}]`)
    logger.blank(`Next visit [${settingsDevicesUrl}] to optionally view your devices`)
  }
}

module.exports = logout

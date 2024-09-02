const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../shared/currentUser')
const { request } = require('undici')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const spinner = createSpinner('waiting on browser authorization')

async function logout () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  const hostname = options.hostname
  const logoutUrl = `${hostname}/logout`
  const apiLogoutUrl = `${hostname}/api/logout`

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
    spinner.succeed(`logged off machine [${responseData.username}]`)

    currentUser.logout()

    spinner.succeed(`deleted access token [${responseData.access_token_short}]`)

    logger.blank('')
    logger.blank(`Next visit [${logoutUrl}] to additionally log off browser`)
  }
}

module.exports = logout

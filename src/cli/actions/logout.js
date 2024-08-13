const ora = require('ora')
const store = require('./../../shared/store')
const { request } = require('undici')
const { logger } = require('./../../shared/logger')

const spinner = ora('waiting on browser authorization')

async function logout () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = store.getToken()
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

  logger.http(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  } else {
    spinner.succeed(`logged off machine [${responseData.username}]`)

    logger.debug('deleting settings.DOTENVX_PRO_CURRENT_USER_TOKEN')
    store.deleteToken()

    logger.debug('deleting settings.DOTENVX_PRO_CURRENT_USER_HASHID')
    store.deleteHashid()

    logger.debug('deleting settings.DOTENVX_PRO_HOSTNAME')
    store.deleteHostname()

    spinner.succeed(`deleted access token [${responseData.access_token_short}]`)

    logger.blank('')
    logger.blank(`Next visit [${logoutUrl}] to additionally log off browser`)
  }
}

module.exports = logout

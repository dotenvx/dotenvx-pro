const openBrowser = require('open')
const confirm = require('@inquirer/confirm').default

const store = require('./../../shared/store')
const { logger } = require('./../../shared/logger')
// const sleep = require('./../../lib/helpers/sleep')

const username = store.getUsername()
const usernamePart = username ? ` [${username}]` : ''

async function logout () {
  // debug opts
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  logger.debug('deleting settings.DOTENVX_PRO_TOKEN')
  store.deleteToken()

  logger.debug('deleting settings.DOTENVX_PRO_HOSTNAME')
  store.deleteHostname()

  logger.blank(`logged off machine${usernamePart}`)

  const hostname = options.hostname
  const logoutUrl = `${hostname}/logout`

  // optionally allow user to open browser
  const answer = await confirm({ message: `press Enter to also log off browser [${logoutUrl}]...` })

  if (answer) {
    await openBrowser(logoutUrl)
    logger.blank(`logged off browser${usernamePart}`)
  }
}

module.exports = logout

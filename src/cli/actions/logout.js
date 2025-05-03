const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Logout = require('./../../lib/services/logout')

const truncate = require('./../../lib/helpers/truncate')

const spinner = createSpinner('waiting on browser authorization')

async function logout () {
  try {
    spinner.start()

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const {
      username,
      accessToken,
      settingsDevicesUrl
    } = await new Logout(options.hostname).run()

    spinner.succeed(`logged out [${username}] from this device and revoked token [${truncate(accessToken, 11)}]`)
    logger.help(`⮕ next visit [${settingsDevicesUrl}] to view your devices`)
  } catch (error) {
    spinner.stop()
    if (error.message) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    if (error.help) {
      console.error(error.help)
    }
    process.exit(1)
  }
}

module.exports = logout

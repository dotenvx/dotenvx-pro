const openBrowser = require('open')
const { logger } = require('@dotenvx/dotenvx')

const confirm = require('./../../lib/helpers/confirm')
const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Open = require('./../../lib/services/open')

const spinner = createSpinner('opening')

async function open () {
  try {
    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const { url, usernameName } = await new Open(options.hostname).run()

    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${url}]...` })

    if (answer) {
      spinner.start()
      await openBrowser(url)
      spinner.succeed(`opened [${usernameName}]`)
    }
  } catch (error) {
    if (error.message) {
      spinner.fail(error.message)
    } else {
      spinner.fail(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    process.exit(1)
  }
}

module.exports = open

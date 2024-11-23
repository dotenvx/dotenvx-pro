const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const spinner = createSpinner('opening')

async function open () {
  try {
    spinner.start()

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    spinner.succeed('opened [IMPLEMENT]')

    // const usernameName = extractUsernameName(giturl)
    // const openUrl = `${options.hostname}/gh/${usernameName}`

    // // optionally allow user to open browser
    // const answer = await confirm({ message: `press Enter to open [${openUrl}]...` })

    // if (answer) {
    //   spinner.start()
    //   await sleep(500) // better dx
    //   await openBrowser(openUrl)
    //   spinner.succeed(`opened [${usernameName}]`)
    // }
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

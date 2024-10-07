const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../lib/helpers/createSpinner')

const Push = require('./../../lib/services/push')

const spinner = createSpinner('pushing')

async function push (directory) {
  try {
    spinner.start()

    // debug args
    logger.debug(`directory: ${directory}`)

    // debug opts
    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const pushedFilepaths = await new Push(options.hostname, options.envFile).run()
    for (const filepath of pushedFilepaths) {
      spinner.succeed(`pushed (${filepath})`)
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

module.exports = push

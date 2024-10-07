const fs = require('fs')
const path = require('path')
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../db/current')
const User = require('./../../db/user')

const gitUrl = require('./../../lib/helpers/gitUrl')
const gitRoot = require('./../../lib/helpers/gitRoot')
const extractUsernameName = require('./../../lib/helpers/extractUsernameName')
const extractSlug = require('./../../lib/helpers/extractSlug')
const forgivingDirectory = require('./../../lib/helpers/forgivingDirectory')
const { createSpinner } = require('./../../lib/helpers/createSpinner')

// api calls
const PostPush = require('./../../lib/api/postPush')

// services
const Push = require('./../../lib/services/push')

// SyncOrganization
const SyncOrganization = require('./../../lib/services/syncOrganization')
const Keypair = require('./../../lib/services/keypair')

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

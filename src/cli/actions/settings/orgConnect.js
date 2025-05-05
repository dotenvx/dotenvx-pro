const open = require('open')
const { logger } = require('@dotenvx/dotenvx')

const confirm = require('./../../../lib/helpers/confirm')

const current = require('./../../../db/current')

async function orgConnect () {
  const hostname = current.hostname()
  const settingsOrganizationsUrl = `${hostname}/settings/organizations`

  try {
    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${settingsOrganizationsUrl}]...` })

    if (answer) {
      await open(settingsOrganizationsUrl)
      process.exit(0)
    } else {
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

module.exports = orgConnect

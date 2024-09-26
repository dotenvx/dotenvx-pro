const open = require('open')

const confirm = require('./../../../lib/helpers/confirm')

const current = require('./../../../db/current')

async function orgJoin () {
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
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = orgJoin

const { table } = require('table')
const { request } = require('undici')

const currentUser = require('./../../../shared/currentUser')
const { logger } = require('@dotenvx/dotenvx')

const { createSpinner } = require('./../../../lib/helpers/createSpinner')

const spinner = createSpinner('fetching team')

async function team (organizationSlug) {
  logger.debug(`organizationSlug: ${organizationSlug}`)

  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  const hostname = options.hostname
  const membersUrl = `${hostname}/api/members?organization_slug=${organizationSlug}`
  const response = await request(membersUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const responseData = await response.body.json()

  logger.debug(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
    process.exit(1)
  }

  spinner.succeed('users')

  // build table
  const t = [['organization', 'username', 'public_key']]
  for (const row of responseData) {
    t.push([row.organization_slug, row.username, row.public_key])
  }

  process.stdout.write(table(t))
}

module.exports = team

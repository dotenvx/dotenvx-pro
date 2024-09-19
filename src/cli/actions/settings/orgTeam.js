const { table } = require('table')
const { request } = require('undici')
const { logger, getColor, bold } = require('@dotenvx/dotenvx')

const current = require('./../../../shared/current')

async function orgTeam () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = current.token()
  const hostname = current.hostname()
  const organizationId = current.organizationId()
  const url = `${hostname}/api/organizations/${organizationId}/members`
  const response = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const responseData = await response.body.json()

  logger.debug(responseData)

  if (response.statusCode >= 400) {
    console.error(`[${responseData.error.code}] ${responseData.error.message}`)
    process.exit(1)
  }

  // build table
  const t = [['username', 'synced']]
  for (const row of responseData) {
    let synced = getColor('red')('✖')
    if (row.public_key && row.public_key.length > 0 && row.organization_private_key_encrypted_with_user_public_key && row.organization_private_key_encrypted_with_user_public_key.length > 0) {
      synced = getColor('green')('✔')
    }

    t.push([row.username, synced])
  }

  process.stdout.write(table(t))
}

module.exports = orgTeam

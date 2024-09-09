const { table } = require('table')
const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')

async function list () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.token()
  const hostname = options.hostname
  const organizationId = 1 // currentUser.organizationId()
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
  const t = [['username', 'user public_key', 'organization public_key', 'organization private_key']]
  for (const row of responseData) {
    let publicKeyExists = ''
    if (row.public_key && row.public_key.length > 0) {
      publicKeyExists = '✔'
    }

    let organizationPrivateKeyExists = ''
    if (row.organization_private_key_encrypted_with_user_public_key && row.organization_private_key_encrypted_with_user_public_key.length > 0) {
      organizationPrivateKeyExists = '✔'
    }

    t.push([row.username, publicKeyExists, '✔', organizationPrivateKeyExists])
  }

  process.stdout.write(table(t))
}

module.exports = list

const { table } = require('table')
const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')

async function list () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.token()
  const hostname = options.hostname
  const organizationsUrl = `${hostname}/api/organizations`
  const response = await request(organizationsUrl, {
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
  const t = [['slug', 'public_key', 'private_key']]
  for (const row of responseData) {
    let publicKeyExists = ''
    if (row.public_key && row.public_key.length > 0) {
      publicKeyExists = '✔'
    }

    let privateKeyExists = ''
    if (row.private_key_encrypted && row.private_key_encrypted.length > 0) {
      privateKeyExists = '✔'
    }

    t.push([row.slug, publicKeyExists, privateKeyExists])
  }

  process.stdout.write(table(t))
}

module.exports = list

const { table } = require('table')
const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')
const decryptValue = require('./../../../lib/helpers/decryptValue')
const smartTruncate = require('./../../../lib/helpers/smartTruncate')
const { createSpinner } = require('./../../../lib/helpers/createSpinner')

const spinner = createSpinner('fetching organizations')

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
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
    process.exit(1)
  }

  spinner.succeed('organizations')

  // build table
  const t = [['slug', 'public_key', 'private_key']]
  for (const row of responseData) {
    let privateKey = ''
    if (row.private_key_encrypted) {
      privateKey = decryptValue(row.private_key_encrypted, currentUser.privateKey())
      privateKey = smartTruncate(privateKey, options.unmask)
    }

    t.push([row.slug, smartTruncate(row.public_key, options.unmask), privateKey])
  }

  process.stdout.write(table(t))
}

module.exports = list

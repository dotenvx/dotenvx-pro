const ora = require('ora')
const { table } = require('table')
const { request } = require('undici')

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const decryptValue = require('./../../../lib/helpers/decryptValue')
const smartMask = require('./../../../lib/helpers/smartMask')

const spinner = ora('fetching organizations')

async function list () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = store.getToken()
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

  logger.http(responseData)

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
      privateKey = decryptValue(row.private_key_encrypted, store.getPrivateKey())
      privateKey = smartMask(privateKey, options.unmask)
    }

    t.push([row.slug, row.public_key, privateKey])
  }

  process.stdout.write(table(t))
}

module.exports = list

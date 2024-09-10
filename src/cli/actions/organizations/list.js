const { table } = require('table')
const { logger } = require('@dotenvx/dotenvx')

const GetOrganizations = require('./../../../lib/api/getOrganizations')
const currentUser = require('./../../../shared/currentUser')

async function list () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    const token = currentUser.token()
    const hostname = options.hostname
    const organizations = await new GetOrganizations(hostname, token).run()

    // build table
    const t = [['slug', 'public_key', 'private_key']]
    for (const row of organizations) {
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
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    if (error.help) {
      console.error(error.help)
    }
    process.exit(1)
  }
}

module.exports = list

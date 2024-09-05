const { logger } = require('@dotenvx/dotenvx')
const { request } = require('undici')
const currentUser = require('./../../../shared/currentUser')

async function me () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  const hostname = currentUser.getHostname()
  const meUrl = `${hostname}/api/me`

  const response = await request(meUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const results = await response.body.json()

  let space = 0
  if (options.prettyPrint) {
    space = 2
  }

  process.stdout.write(JSON.stringify(results, null, space))

  if (response.statusCode >= 400) {
    process.exit(1)
  }
}

module.exports = me

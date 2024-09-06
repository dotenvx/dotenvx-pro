const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')
const smartTruncate = require('./../../../lib/helpers/smartTruncate')
const { createSpinner } = require('./../../../lib/helpers/createSpinner')

const spinner = createSpinner('checking status')

async function status () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const token = currentUser.getToken()
  const hostname = currentUser.getHostname()
  const publicKey = currentUser.getPublicKey()
  const privateKey = currentUser.getPrivateKey()
  const configPath = currentUser.configPath()

  spinner.succeed(`token [${smartTruncate(token, options.unmask, 11)}]`)
  spinner.succeed(`publicKey [${publicKey}]`)
  spinner.succeed(`privateKey [${smartTruncate(privateKey, options.unmask)}]`)
  spinner.succeed(`configPath [${configPath}]`)
  spinner.succeed(`hostname [${hostname}]`)
  spinner.start('fetching remote (publicKey)')

  const statusUrl = `${hostname}/api/status`
  const response = await request(statusUrl, {
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

  const remoteRevokedAt = responseData.revoked_at
  if (remoteRevokedAt) {
    spinner.fail(`remote: token revoked [${smartTruncate(token, options.unmask, 11)}]`)
  } else {
    spinner.succeed(`remote: token [${smartTruncate(token, options.unmask, 11)}]`)
  }

  spinner.succeed(`remote: username [${responseData.username}] (${responseData.id})`)
}

module.exports = status

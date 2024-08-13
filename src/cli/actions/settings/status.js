const ora = require('ora')
const { request } = require('undici')

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const mask = require('./../../../lib/helpers/mask')

const spinner = ora('checking status')

async function status () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  function smartMask (str, showChar = 7) {
    if (options.unmask) {
      return str
    } else {
      return mask(str, showChar)
    }
  }
  const token = store.getToken()
  const hostname = store.getHostname()
  const publicKey = store.getPublicKey()
  const privateKey = store.getPrivateKey()
  const configPath = store.configPath()

  spinner.succeed(`token [${smartMask(token, 11)}]`)
  spinner.succeed(`publicKey [${smartMask(publicKey)}]`)
  spinner.succeed(`privateKey [${smartMask(privateKey)}]`)
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

  logger.http(responseData)

  if (response.statusCode >= 400) {
    spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
    process.exit(1)
  }

  const remoteRevokedAt = responseData.revoked_at
  if (remoteRevokedAt) {
    spinner.fail(`remote: token revoked [${smartMask(token, 11)}]`)
  } else {
    spinner.succeed(`remote: token [${smartMask(token, 11)}]`)
  }

  spinner.succeed(`remote: username [${responseData.username}] (${responseData.hashid})`)
}

module.exports = status

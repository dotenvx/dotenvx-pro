const ora = require('ora')
const { request } = require('undici')

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')

const spinner = ora('checking status')

async function status () {
  const token = store.getToken()
  const tokenShort = store.getTokenShort()
  const hostname = store.getHostname()
  const username = store.getUsername()
  const fullUsername = store.getFullUsername()
  const publicKey = store.getPublicKey()
  const privateKeyShort = store.getPrivateKeyShort()
  const configPath = store.configPath()

  spinner.succeed(`token [${tokenShort}]`)
  spinner.succeed(`username [${username}]`)
  spinner.succeed(`fullUsername [${fullUsername}]`)
  spinner.succeed(`publicKey [${publicKey}]`)
  spinner.succeed(`privateKey [${privateKeyShort}]`)
  spinner.succeed(`configPath [${configPath}]`)
  spinner.succeed(`hostname [${hostname}]`)
  spinner.start('fetching remote (username, fullUsername, publicKey)')

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
  const remoteUsername = responseData.username
  const remoteFullUsername = responseData.full_username
  const remotePublicKey = responseData.public_key

  if (remoteRevokedAt) {
    spinner.fail(`remote: token revoked [${tokenShort}]`)
  } else {
    spinner.succeed(`remote: token [${tokenShort}]`)
  }

  if (remoteUsername === username) {
    spinner.succeed(`remote: username [${remoteUsername}]`)
  } else {
    spinner.warn(`remote: username [${remoteUsername}]`)
  }

  if (remoteFullUsername === fullUsername) {
    spinner.succeed(`remote: fullUsername [${remoteFullUsername}]`)
  } else {
    spinner.warn(`remote: fullUsername [${remoteFullUsername}]`)
  }

  if (remotePublicKey === publicKey) {
    spinner.succeed(`remote: publicKey [${remotePublicKey}]`)
  } else {
    spinner.fail(`remote: publicKey [${remotePublicKey}]`)
  }
}

module.exports = status

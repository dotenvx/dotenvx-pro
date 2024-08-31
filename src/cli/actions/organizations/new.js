const ora = require('ora')
const open = require('open')
const crypto = require('crypto')
const { request } = require('undici')
const confirm = require('@inquirer/confirm').default
const { PrivateKey } = require('eciesjs')

const db = require('./../../../shared/db')
const currentUser = require('./../../../shared/currentUser')
const { logger } = require('./../../../shared/logger')

const Sync = require('./../../../lib/services/sync')

const spinner = ora('waiting on browser creation')

async function pollRequestUidUrl (requestUidUrl, requestUid, interval, publicKey, privateKey, apiSyncUrl) {
  logger.http(`POST ${requestUidUrl} with requestUid ${requestUid} at interval ${interval}`)

  while (true) {
    try {
      const token = currentUser.getToken()
      const hashid = currentUser.getHashid()
      const response = await request(requestUidUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_key: publicKey,
          request_uid: requestUid
        })
      })

      const responseData = await response.body.json()

      logger.http(responseData)

      if (response.statusCode === 401) {
        spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
        process.exit(1)
      }

      if (response.statusCode >= 400) {
        // continue polling
        const newInterval = interval + 1 // grow the interval
        await new Promise(resolve => setTimeout(resolve, newInterval * 1000))
      } else {
        spinner.succeed(`created organization [${responseData.slug}]`)

        logger.debug(`setting organization.${responseData.hashid}`)
        db.setUserOrganizationPrivateKey(hashid, responseData.hashid, privateKey)

        // sync
                const syncResult = await new Sync(apiSyncUrl).run()

        if (syncResult.response.statusCode >= 400) {
          spinner.fail(`[${syncResult.responseData.error.code}] ${syncResult.responseData.error.message}`)
        } else {
          db.setSync(syncResult.responseData) // sync to local
          spinner.succeed('synced')
        }

        // next implement syncing the privateKey to all team member's machines via encryption from the publicKeys

        process.exit(0)
      }
    } catch (error) {
      logger.error(error.toString())
      process.exit(1)
    }
  }
}

async function neww () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const requestUid = `req_${crypto.randomBytes(4).toString('hex')}`
  const hostname = options.hostname
  const organizationsNewUrl = `${hostname}/organizations/new?request_uid=${requestUid}`
  const apiSyncUrl = `${hostname}/api/sync`
  const requestUidUrl = `${hostname}/api/request_uid`
  const interval = 5 // for 5 seconds

  // generate private/public key to be paired with the org
  const kp = new PrivateKey()
  const publicKey = kp.publicKey.toHex()
  const privateKey = kp.secret.toString('hex')

  try {
    // begin polling
    pollRequestUidUrl(requestUidUrl, requestUid, interval, publicKey, privateKey, apiSyncUrl)

    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${organizationsNewUrl}]...` })

    spinner.start()

    if (answer) {
      await open(organizationsNewUrl)
    } else {
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.toString())
    process.exit(1)
  }
}

module.exports = neww

const open = require('open')
const crypto = require('crypto')
const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')
const { createSpinner } = require('./../../../lib/helpers/createSpinner')
const confirm = require('./../../../lib/helpers/confirm')

const spinner = createSpinner('waiting on browser creation')

async function pollRequestUidUrl (requestUidUrl, requestUid, interval) {
  logger.debug(`POST ${requestUidUrl} with requestUid ${requestUid} at interval ${interval}`)

  while (true) {
    try {
      const token = currentUser.token()
      const response = await request(requestUidUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_uid: requestUid
        })
      })

      const responseData = await response.body.json()

      logger.debug(responseData)

      if (response.statusCode === 401) {
        spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
        process.exit(1)
      }

      if (responseData.slug) {
        const slug = responseData.slug

        spinner.succeed(`created organization [${slug}]`)
        logger.help('⮕ next run [dotenvx pro sync]')

        process.exit(0)
      } else {
        await new Promise(resolve => setTimeout(resolve, interval * 1000))
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
  const requestUidUrl = `${hostname}/api/request_uid`
  const interval = 5 // for 5 seconds

  try {
    // begin polling
    pollRequestUidUrl(requestUidUrl, requestUid, interval)

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

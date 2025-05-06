const open = require('open')
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../db/current')
const User = require('./../../db/user')

const clipboardy = require('./../../lib/helpers/clipboardy')
const { createSpinner } = require('./../../lib/helpers/createSpinner')
const confirm = require('./../../lib/helpers/confirm')
const truncate = require('./../../lib/helpers/truncate')
const formatCode = require('./../../lib/helpers/formatCode')

const spinner = createSpinner('waiting on browser authorization')

// api calls
const PostOauthToken = require('./../../lib/api/postOauthToken')
const PostOauthDeviceCode = require('./../../lib/api/postOauthDeviceCode')

async function pollTokenUrl (hostname, deviceCode, interval, settingsDevicesUrl) {
  logger.debug(`POST ${hostname} with deviceCode ${deviceCode} at interval ${interval}`)

  while (true) {
    try {
      let data
      try {
        data = await new PostOauthToken(hostname, deviceCode).run()
        if (data.access_token) {
          const hostname = data.hostname
          const id = data.id
          const username = data.username
          const accessToken = data.access_token

          // log in user
          current.login(hostname, id, accessToken)

          // attempt to select org
          const user = new User(id)
          const organizationId = user.organizationIds()[0]
          if (!current.organizationId() && organizationId) {
            current.selectOrganization(organizationId)
          }

          spinner.succeed(`logged in [${username}] to this device and activated token [${truncate(accessToken, 11)}]`)
          logger.help('⮕ next run [dotenvx pro sync]')

          process.exit(0)
        } else {
          await new Promise(resolve => setTimeout(resolve, interval * 1000))
        }
      } catch (error) {
        // continue polling if authorization_pending
        if (error.code === 'authorization_pending') {
          const newInterval = interval + 1 // grow the interval
          await new Promise(resolve => setTimeout(resolve, newInterval * 1000))
        } else {
          throw error
        }
      }
    } catch (error) {
      spinner.stop()
      if (error.message) {
        logger.error(error.message)
      } else {
        logger.error(error)
      }
      if (error.help) {
        logger.help(error.help)
      }
      process.exit(1)
    }
  }
}

async function login () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const hostname = options.hostname
  const settingsDevicesUrl = `${hostname}/settings/devices`

  try {
    const data = await new PostOauthDeviceCode(hostname).run()

    const deviceCode = data.device_code
    const userCode = data.user_code
    const verificationUri = data.verification_uri
    const verificationUriComplete = data.verification_uri_complete
    const interval = data.interval

    try { clipboardy.writeSync(userCode) } catch (_e) {}

    // qrcode.generate(verificationUri, { small: true }) // too verbose

    // begin polling
    pollTokenUrl(hostname, deviceCode, interval, settingsDevicesUrl)

    logger.info(`press Enter to open [${verificationUri}] and enter code [${formatCode(userCode)}]...`)
    spinner.start()

    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${verificationUri}] and enter code [${formatCode(userCode)}]...` })

    if (answer) {
      await open(verificationUriComplete)
    } else {
      spinner.stop()
      process.exit(1)
    }
  } catch (error) {
    spinner.stop()
    if (error.message) {
      logger.error(error.message)
    } else {
      logger.error(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    if (error.stack) {
      logger.debug(error.stack)
    }
    process.exit(1)
  }
}

module.exports = login

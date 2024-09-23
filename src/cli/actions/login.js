const open = require('open')
const { request } = require('undici')
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../shared/current')
const user = require('./../../shared/user')

const clipboardy = require('./../../lib/helpers/clipboardy')
const systemInformation = require('./../../lib/helpers/systemInformation')
const { createSpinner } = require('./../../lib/helpers/createSpinner')
const confirm = require('./../../lib/helpers/confirm')
const truncate = require('./../../lib/helpers/truncate')

const OAUTH_CLIENT_ID = 'oac_dotenvxcli'

const spinner = createSpinner('waiting on browser authorization')

const formatCode = function (str) {
  const parts = []

  for (let i = 0; i < str.length; i += 4) {
    parts.push(str.substring(i, i + 4))
  }

  return parts.join('-')
}

async function pollTokenUrl (tokenUrl, deviceCode, interval, settingsDevicesUrl) {
  logger.debug(`POST ${tokenUrl} with deviceCode ${deviceCode} at interval ${interval}`)

  while (true) {
    try {
      const response = await request(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: OAUTH_CLIENT_ID,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      })

      const responseData = await response.body.json()

      logger.debug(responseData)

      if (response.statusCode >= 400) {
        // continue polling if authorization_pending
        if (responseData.error === 'authorization_pending') {
          const newInterval = interval + 1 // grow the interval
          await new Promise(resolve => setTimeout(resolve, newInterval * 1000))
        } else {
          console.error(responseData.error_description)
          process.exit(1)
        }
      }

      if (responseData.access_token) {
        const hostname = responseData.hostname
        const id = responseData.id
        const username = responseData.username
        const accessToken = responseData.access_token

        const organizationId = user.organizationIds()[0]

        current.login(hostname, id, accessToken)
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
      console.error(error.message)
      process.exit(1)
    }
  }
}

async function login () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const hostname = options.hostname
  const deviceCodeUrl = `${hostname}/oauth/device/code`
  const tokenUrl = `${hostname}/oauth/token`
  const settingsDevicesUrl = `${hostname}/settings/devices`

  try {
    const systemInfo = await systemInformation()
    const response = await request(deviceCodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: OAUTH_CLIENT_ID,
        system_information: systemInfo
      })
    })

    const responseData = await response.body.json()

    if (response.statusCode >= 400) {
      logger.debug(responseData)
      console.error(responseData.error_description)
      process.exit(1)
    }

    const deviceCode = responseData.device_code
    const userCode = responseData.user_code
    const verificationUri = responseData.verification_uri
    const interval = responseData.interval

    try { clipboardy.writeSync(userCode) } catch (_e) {}

    // qrcode.generate(verificationUri, { small: true }) // too verbose

    // begin polling
    pollTokenUrl(tokenUrl, deviceCode, interval, settingsDevicesUrl)

    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${verificationUri}] and enter code [${formatCode(userCode)}]...` })

    spinner.start()

    if (answer) {
      await open(verificationUri)
    } else {
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = login

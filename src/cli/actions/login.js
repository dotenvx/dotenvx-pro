const open = require('open')
const { request } = require('undici')
const confirm = require('@inquirer/confirm').default

const store = require('./../../shared/store')
const { logger } = require('./../../shared/logger')
const clipboardy = require('./../../lib/helpers/clipboardy')
const systemInformation = require('./../../lib/helpers/systemInformation')
const calculateFingerprint = require('./../../lib/helpers/calculateFingerprint')

const OAUTH_CLIENT_ID = 'oac_dotenvxcli'

const formatCode = function (str) {
  const parts = []

  for (let i = 0; i < str.length; i += 4) {
    parts.push(str.substring(i, i + 4))
  }

  return parts.join('-')
}

async function pingFingerprint (fingerprintUrl) {
  const token = store.getToken()
  const sysInfo = await systemInformation()
  const fingerprint = await calculateFingerprint()

  const response = await request(fingerprintUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fingerprint,
      system_information: sysInfo
    })
  })

  const responseData = await response.body.json()

  logger.http(responseData)

  if (response.statusCode >= 400) {
    logger.error(`[${responseData.error.code}] ${responseData.error.message}`)
  }
}

async function pingPublicKey (publicKeyUrl) {
  const token = store.getToken()
  const publicKey = store.getPublicKey()

  const response = await request(publicKeyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      public_key: publicKey
    })
  })

  const responseData = await response.body.json()

  logger.http(responseData)

  if (response.statusCode >= 400) {
    logger.error(`[${responseData.error.code}] ${responseData.error.message}`)
    process.exit(1)
  }
}

async function pollTokenUrl (tokenUrl, deviceCode, interval, publicKeyUrl, fingerprintUrl) {
  logger.http(`POST ${tokenUrl} with deviceCode ${deviceCode} at interval ${interval}`)

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

      logger.http(responseData)

      if (response.statusCode >= 400) {
        // continue polling if authorization_pending
        if (responseData.error === 'authorization_pending') {
          const newInterval = interval + 1 // grow the interval
          await new Promise(resolve => setTimeout(resolve, newInterval * 1000))
        } else {
          logger.error(responseData.error_description)
          process.exit(1)
        }
      }

      if (responseData.access_token) {
        store.setUser(responseData.full_username, responseData.access_token)
        store.setHostname(responseData.hostname)
        logger.success(`logged in as ${responseData.username}`)

        await pingPublicKey(publicKeyUrl)
        await pingFingerprint(fingerprintUrl)

        process.exit(0)
      } else {
        // continue polling if no access_token. shouldn't ever get here if server is implemented correctly
        await new Promise(resolve => setTimeout(resolve, interval * 1000))
      }
    } catch (error) {
      logger.error(error.toString())
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
  const publicKeyUrl = `${hostname}/api/public_key`
  const fingerprintUrl = `${hostname}/api/fingerprint`

  try {
    const response = await request(deviceCodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ client_id: OAUTH_CLIENT_ID })
    })

    const responseData = await response.body.json()

    if (response.statusCode >= 400) {
      logger.http(responseData)
      logger.error(responseData.error_description)
      process.exit(1)
    }

    const deviceCode = responseData.device_code
    const userCode = responseData.user_code
    const verificationUri = responseData.verification_uri
    const interval = responseData.interval

    try { clipboardy.writeSync(userCode) } catch (_e) {}

    // qrcode.generate(verificationUri, { small: true }) // too verbose

    // begin polling
    pollTokenUrl(tokenUrl, deviceCode, interval, publicKeyUrl, fingerprintUrl)

    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${verificationUri}] and enter code [${formatCode(userCode)}]...` })

    if (answer) {
      await open(verificationUri)
    } else {
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.toString())
    process.exit(1)
  }
}

module.exports = login

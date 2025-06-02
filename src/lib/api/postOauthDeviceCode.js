const { request } = require('../../lib/helpers/http')

const Device = require('../../db/device')
const buildOauthError = require('../../lib/helpers/buildOauthError')
const systemInformation = require('../../lib/helpers/systemInformation')

const OAUTH_CLIENT_ID = 'oac_dotenvxcli'

class PostOauthDeviceCode {
  constructor (hostname) {
    this.hostname = hostname
  }

  async run () {
    const devicePublicKey = new Device().publicKey() // send device.public_key along with request
    const systemInfo = await systemInformation()
    const url = `${this.hostname}/oauth/device/code`

    const resp = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: OAUTH_CLIENT_ID,
        system_information: systemInfo,
        device_public_key: devicePublicKey
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildOauthError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostOauthDeviceCode

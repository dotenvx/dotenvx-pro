const { request } = require('../../lib/helpers/http')

const buildOauthError = require('../../lib/helpers/buildOauthError')
const systemInformation = require('../../lib/helpers/systemInformation')

const OAUTH_CLIENT_ID = 'oac_dotenvxcli'

class PostOauthDeviceCode {
  constructor (hostname) {
    this.hostname = hostname
  }

  async run () {
    const systemInfo = await systemInformation()
    const url = `${this.hostname}/oauth/device/code`

    const resp = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: OAUTH_CLIENT_ID,
        system_information: systemInfo
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

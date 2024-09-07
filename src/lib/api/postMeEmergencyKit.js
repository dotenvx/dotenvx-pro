const { request } = require('undici')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostMeEmergencyKit {
  constructor (hostname, token) {
    this.hostname = hostname
    this.token = token
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/me/emergency_kit`

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostMeEmergencyKit

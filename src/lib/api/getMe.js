const { request } = require('undici')

class GetMe {
  constructor (hostname, token) {
    this.hostname = hostname
    this.token = token
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/me`

    const resp = await request(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      const error = new Error(json.error.message)
      error.code = resp.statusCode
      error.help = json
      throw error
    }

    return json
  }
}

module.exports = GetMe

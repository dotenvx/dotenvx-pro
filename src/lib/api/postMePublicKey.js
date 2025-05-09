const { request } = require('../../lib/helpers/http')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostMePublicKey {
  constructor (hostname, token, publicKey) {
    this.hostname = hostname
    this.token = token
    this.publicKey = publicKey
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/me/public_key`
    const publicKey = this.publicKey

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: publicKey
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostMePublicKey

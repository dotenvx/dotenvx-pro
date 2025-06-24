const { request } = require('undici')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostOrganization {
  constructor (hostname, token, slug) {
    this.hostname = hostname
    this.token = token
    this.slug = slug
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/organization`
    const slug = this.slug

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostOrganization

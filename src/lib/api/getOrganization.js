const { request } = require('undici')

class GetOrganization {
  constructor (hostname, token, hashid) {
    this.hostname = hostname
    this.token = token
    this.hashid = hashid
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/organization/${this.hashid}`

    const resp = await request(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw new Error(json.error.message)
    }

    return json
  }
}

module.exports = GetOrganization

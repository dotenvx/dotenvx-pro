const { request } = require('undici')

class GetOrganization {
  constructor (hostname, token, id) {
    this.hostname = hostname
    this.token = token
    this.id = id
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/organization/${this.id}`

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

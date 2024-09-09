const { request } = require('undici')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostOrganizationPublicKey {
  constructor (hostname, token, id, publicKey, privateKeyEncrypted) {
    this.hostname = hostname
    this.token = token
    this.id = id
    this.publicKey = publicKey
    this.privateKeyEncrypted = privateKeyEncrypted
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/organization/${this.id}/public_key`
    const publicKey = this.publicKey
    const privateKeyEncrypted = this.privateKeyEncrypted

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: publicKey,
        private_key_encrypted: privateKeyEncrypted
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostOrganizationPublicKey

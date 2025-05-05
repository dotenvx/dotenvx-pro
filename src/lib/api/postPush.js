const { request } = require('../../lib/helpers/http')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostPush {
  constructor (hostname, token, provider, organizationPublicKey, usernameName, filepath, publicKeyName, privateKeyName, publicKey, privateKeyEncryptedWithOrganizationPublicKey, text) {
    this.hostname = hostname
    this.token = token
    this.provider = provider
    this.organizationPublicKey = organizationPublicKey
    this.usernameName = usernameName
    this.filepath = filepath
    this.publicKeyName = publicKeyName
    this.privateKeyName = privateKeyName
    this.publicKey = publicKey
    this.privateKeyEncryptedWithOrganizationPublicKey = privateKeyEncryptedWithOrganizationPublicKey
    this.text = text
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/push`
    const provider = this.provider
    const organizationPublicKey = this.organizationPublicKey
    const usernameName = this.usernameName
    const filepath = this.filepath
    const publicKeyName = this.publicKeyName
    const privateKeyName = this.privateKeyName
    const publicKey = this.publicKey
    const privateKeyEncryptedWithOrganizationPublicKey = this.privateKeyEncryptedWithOrganizationPublicKey
    const text = this.text

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        organization_public_key: organizationPublicKey,
        username_name: usernameName,
        filepath,
        public_key_name: publicKeyName,
        private_key_name: privateKeyName,
        public_key: publicKey,
        private_key_encrypted_with_organization_public_key: privateKeyEncryptedWithOrganizationPublicKey,
        text
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostPush

const { request } = require('undici')

const buildApiError = require('../../lib/helpers/buildApiError')

class PostPush {
  constructor (hostname, token, provider, organizationPublicKey, usernameName, filepath, publicKeyName, privateKeyName, publicKey, privateKeyEncryptedWithOrganizationPublicKey) {
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

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: provider,
        organization_public_key: organizationPublicKey,
        username_name: usernameName,
        filepath: filepath,
        public_key_name: publicKeyName,
        private_key_name: privateKeyName,
        public_key: publicKey,
        private_key_encrypted_with_organization_public_key: privateKeyEncryptedWithOrganizationPublicKey
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

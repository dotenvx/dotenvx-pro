const { request } = require('../../lib/helpers/http')

const buildApiError = require('../../lib/helpers/buildApiError')
const systemInformation = require('../../lib/helpers/systemInformation')

class PostMeDeviceRecover {
  constructor (hostname, token, publicKey, userPrivateKeyEncryptedWithDevicePublicKey = null) {
    this.hostname = hostname
    this.token = token
    this.publicKey = publicKey
    this.userPrivateKeyEncryptedWithDevicePublicKey = userPrivateKeyEncryptedWithDevicePublicKey
  }

  async run () {
    const token = this.token
    const url = `${this.hostname}/api/me/device`
    const publicKey = this.publicKey
    const userPrivateKeyEncryptedWithDevicePublicKey = this.userPrivateKeyEncryptedWithDevicePublicKey
    const _systemInformation = await systemInformation()

    const resp = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: publicKey,
        user_private_key_encrypted_with_device_public_key: userPrivateKeyEncryptedWithDevicePublicKey,
        system_information: _systemInformation
      })
    })

    const json = await resp.body.json()

    if (resp.statusCode >= 400) {
      throw buildApiError(resp.statusCode, json)
    }

    return json
  }
}

module.exports = PostMeDeviceRecover

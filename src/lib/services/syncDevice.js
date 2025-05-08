const User = require('./../../db/user')
const PostMeDevice = require('./../../lib/api/postMeDevice')

class SyncDevice {
  constructor (hostname, token, publicKey, userPrivateKeyEncryptedWithDevicePublicKey = null) {
    this.hostname = hostname
    this.token = token
    this.publicKey = publicKey
    this.userPrivateKeyEncryptedWithDevicePublicKey = userPrivateKeyEncryptedWithDevicePublicKey
  }

  async run () {
    const remoteUser = await new PostMeDevice(this.hostname, this.token, this.publicKey, this.userPrivateKeyEncryptedWithDevicePublicKey).run()

    const user = new User()
    user.store.store = remoteUser

    return user
  }
}

module.exports = SyncDevice

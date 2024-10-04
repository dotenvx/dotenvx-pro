const User = require('./../../db/user')
const PostMePublicKey = require('./../../lib/api/postMePublicKey')

class SyncPublicKey {
  constructor (hostname, token, publicKey) {
    this.hostname = hostname
    this.token = token
    this.publicKey = publicKey
  }

  async run () {
    const remoteUser = await new PostMePublicKey(this.hostname, this.token, this.publicKey).run()

    const user = new User()
    user.store.store = remoteUser

    return user
  }
}

module.exports = SyncPublicKey

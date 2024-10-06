const User = require('./../../db/user')
const GetMe = require('./../../lib/api/getMe')

class SyncMe {
  constructor (hostname, token) {
    this.hostname = hostname
    this.token = token
  }

  async run () {
    const me = await new GetMe(this.hostname, this.token).run()

    const user = new User()
    user.store.store = me

    return user
  }
}

module.exports = SyncMe

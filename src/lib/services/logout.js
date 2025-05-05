// db
const current = require('./../../db/current')

// api calls
const PostLogout = require('./../../lib/api/postLogout')

class Logout {
  constructor (hostname = current.hostname()) {
    this.hostname = hostname
  }

  async run () {
    const data = await new PostLogout(this.hostname, current.token()).run()

    const hostname = data.hostname
    const id = data.id
    const username = data.username
    const accessToken = data.access_token
    const settingsDevicesUrl = `${hostname}/settings/devices`

    current.logout(hostname, id, accessToken)

    return { username, accessToken, settingsDevicesUrl }
  }
}

module.exports = Logout

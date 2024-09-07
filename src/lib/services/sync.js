const { request } = require('undici')

const db = require('./../../shared/db')
const currentUser = require('./../../shared/currentUser')

class Sync {
  constructor (apiSyncUrl) {
    this.apiSyncUrl = apiSyncUrl
  }

  async run () {
    const token = currentUser.token()
    const dbJson = db.getJson()

    const body = JSON.stringify({
      db: dbJson
    })
    const response = await request(this.apiSyncUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body
    })

    const responseData = await response.body.json()

    return {
      response,
      responseData
    }
  }
}

module.exports = Sync

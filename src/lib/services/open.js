const gitUrl = require('./../helpers/gitUrl')
const ValidateGit = require('./../helpers/validateGit')
const extractUsernameName = require('./../helpers/extractUsernameName')

// db
const current = require('./../../db/current')

class Open {
  constructor (hostname = current.hostname()) {
    this.hostname = hostname
  }

  async run () {
    new ValidateGit().run()

    const usernameName = this.usernameName()
    const url = `${this.hostname}/gh/${usernameName}`

    return {
      url,
      usernameName
    }
  }

  usernameName () {
    const result = extractUsernameName(gitUrl())
    return result
  }
}

module.exports = Open

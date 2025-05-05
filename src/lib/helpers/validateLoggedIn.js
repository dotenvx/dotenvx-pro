const Errors = require('./errors')

const current = require('./../../db/current')

class ValidateLoggedIn {
  run () {
    if (current.token().length < 1) {
      throw new Errors().loginRequired()
    }

    return true
  }
}

module.exports = ValidateLoggedIn

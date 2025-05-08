const Errors = require('./errors')

const User = require('./../../db/user')

class ValidatePublicKey {
  run () {
    const user = new User()
    if (user.publicKey().length < 1) {
      throw new Errors().missingUserPublicKey()
    }

    return true
  }
}

module.exports = ValidatePublicKey

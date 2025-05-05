const Errors = require('./errors')

const UserPrivateKey = require('./../../db/userPrivateKey')

class ValidatePublicKey {
  run () {
    const userPrivateKey = new UserPrivateKey()
    if (userPrivateKey.publicKey().length < 1) {
      throw new Errors().missingPublicKey()
    }

    return true
  }
}

module.exports = ValidatePublicKey

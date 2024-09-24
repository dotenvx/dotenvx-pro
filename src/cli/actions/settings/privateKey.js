const userPrivateKey = require('./../../../db/userPrivateKey')
const smartMask = require('./../../../lib/helpers/smartMask')

function privateKey () {
  const options = this.opts()

  const privateKey = userPrivateKey.privateKey()
  if (privateKey && privateKey.length > 0) {
    process.stdout.write(smartMask(privateKey, options.unmask))
  } else {
    console.error('missing private key. Try generating one with [dotenvx pro login].')
    process.exit(1)
  }
}

module.exports = privateKey

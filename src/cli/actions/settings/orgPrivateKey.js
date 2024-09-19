const organizationDb = require('./../../../shared/organization')
const smartMask = require('./../../../lib/helpers/smartMask')

function orgPrivateKey () {
  const options = this.opts()

  const privateKey = organizationDb.privateKey()
  if (privateKey && privateKey.length > 0) {
    process.stdout.write(smartMask(privateKey, options.unmask))
  } else {
    console.error('missing private key. Try running [dotenvx pro sync].')
    process.exit(1)
  }
}

module.exports = orgPrivateKey

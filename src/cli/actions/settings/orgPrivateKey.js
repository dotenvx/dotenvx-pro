const Organization = require('./../../../db/organization')
const smartMask = require('./../../../lib/helpers/smartMask')

function orgPrivateKey () {
  const options = this.opts()

  try {
    const organization = new Organization()
    const privateKey = organization.privateKey()

    if (privateKey && privateKey.length > 0) {
      process.stdout.write(smartMask(privateKey, options.unmask))
    } else {
      console.error('missing private key. Try running [dotenvx pro sync].')
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = orgPrivateKey

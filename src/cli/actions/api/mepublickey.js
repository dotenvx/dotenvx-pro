const { logger } = require('@dotenvx/dotenvx')
const current = require('./../../../shared/current')
const userPrivateKey = require('./../../../shared/userPrivateKey')
const PostMePublicKey = require('./../../../lib/api/postMePublicKey')

async function mepublickey () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    const json = await new PostMePublicKey(options.hostname, current.token(), userPrivateKey.publicKey()).run()

    let space = 0
    if (options.prettyPrint) {
      space = 2
    }
    process.stdout.write(JSON.stringify(json, null, space))
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    if (error.help) {
      console.error(error.help)
    }
    process.exit(1)
  }
}

module.exports = mepublickey

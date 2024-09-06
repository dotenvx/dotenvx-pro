const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')
const PostMePublicKey = require('./../../../lib/api/postMePublicKey')

async function mepublickey () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const json = await new PostMePublicKey(currentUser.getHostname(), currentUser.getToken(), currentUser.getPublicKey()).run()

  let space = 0
  if (options.prettyPrint) {
    space = 2
  }
  process.stdout.write(JSON.stringify(json, null, space))
}

module.exports = mepublickey

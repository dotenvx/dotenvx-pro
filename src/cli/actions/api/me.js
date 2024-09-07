const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')
const GetMe = require('./../../../lib/api/getMe')

async function me () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    const json = await new GetMe(options.hostname, currentUser.getToken()).run()

    let space = 0
    if (options.prettyPrint) {
      space = 2
    }
    process.stdout.write(JSON.stringify(json, null, space))
  } catch (error) {
    process.stderr.write(error.message)
    process.exit(1)
  }
}

module.exports = me

const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')
const GetOrganization = require('./../../../lib/api/getOrganization')

async function organization (organizationId) {
  logger.debug(`organizationId: ${organizationId}`)

  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    const json = await new GetOrganization(currentUser.hostname(), currentUser.token(), organizationId).run()

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

module.exports = organization

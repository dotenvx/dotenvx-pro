const { logger } = require('@dotenvx/dotenvx')
const currentUser = require('./../../../shared/currentUser')
const GetOrganization = require('./../../../lib/api/getOrganization')

async function organization (organizationId) {
  logger.debug(`organizationId: ${organizationId}`)

  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const json = await new GetOrganization(currentUser.getHostname(), currentUser.getToken(), organizationId).run()

  let space = 0
  if (options.prettyPrint) {
    space = 2
  }
  process.stdout.write(JSON.stringify(json, null, space))
}

module.exports = organization

const { logger } = require('./../../../shared/logger')

const systemInformationHelper = require('./../../../lib/helpers/systemInformation')

async function systemInformation () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const value = await systemInformationHelper()

  let space = 0
  if (options.prettyPrint) {
    space = 2
  }

  console.log(JSON.stringify(value))

  process.stdout.write(JSON.stringify(value, null, space))
}

module.exports = systemInformation

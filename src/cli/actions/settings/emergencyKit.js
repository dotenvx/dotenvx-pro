const { logger } = require('./../../../shared/logger')
const emergencyKitHelper = require('./../../../lib/helpers/emergencyKit')

function emergencyKit () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  emergencyKitHelper(options)
}

module.exports = emergencyKit

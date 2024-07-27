const { logger } = require('./../../../shared/logger')
const emergencyKit1 = require('./../../../lib/helpers/emergencyKit1')

function emergencyKit () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  emergencyKit1(options)
}

module.exports = emergencyKit

const currentUser = require('./../../../shared/currentUser')
const { logger } = require('./../../../shared/logger')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')
const maskRecoveryPhrase = require('./../../../lib/helpers/maskRecoveryPhrase')

function recoveryPhrase () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  let output = currentUser.getRecoveryPhrase()

  if (!options.unmask) {
    output = maskRecoveryPhrase(output) // mask output
  }

  output = formatRecoveryPhrase(output)

  process.stdout.write(output)
}

module.exports = recoveryPhrase

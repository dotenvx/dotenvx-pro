const maskRecoveryPhrase = require('./maskRecoveryPhrase')

function smartMaskRecoveryPhrase (str, unmask = false) {
  if (unmask) {
    return str
  } else {
    return maskRecoveryPhrase(str)
  }
}

module.exports = smartMaskRecoveryPhrase

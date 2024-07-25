function cleanseRecoveryPhrase (recoveryPhrase) {
  // replace newlines and multiple spaces with a single space
  return recoveryPhrase.replace(/\s+/g, ' ').trim()
}

module.exports = cleanseRecoveryPhrase

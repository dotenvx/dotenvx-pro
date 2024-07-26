function formatRecoveryPhrase (recoveryPhrase) {
  const words = recoveryPhrase.split(' ')
  const maxWordLength = 12 // longest possible word unforgettable
  const paddedWords = words.map(word => word.padEnd(maxWordLength, ' '))
  const rows = []
  // loop and group into 4
  for (let i = 0; i < paddedWords.length; i += 3) {
    rows.push(paddedWords.slice(i, i + 3).join(' '))
  }

  // join with newline
  return rows.join('\n')
}

module.exports = formatRecoveryPhrase

function maskRecoveryPhrase (str) {
  const maxWordLength = 12
  const words = str.split(/\s+/) // split by whitespace
  const firstWord = words[0]
  const maskedWords = words.slice(1).map(word => '*'.repeat(maxWordLength))

  // reconstruct the seed phrase with the newlines preserved
  const maskedStr = [firstWord, ...maskedWords].join(' ')

  // replace the spaces with the original whitespace (spaces and newlines)
  let originalIndex = 0
  const reconstructedStr = str.replace(/\S+/g, () => {
    return maskedStr.split(' ')[originalIndex++]
  })

  return reconstructedStr
}

module.exports = maskRecoveryPhrase

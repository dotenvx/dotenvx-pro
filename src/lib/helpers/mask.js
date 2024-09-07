function mask (str, showChar = 7) {
  if (!str || str.length < 1) {
    return ''
  }

  const visiblePart = str.slice(0, showChar)
  const maskedPart = '*'.repeat(str.length - showChar)

  return visiblePart + maskedPart
}

module.exports = mask

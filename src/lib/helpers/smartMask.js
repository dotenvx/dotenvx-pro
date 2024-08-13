const mask = require('./mask')

function smartMask (str, unmask = false, showChar = 7) {
  if (unmask) {
    return str
  } else {
    return mask(str, showChar)
  }
}

module.exports = smartMask

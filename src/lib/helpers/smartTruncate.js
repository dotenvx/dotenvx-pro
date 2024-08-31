const truncate = require('./truncate')

function smartTruncate (str, unmask = false, showChar = 7) {
  if (unmask) {
    return str
  } else {
    return truncate(str, showChar)
  }
}

module.exports = smartTruncate

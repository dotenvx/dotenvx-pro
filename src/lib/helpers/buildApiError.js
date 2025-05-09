function buildApiError (statusCode, json) {
  const code = statusCode.toString()
  const message = `[${code}] ${json.error.message}`
  const help = `[${code}] ${JSON.stringify(json)}`

  const error = new Error(message)
  error.code = code
  error.help = help

  return error
}

module.exports = buildApiError

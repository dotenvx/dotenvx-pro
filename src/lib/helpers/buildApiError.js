function buildApiError (statusCode, json) {
  const error = new Error(json.error.message)
  error.code = statusCode.toString()
  error.help = JSON.stringify(json)

  return error
}

module.exports = buildApiError

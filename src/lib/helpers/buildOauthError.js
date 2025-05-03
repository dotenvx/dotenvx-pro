function buildOauthError (statusCode, json) {
  const code = json.error // TAKE CAUTION CHANGING THIS. the polling for an oauth token relies on it
  const message = `[${code}] ${json.error_description}`
  const help = `[${code}] ${JSON.stringify(json)}`

  const error = new Error(message)
  error.code = code
  error.help = help

  return error
}

module.exports = buildOauthError

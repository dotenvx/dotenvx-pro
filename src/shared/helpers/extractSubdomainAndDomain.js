const { URL } = require('url')

function extractSubdomainAndDomain(urlString) {
  // Parse the URL
  const url = new URL(urlString)

  // Extract hostname (includes subdomain, domain, and top-level domain)
  const hostname = url.hostname

  // Check if port is present
  const port = url.port ? `:${url.port}` : ''

  // Combine hostname and port if present
  const result = `${hostname}${port}`

  return result
}

module.exports = extractSubdomainAndDomain

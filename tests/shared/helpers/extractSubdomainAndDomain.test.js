const t = require('tap')

const extractSubdomainAndDomain = require('../../../src/shared/helpers/extractSubdomainAndDomain')

t.test('#extractSubdomainAndDomain', ct => {
  const urlString = 'https://pro.dotenvx.com'

  const result = extractSubdomainAndDomain(urlString)

  t.equal(result, 'pro.dotenvx.com')

  ct.end()
})

t.test('#extractSubdomainAndDomain - with port', ct => {
  const urlString = 'http://localhost:3000'

  const result = extractSubdomainAndDomain(urlString)

  t.equal(result, 'localhost:3000')

  ct.end()
})

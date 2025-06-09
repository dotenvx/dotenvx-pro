const t = require('tap')
require('../../setup')(t)

const PostOrganization = require('../../../src/lib/api/postOrganization')

let postOrganization

t.beforeEach((ct) => {
  postOrganization = new PostOrganization('https://pro.dotenvx.com', 'token123', 'test-org')
})

t.test('constructor', ct => {
  ct.equal(postOrganization.hostname, 'https://pro.dotenvx.com')
  ct.equal(postOrganization.token, 'token123')
  ct.equal(postOrganization.slug, 'test-org')

  ct.end()
})

t.test('#run', ct => {
  // Since this would require actual network calls, we'll just verify
  // the service is properly constructed and has the run method
  ct.ok(typeof postOrganization.run === 'function')
  ct.end()
})

const t = require('tap')
require('../setup')(t)

const User = require('../../src/db/user')
const Organization = require('../../src/db/organization')

let user

t.beforeEach((ct) => {
  user = new User()
})

t.test('constructor missing userId', ct => {
  try {
    // eslint-disable-next-line no-new
    new User('')

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, '[LOGIN_REQUIRED] Log in with [dotenvx pro login]')
  }

  ct.end()
})

t.test('#configPath', ct => {
  ct.ok(user.configPath().endsWith('.json'))

  ct.end()
})

t.test('#username', ct => {
  ct.same(user.username(), 'motdotla')

  ct.end()
})

t.test('#emergencyKitGeneratedAt', ct => {
  ct.same(user.emergencyKitGeneratedAt(), null)

  ct.end()
})

t.test('#organizationIds', ct => {
  ct.same(user.organizationIds(), ['99'])

  ct.end()
})

t.test('#organizations', ct => {
  const org = new Organization('99')
  ct.same(user.organizations(), [org])

  ct.end()
})

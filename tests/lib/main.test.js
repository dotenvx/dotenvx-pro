const t = require('tap')
require('../setup')(t)

const main = require('../../src/lib/main')

const envFile = 'tests/repos/dotenvx/app0/.env'

t.beforeEach((ct) => {
  // important, clear process.env before each test
  process.env = {}
})

t.afterEach((ct) => {
})

t.test('#config (no arguments)', ct => {
  const result = main.config({ path: envFile })

  ct.same(result, { parsed: { HELLO: 'World' } })

  ct.end()
})

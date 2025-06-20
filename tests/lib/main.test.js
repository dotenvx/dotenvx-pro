const t = require('tap')
require('../setup')(t)

const { getColor } = require('@dotenvx/dotenvx')
const capcon = require('capture-console')

const main = require('../../src/lib/main')
const packageJson = require('../../src/lib/helpers/packageJson')

const envFile = 'tests/repos/dotenvx/app0/.env'

t.beforeEach((ct) => {
  // important, clear process.env before each test
  process.env = {}
})

t.afterEach((ct) => {
})

t.test('#config (string path)', ct => {
  const result = main.config({ path: envFile })

  ct.same(result, { parsed: { HELLO: 'World' } })

  ct.end()
})

t.test('#config (string path) capture success message', ct => {
  const stdout = capcon.interceptStdout(() => {
    main.config({ path: envFile })
  })

  ct.match(
    stdout,
    `[dotenvx-pro@${packageJson.version}] injecting env (1) from tests/repos/dotenvx/app0/.env`,
    'includes expected success message'
  )

  ct.end()
})

t.test('#config (logName and logVersion) capture success message', ct => {
  const stdout = capcon.interceptStdout(() => {
    main.config({ path: envFile, logName: 'foo', logVersion: '0.0.1' })
  })

  ct.match(
    stdout,
    `[foo@0.0.1] injecting env (1) from tests/repos/dotenvx/app0/.env`,
    'includes expected success message'
  )

  ct.end()
})

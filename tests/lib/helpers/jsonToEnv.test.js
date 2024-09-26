const t = require('tap')

const jsonToEnv = require('../../../src/lib/helpers/jsonToEnv')

t.test('#jsonToEnv', ct => {
  const json = {
    HELLO: 'World'
  }

  const result = jsonToEnv(json)

  ct.same(result, 'HELLO="World"')

  ct.end()
})

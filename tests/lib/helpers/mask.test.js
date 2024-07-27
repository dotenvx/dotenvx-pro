const t = require('tap')

const mask = require('../../../src/lib/helpers/mask')

t.test('#mask', ct => {
  const privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'

  const result = mask(privateKey)

  t.equal(result, '2c93601*********************************************************')

  ct.end()
})

t.test('#mask - 11 characters', ct => {
  const privateKey = 'dxo_123456789'

  const result = mask(privateKey, 11)

  t.equal(result, 'dxo_1234567**')

  ct.end()
})

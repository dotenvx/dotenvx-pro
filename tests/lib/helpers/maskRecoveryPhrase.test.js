const t = require('tap')

const maskRecoveryPhrase = require('../../../src/lib/helpers/maskRecoveryPhrase')

t.test('#maskRecoveryPhrase', ct => {
  const recoveryPhrase = 'cart guess electric adult carpet ritual wisdom obscure season tiger spatial stable arrow narrow rely almost brisk arrange dune dawn roast venture install dinosaur'

  const result = maskRecoveryPhrase(recoveryPhrase)

  t.equal(result, 'cart ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************ ************')

  ct.end()
})

t.test('#maskRecoveryPhrase - no words', ct => {
  const recoveryPhrase = ''

  const result = maskRecoveryPhrase(recoveryPhrase)

  t.equal(result, '')

  ct.end()
})

const t = require('tap')

const formatRecoveryPhrase = require('../../../src/lib/helpers/formatRecoveryPhrase')

t.test('#formatRecoveryPhrase', ct => {
  const recoveryPhrase = 'cart guess electric adult carpet ritual wisdom obscure season tiger spatial stable arrow narrow rely almost brisk arrange dune dawn roast venture install dinosaur'

  const result = formatRecoveryPhrase(recoveryPhrase)

  t.equal(result.split('\n')[0], 'cart         guess        electric     adult       ')
  t.equal(result.split('\n')[1], 'carpet       ritual       wisdom       obscure     ')
  t.equal(result.split('\n')[2], 'season       tiger        spatial      stable      ')
  t.equal(result.split('\n')[3], 'arrow        narrow       rely         almost      ')
  t.equal(result.split('\n')[4], 'brisk        arrange      dune         dawn        ')
  t.equal(result.split('\n')[5], 'roast        venture      install      dinosaur    ')

  ct.end()
})

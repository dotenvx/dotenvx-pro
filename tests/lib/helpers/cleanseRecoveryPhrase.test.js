const t = require('tap')

const cleanseRecoveryPhrase = require('../../../src/lib/helpers/cleanseRecoveryPhrase')

t.test('#cleanseRecoveryPhrase', ct => {
  const recoveryPhrase = 'crime    issue    visual  \n' +
    'boost    speed    grace   \n' +
    'sell     pilot    trick   \n' +
    'liar     foil     key     \n' +
    'sense    add      stuff   \n' +
    'twice    service  desert  \n' +
    'memory   hire     promote \n' +
    'distance road     exercise\n'

  const result = cleanseRecoveryPhrase(recoveryPhrase)

  t.equal(result, 'crime issue visual boost speed grace sell pilot trick liar foil key sense add stuff twice service desert memory hire promote distance road exercise')

  ct.end()
})

const t = require('tap')

const parseUsernameFromFullUsername = require('../../../src/shared/helpers/parseUsernameFromFullUsername')

t.test('#parseUsernameFromFullUsername', ct => {
  const result = parseUsernameFromFullUsername('gh/motdotla')

  ct.same(result, 'motdotla')

  ct.end()
})

t.test('#parseUsernameFromFullUsername - username has underscores', ct => {
  const result = parseUsernameFromFullUsername('gh/motdotla_1')

  ct.same(result, 'motdotla_1')

  ct.end()
})

t.test('#parseUsernameFromFullUsername - username has gh in it', ct => {
  const result = parseUsernameFromFullUsername('gh/gh_motdotla_1')

  ct.same(result, 'gh_motdotla_1')

  ct.end()
})

t.test('#parseUsernameFromFullUsername - gitlab', ct => {
  const result = parseUsernameFromFullUsername('gl/motdotla')

  ct.same(result, 'motdotla')

  ct.end()
})

t.test('#parseUsernameFromFullUsername - dashes', ct => {
  const result = parseUsernameFromFullUsername('gl/motdotla-1')

  ct.same(result, 'motdotla-1')

  ct.end()
})

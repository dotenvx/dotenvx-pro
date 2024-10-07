const t = require('tap')

const extractSlug = require('../../../src/lib/helpers/extractSlug')

t.test('#extractSlug', ct => {
  const result = extractSlug('slug/project-name')
  ct.same(result, 'slug')

  ct.end()
})

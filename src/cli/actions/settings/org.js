const organizationDb = require('./../../../db/organization')

function org () {
  const slug = organizationDb.slug()
  if (slug) {
    process.stdout.write(slug)
  } else {
    console.error('missing slug. Try running [dotenvx pro sync].')
    process.exit(1)
  }
}

module.exports = org

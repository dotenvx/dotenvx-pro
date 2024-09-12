const organizationDb = require('./../../../shared/organization')

function organization () {
  const slug = organizationDb.slug()
  if (slug) {
    process.stdout.write(slug)
  } else {
    console.error('missing slug. Try running [dotenvx pro sync].')
    process.exit(1)
  }
}

module.exports = organization

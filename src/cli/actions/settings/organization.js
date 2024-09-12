const organizationDb = require('./../../../shared/organization')

function organization () {
  try {
    process.stdout.write(organizationDb.slug())
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    if (error.help) {
      console.error(error.help)
    }
    process.exit(1)
  }
}

module.exports = organization

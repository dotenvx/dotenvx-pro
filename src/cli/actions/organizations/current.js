const currentUser = require('./../../../shared/currentUser')
const GetOrganization = require('./../../../lib/api/getOrganization')

async function current () {
  const options = this.opts()
  const hostname = options.hostname

  try {
    const organization = await new GetOrganization(hostname, currentUser.token(), currentUser.organizationId()).run()

    process.stdout.write(organization.slug)
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    if (error.status === 404 || error.status === '404') {
      console.error('? try running [dotenvx pro organizations choose]')
    }
    process.exit(1)
  }
}

module.exports = current

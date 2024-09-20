const Enquirer = require('enquirer')
const enquirer = new Enquirer()
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../../shared/current')
const GetOrganizations = require('./../../../lib/api/getOrganizations')

async function login () {
  const options = this.opts()
  const hostname = options.hostname

  try {
    const organizations = await new GetOrganizations(hostname, current.token()).run()

    const lookups = {}
    for (const row of organizations) {
      lookups[row.slug] = row.id
    }
    const slugs = Object.keys(lookups)

    if (slugs.length > 0) {
      const input = await enquirer.prompt({
        type: 'select',
        name: 'organization',
        message: 'Choose an organization',
        choices: slugs
      })

      const organizationId = lookups[input.organization]
      current.loginOrganization(organizationId)

      logger.success(`✔ ${input.organization} set`)
    } else {
      logger.error('Create an organization [dotenvx pro settings orgnew] or join one [dotenvx pro organizations join].')
    }
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    process.exit(1)
  }
}

module.exports = login

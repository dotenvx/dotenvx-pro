const Enquirer = require('enquirer')
const enquirer = new Enquirer()
const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../../shared/currentUser')
const GetOrganizations = require('./../../../lib/api/getOrganizations')

async function choose () {
  const options = this.opts()
  const hostname = options.hostname

  try {
    const organizations = await new GetOrganizations(hostname, currentUser.token()).run()

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
      currentUser.chooseOrganization(organizationId)

      logger.success(`✔ ${input.organization} set`)
    } else {
      logger.error('✖ missing organization(s)')
      logger.help('? create an organization [dotenvx pro organizations new] or ask your teammate to invite you.')
    }
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    process.exit(1)
  }
}

module.exports = choose

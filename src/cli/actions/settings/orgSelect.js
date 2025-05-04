const Enquirer = require('enquirer')
const enquirer = new Enquirer()
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../../db/current')
const GetOrganizations = require('./../../../lib/api/getOrganizations')

async function orgSelect () {
  try {
    const token = current.token()
    if (!token || token.length < 1) {
      const error = new Error('login required. Log in with [dotenvx pro login].')
      throw error
    }

    const organizations = await new GetOrganizations(current.hostname(), token).run()

    const lookups = {}
    for (const row of organizations) {
      lookups[row.slug] = row.id
    }
    const slugs = Object.keys(lookups)

    if (slugs.length > 0) {
      const input = await enquirer.prompt({
        type: 'select',
        name: 'organization',
        message: 'Select an organization',
        choices: slugs
      })

      const organizationId = lookups[input.organization]
      current.selectOrganization(organizationId)

      logger.success(`✔ ${input.organization} set`)
    } else {
      logger.error('Create an organization [dotenvx pro settings orgnew] or join one [dotenvx pro settings orgjoin].')
    }
  } catch (error) {
    if (error.message) {
      logger.error(error.message)
    }
    process.exit(1)
  }
}

module.exports = orgSelect

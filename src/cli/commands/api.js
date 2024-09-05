const { Command } = require('commander')

const api = new Command('api')

api
  .description('📡 api')
  .allowUnknownOption()

// dotenvx api me
const meAction = require('./../actions/api/me')
api
  .command('me')
  .description('/api/me')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(meAction)

// dotenvx api organization
const organizationAction = require('./../actions/api/organization')
api
  .command('organization')
  .argument('<organizationHashid>', 'organization hashid')
  .description('/api/organization/:hashid')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(organizationAction)

module.exports = api

const { Command } = require('commander')
const store = require('./../../shared/store')

const organizations = new Command('organizations')

organizations
  .description('🏢 manage organizations')
  .allowUnknownOption()

// dotenvx pro organizations new
const newAction = require('./../actions/organizations/new')
organizations
  .command('new')
  .description('create organization')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .action(newAction)

// dotenvx pro organizations list
const listAction = require('./../actions/organizations/list')
organizations
  .command('list')
  .description('list my organizations')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .option('--unmask', 'unmask sensitive data')
  .action(listAction)

// dotenvx pro organizations team <organizationSlug>
const teamAction = require('./../actions/organizations/team')
organizations
  .command('team')
  .description('list team for organization')
  .argument('<organizationSlug>', 'organization slug')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .option('--unmask', 'unmask sensitive data')
  .action(teamAction)

module.exports = organizations

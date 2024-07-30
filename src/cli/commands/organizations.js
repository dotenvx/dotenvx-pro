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

module.exports = organizations

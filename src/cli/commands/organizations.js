const { Command } = require('commander')
const current = require('./../../shared/current')

const organizations = new Command('organizations')

organizations
  .description('🏢 manage organizations')
  .allowUnknownOption()

// dotenvx pro organizations login
const loginAction = require('./../actions/organizations/login')
organizations
  .command('login')
  .description('log in to organization')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(loginAction)

module.exports = organizations

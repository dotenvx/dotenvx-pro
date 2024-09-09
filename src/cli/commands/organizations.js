const { Command } = require('commander')
const currentUser = require('./../../shared/currentUser')

const organizations = new Command('organizations')

organizations
  .description('🏢 manage organizations')
  .allowUnknownOption()

// dotenvx pro organizations new
const newAction = require('./../actions/organizations/new')
organizations
  .command('new')
  .description('create organization')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(newAction)

// dotenvx pro organizations list
const listAction = require('./../actions/organizations/list')
organizations
  .command('list')
  .description('list my organizations')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .option('--unmask', 'unmask sensitive data')
  .action(listAction)

module.exports = organizations

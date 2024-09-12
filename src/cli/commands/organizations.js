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

// dotenvx pro organizations login
const loginAction = require('./../actions/organizations/login')
organizations
  .command('login')
  .description('log in to organization')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(loginAction)

// dotenvx pro organizations list
const listAction = require('./../actions/organizations/list')
organizations
  .command('list')
  .description('list my organizations')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .option('--unmask', 'unmask sensitive data')
  .action(listAction)

// dotenvx pro organizations current
const currentAction = require('./../actions/organizations/current')
organizations
  .command('current')
  .description('print current organization')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(currentAction)

module.exports = organizations

const { Command } = require('commander')
const currentUser = require('./../../shared/currentUser')

const team = new Command('team')

team
  .description('👥 manage team')
  .allowUnknownOption()

// dotenvx pro team list
const listAction = require('./../actions/team/list')
team
  .command('list')
  .description('list team members')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .option('--unmask', 'unmask sensitive data')
  .action(listAction)

module.exports = team

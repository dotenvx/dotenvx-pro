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

// dotenvx api me
const meAction = require('./../actions/api/me')
api
  .command('me')
  .description('/api/me')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(meAction)


module.exports = api

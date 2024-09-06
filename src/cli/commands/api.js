const { Command } = require('commander')

const api = new Command('api')

api
  .description('📡 api')
  .allowUnknownOption()

// dotenvx api me
const meAction = require('./../actions/api/me')
api
  .command('me')
  .description('GET /api/me')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(meAction)

// dotenvx api mepublickey
const mepublickeyAction = require('./../actions/api/mepublickey')
api
  .command('mepublickey')
  .description('POST /api/me/public_key')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(mepublickeyAction)

// dotenvx api organization
const organizationAction = require('./../actions/api/organization')
api
  .command('organization')
  .argument('<organizationHashid>', 'organization hashid')
  .description('GET /api/organization/:hashid')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(organizationAction)

module.exports = api

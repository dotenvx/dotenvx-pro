const { Command } = require('commander')
const currentUser = require('./../../shared/currentUser')

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
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(meAction)

// dotenvx api mepublickey
const mepublickeyAction = require('./../actions/api/mepublickey')
api
  .command('mepublickey')
  .description('POST /api/me/public_key')
  .option('-pp, --pretty-print', 'pretty print output')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(mepublickeyAction)

// dotenvx api meemergencykit
const meemergencykitAction = require('./../actions/api/meemergencykit')
api
  .command('meemergencykit')
  .description('POST /api/me/emergency_kit')
  .option('-pp, --pretty-print', 'pretty print output')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(meemergencykitAction)

// dotenvx api organization
const organizationAction = require('./../actions/api/organization')
api
  .command('organization')
  .argument('<organizationId>', 'organization id')
  .description('GET /api/organization/:id')
  .option('-pp, --pretty-print', 'pretty print output')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(organizationAction)

module.exports = api

const { Command } = require('commander')
const currentUser = require('./../../shared/currentUser')

const settings = new Command('settings')

settings
  .description('⚙️  settings')
  .allowUnknownOption()

// dotenvx pro settings username
const usernameAction = require('./../actions/settings/username')
settings
  .command('username')
  .description('print your username')
  .action(usernameAction)

// dotenvx pro settings organization
const organizationCurrentAction = require('./../actions/organizations/current')
settings
  .command('organization')
  .description('print your organization')
  .option('-h, --hostname <url>', 'set hostname', currentUser.hostname())
  .action(organizationCurrentAction)

// dotenvx pro settings token
const tokenAction = require('./../actions/settings/token')
settings
  .command('token')
  .description('print your access token (--unmask)')
  .option('--unmask', 'unmask access token')
  .action(tokenAction)

// dotenvx pro settings publickey
const publicKeyAction = require('./../actions/settings/publicKey')
settings
  .command('publickey')
  .description('print your publicKey')
  .action(publicKeyAction)

// dotenvx pro settings privateKey
const privateKeyAction = require('./../actions/settings/privateKey')
settings
  .command('privatekey')
  .description('print your privateKey (--unmask)')
  .option('--unmask', 'unmask privateKey')
  .action(privateKeyAction)

// dotenvx pro settings recoveryphrase
const recoveryPhraseAction = require('./../actions/settings/recoveryPhrase')
settings
  .command('recoveryphrase')
  .description('print your recovery phrase (--unmask)')
  .option('--unmask', 'unmask recovery phrase')
  .action(recoveryPhraseAction)

// dotenvx pro settings emergencykit
const emergencyKitAction = require('./../actions/settings/emergencyKit')
settings
  .command('emergencykit')
  .description('generate your emergency kit (--unmask)')
  .option('--unmask', 'unmask recovery phrase')
  .action(emergencyKitAction)

// dotenvx pro settings recover
const recover = require('./../actions/settings/recover')
settings
  .command('recover')
  .description('recover your account 🔐')
  .action(recover)

module.exports = settings

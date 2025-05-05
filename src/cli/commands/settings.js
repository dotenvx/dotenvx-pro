const { Command } = require('commander')

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
  .option('--stdout', 'send to stdout')
  .action(emergencyKitAction)

// dotenvx pro settings recover
const recoverAction = require('./../actions/settings/recover')
settings
  .command('recover')
  .description('recover your account 🔐')
  .action(recoverAction)

// dotenvx pro settings org
const orgAction = require('./../actions/settings/org')
settings
  .command('org')
  .description('print organization')
  .action(orgAction)

// dotenvx pro settings orgpublickey
const orgPublicKeyAction = require('./../actions/settings/orgPublicKey')
settings
  .command('orgpublickey')
  .description('print organization publicKey')
  .action(orgPublicKeyAction)

// dotenvx pro settings orgprivatekey
const orgPrivateKeyAction = require('./../actions/settings/orgPrivateKey')
settings
  .command('orgprivatekey')
  .description('print organization privateKey (--unmask)')
  .option('--unmask', 'unmask privateKey')
  .action(orgPrivateKeyAction)

// dotenvx pro settings orgteam
const orgTeamAction = require('./../actions/settings/orgTeam')
settings
  .command('orgteam')
  .description('print organization team')
  .action(orgTeamAction)

// dotenvx pro settings orgconnect
const orgConnectAction = require('./../actions/settings/orgConnect')
settings
  .command('orgconnect')
  .description('connect organization')
  .action(orgConnectAction)

// dotenvx pro settings orgselect
const orgSelectAction = require('./../actions/settings/orgSelect')
settings
  .command('orgselect')
  .description('select organization')
  .action(orgSelectAction)

// dotenvx pro settings hostname
const hostnameAction = require('./../actions/settings/hostname')
settings
  .command('hostname')
  .description('print hostname')
  .action(hostnameAction)

// dotenvx pro settings storetree
const storetreeAction = require('./../actions/settings/storetree')
settings
  .command('storetree')
  .description('print store tree')
  .action(storetreeAction)

module.exports = settings

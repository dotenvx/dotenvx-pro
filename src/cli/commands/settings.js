const { Command } = require('commander')

const settings = new Command('settings')

settings
  .description('⚙️  settings')
  .allowUnknownOption()

// dotenvx pro settings status
const statusAction = require('./../actions/settings/status')
settings.command('status')
  .description('display logged in user')
  .action(statusAction)

// dotenvx pro settings token
const tokenAction = require('./../actions/settings/token')
settings
  .command('token')
  .description('print the auth token dotenvx pro is configured to use')
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
  .description('print your privateKey')
  .action(privateKeyAction)

// dotenvx pro settings recoveryphrase
const recoveryPhraseAction = require('./../actions/settings/recoveryPhrase')
settings
  .command('recoveryphrase')
  .description('print your bip-39 recovery phrase')
  .action(recoveryPhraseAction)

module.exports = settings

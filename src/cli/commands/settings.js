const { Command } = require('commander')

const settings = new Command('settings')

settings
  .description('⚙️  settings')
  .allowUnknownOption()

// dotenvx pro settings status
const statusAction = require('./../actions/settings/status')
settings.command('status')
  .description('check account status')
  .action(statusAction)

// dotenvx pro settings token
const tokenAction = require('./../actions/settings/token')
settings
  .command('token')
  .description('print your dotenvx access token')
  .action(tokenAction)

// dotenvx pro settings publickey
const publicKeyAction = require('./../actions/settings/publicKey')
settings
  .command('publickey')
  .description('print your publicKey')
  .action(publicKeyAction)

// dotenvx pro settings recoveryphrase
const recoveryPhraseAction = require('./../actions/settings/recoveryPhrase')
settings
  .command('recoveryphrase')
  .description('print your recovery phrase')
  .action(recoveryPhraseAction)

// dotenvx pro settings systeminformation
const systemInformationAction = require('./../actions/settings/systemInformation')
settings
  .command('systeminformation')
  .description('print your machine\'s systeminformation')
  .option('-pp, --pretty-print', 'pretty print output')
  .action(systemInformationAction)

const recover = require('./../actions/settings/recover')
settings
  .command('recover')
  .description('recover your account 🔐')
  .action(recover)

module.exports = settings

#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const { setLogLevel } = require('@dotenvx/dotenvx')

const packageJson = require('./../lib/helpers/packageJson')
const current = require('./../db/current')

// global log levels
program
  .option('-l, --log-level <level>', 'set log level', 'info')
  .option('-q, --quiet', 'sets log level to error')
  .option('-v, --verbose', 'sets log level to verbose')
  .option('-d, --debug', 'sets log level to debug')
  .hook('preAction', (thisCommand, actionCommand) => {
    const options = thisCommand.opts()

    setLogLevel(options)
  })

// cli
program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)

// dotenvx pro sync
const syncAction = require('./actions/sync')
program
  .command('sync')
  .description('sync')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(syncAction)

// dotenvx pro push
const pushAction = require('./actions/push')
program
  .command('push')
  .description('push')
  .option('-f, --env-file <paths...>', 'path(s) to your env file(s)', '.env')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(pushAction)

// dotenvx pro pull
const pullAction = require('./actions/pull')
program
  .command('pull')
  .description('pull')
  .option('-f, --env-file <paths...>', 'path(s) to your env file(s)', '.env')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(pullAction)

// dotenvx pro login
const loginAction = require('./actions/login')
program
  .command('login')
  .description('log in')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(loginAction)

// dotenvx pro logout
const logoutAction = require('./actions/logout')
program
  .command('logout')
  .description('log out')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(logoutAction)

// dotenvx pro keypair
const keypairAction = require('./actions/keypair')
program.command('keypair')
  .description('print public/private keys for .env file(s)')
  .argument('[key]', 'environment variable key name')
  .option('-f, --env-file <paths...>', 'path(s) to your env file(s)')
  .option('-pp, --pretty-print', 'pretty print output')
  .option('--format <type>', 'format of the output (json, shell)', 'json')
  .action(keypairAction)

// dotenvx pro ls
const lsAction = require('./actions/ls')
program.command('ls')
  .description('print all .env files in a tree structure')
  .argument('[directory]', 'directory to list .env files from', '.')
  .option('-f, --env-file <filenames...>', 'path(s) to your env file(s)', '.env*')
  .option('-ef, --exclude-env-file <excludeFilenames...>', 'path(s) to exclude from your env file(s) (default: none)')
  .action(lsAction)

// dotenvx pro settings
program.addCommand(require('./commands/settings'))

// overide helpInformation to hide help command
program.helpInformation = function () {
  const originalHelp = Command.prototype.helpInformation.call(this)
  const lines = originalHelp.split('\n')

  // filter out the hidden command from the help output
  const filteredLines = lines.filter(line => !line.includes('help [command]'))

  return filteredLines.join('\n')
}

program.parse(process.argv)

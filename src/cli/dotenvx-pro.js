#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const { setLogLevel } = require('@dotenvx/dotenvx')

const packageJson = require('./../lib/helpers/packageJson')
const current = require('./../shared/current')

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

const syncAction = require('./actions/sync')
program
  .command('sync')
  .description('sync')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(syncAction)

// const pushAction = require('./actions/push')
// program
//   .command('push')
//   .description('push .env.keys')
//   .argument('[directory]', 'directory to push', '.')
//   .option('-f, --env-file <paths...>', 'path(s) to your env file(s)', '.env')
//   .option('-h, --hostname <url>', 'set hostname', current.hostname())
//   .action(pushAction)
//
const loginAction = require('./actions/login')
program
  .command('login')
  .description('log in')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(loginAction)

const logoutAction = require('./actions/logout')
program
  .command('logout')
  .description('log out')
  .option('-h, --hostname <url>', 'set hostname', current.hostname())
  .action(logoutAction)

// dotenvx pro ls
const lsAction = require('./actions/ls')
program.command('ls')
  .description('print all .env files in a tree structure')
  .argument('[directory]', 'directory to list .env files from', '.')
  .option('-f, --env-file <filenames...>', 'path(s) to your env file(s)', '.env*')
  .option('-ef, --exclude-env-file <excludeFilenames...>', 'path(s) to exclude from your env file(s) (default: none)')
  .action(lsAction)

// dotenvx pro organizations
program.addCommand(require('./commands/organizations'))

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

#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()

const packageJson = require('./../lib/helpers/packageJson')
const store = require('./../shared/store')
const { setLogLevel } = require('./../shared/logger')

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

const loginAction = require('./actions/login')
program
  .command('login')
  .description('authenticate to dotenvx pro')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .action(loginAction)

const logoutAction = require('./actions/logout')
program
  .command('logout')
  .description('log out this machine from dotenvx pro')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .action(logoutAction)

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

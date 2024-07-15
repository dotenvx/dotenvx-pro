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

const tokenAction = require('./actions/token')
program
  .command('token')
  .description('print the auth token dotenvx pro is configured to use')
  .option('-h, --hostname <url>', 'set hostname', 'https://pro.dotenvx.com')
  .action(tokenAction)

const statusAction = require('./actions/status')
program
  .command('status')
  .description('display logged in user')
  .action(statusAction)

const logoutAction = require('./actions/logout')
program
  .command('logout')
  .description('log out this machine from dotenvx pro')
  .option('-h, --hostname <url>', 'set hostname', store.getHostname())
  .action(logoutAction)

program.parse(process.argv)

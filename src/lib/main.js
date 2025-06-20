const dotenvx = require('@dotenvx/dotenvx')
const packageJson = require('./helpers/packageJson')

// services
const Keypair = require('./services/keypair')

const config = function (options = {}) {
  options.logName = options.logName || 'dotenvx-pro'
  options.logVersion = options.logVersion || packageJson.version

  return dotenvx.config(options)
}

/** @type {import('./main').keypair} */
const keypair = function (envFile, key) {
  return new Keypair(envFile, key).run()
}

module.exports = {
  config,
  keypair
}

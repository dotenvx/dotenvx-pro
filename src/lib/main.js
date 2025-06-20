const dotenvx = require('@dotenvx/dotenvx')

// services
const Keypair = require('./services/keypair')

const config = function (options = {}) {
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

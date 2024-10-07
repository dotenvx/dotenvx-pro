// services
const Keypair = require('./services/keypair')

/** @type {import('./main').keypair} */
const keypair = function (envFile, key) {
  return new Keypair(envFile, key).run()
}

module.exports = {
  keypair
}

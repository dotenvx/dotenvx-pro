const current = require('./../../../db/current')

function hostname () {
  try {
    const _hostname = current.hostname()
    if (_hostname && _hostname.length > 1) {
      process.stdout.write(_hostname)
    } else {
      console.error('missing hostname. Try running [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = hostname

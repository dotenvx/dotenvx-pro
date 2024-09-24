const user = require('./../../../db/user')

async function username () {
  const username = user.username()
  if (username) {
    process.stdout.write(username)
  } else {
    console.error('missing username. Try running [dotenvx pro sync].')
    process.exit(1)
  }
}

module.exports = username

const User = require('./../../../db/user')

async function username () {
  try {
    const user = new User()
    const username = user.username()

    if (username) {
      process.stdout.write(username)
    } else {
      console.error('missing username. Try running [dotenvx pro sync].')
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = username

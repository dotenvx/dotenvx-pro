const user = require('./../../../shared/user')

async function username () {
  try {
    process.stdout.write(user.username())
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    if (error.help) {
      console.error(error.help)
    }
    process.exit(1)
  }
}

module.exports = username

const currentUser = require('./../../../shared/currentUser')
const GetMe = require('./../../../lib/api/getMe')

async function username () {
  try {
    const me = await new GetMe(currentUser.hostname(), currentUser.token()).run()
    process.stdout.write(me.username)
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

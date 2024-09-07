const { logger } = require('@dotenvx/dotenvx')

const currentUser = require('./../../shared/currentUser')

const { createSpinner } = require('./../../lib/helpers/createSpinner')
const PostMePublicKey = require('./../../lib/api/postMePublicKey')
const organizationIds = require('./../../lib/helpers/organizationIds')

const spinner = createSpinner('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    // verify/sync public key
    spinner.start('public key')
    if (currentUser.publicKey().length < 1) {
      const error = new Error()
      error.message = 'missing public key. Try generating one with [dotenvx pro login].'
      throw error
    }
    const me = await new PostMePublicKey(options.hostname, currentUser.token(), currentUser.publicKey()).run()
    spinner.succeed('public key')

    // verify private key (assumed good since public key generated from private key)
    spinner.start('private key')
    spinner.succeed('private key')

    // verify emergency kit
    spinner.start('emergency kit')
    if (!me.emergency_kit_generated_at) {
      const error = new Error()
      error.message = 'emergency kit must be generated once. Generate it with [dotenvx pro settings emergencykit --unmask > kit.pdf]'
      throw error
    }
    spinner.succeed('emergency kit')

    // organization(s) - check if any
    spinner.start('organization(s)')
    const _organizationIds = organizationIds(me)
    if (!_organizationIds || _organizationIds.length < 1) {
      const error = new Error()
      error.message = `missing organization(s). Ask your teammate to invite you [${me.username}] or create your own [dotenvx pro organizations new]`
      throw error
    }
    spinner.succeed('organization(s)')
  } catch (error) {
    if (error.message) {
      spinner.fail(error.message)
    } else {
      spinner.fail(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    process.exit(1)
  }

  // const hostname = options.hostname
  // const apiSyncUrl = `${hostname}/api/sync`

  // spinner.start('syncing')

  // const { response, responseData } = await new Sync(apiSyncUrl).run()

  // logger.debug(responseData)

  // if (response.statusCode >= 400) {
  //   spinner.fail(`[${responseData.error.code}] ${responseData.error.message}`)
  // } else {
  //   db.setSync(responseData) // sync to local
  //   spinner.succeed('synced')
  // }
}

module.exports = sync

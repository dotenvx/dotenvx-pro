const { logger } = require('@dotenvx/dotenvx')
const { PrivateKey } = require('eciesjs')

const currentUser = require('./../../shared/currentUser')

const { createSpinner } = require('./../../lib/helpers/createSpinner')
const encryptValue = require('./../../lib/helpers/encryptValue')
const decryptValue = require('./../../lib/helpers/decryptValue')
const organizationIds = require('./../../lib/helpers/organizationIds')
const GetOrganization = require('./../../lib/api/getOrganization')
const PostMePublicKey = require('./../../lib/api/postMePublicKey')
const PostOrganizationPublicKey = require('./../../lib/api/postOrganizationPublicKey')

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
      error.message = `missing organization(s). Ask your teammate to invite you [${me.username}] or create your own [dotenvx pro organizations new].`
      throw error
    }
    spinner.succeed('organization(s)')

    for (let i = 0; i < _organizationIds.length; i++) {
      const organizationId = _organizationIds[i]
      const getOrganization = await new GetOrganization(currentUser.hostname(), currentUser.token(), organizationId).run()

      spinner.start(`${getOrganization.slug}`)

      let publicKey = getOrganization['public_key/1']
      let mePrivateKeyEncrypted = me[`organization/${organizationId}/private_key_encrypted/1`]

      const organizationHasPublicKey = publicKey && publicKey.length > 0
      const meHasPrivateKeyEncrypted = mePrivateKeyEncrypted && mePrivateKeyEncrypted.length > 0

      // generate org keypair for the first time
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = currentUser.encrypt(genPrivateKey) // encrypt org private key with user's public key

        const postOrganization = await new PostOrganizationPublicKey(options.hostname, currentUser.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
      } else {
        if (!meHasPrivateKeyEncrypted) {
          const error = new Error()
          error.message = `missing private key for organization [${getOrganization.slug}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
          throw error
        }

        currentUser.linkOrganization(organizationId, mePrivateKeyEncrypted)

        const canDecryptOrganization = decryptValue(encryptValue('true', publicKey), currentUser.organizationPrivateKey(organizationId))
        if (canDecryptOrganization != 'true') {
          const error = new Error()
          error.message = `unable to encrypt/decrypt for organization [${getOrganization.slug}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
          throw error
        }
      }

      spinner.succeed(`${getOrganization.slug}`)
    }
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
}

module.exports = sync

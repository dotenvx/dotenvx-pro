const { logger } = require('@dotenvx/dotenvx')
const { PrivateKey } = require('eciesjs')

const currentUser = require('./../../shared/currentUser')

const { createSpinner } = require('./../../lib/helpers/createSpinner')
const encryptValue = require('./../../lib/helpers/encryptValue')
const decryptValue = require('./../../lib/helpers/decryptValue')
const organizationIds = require('./../../lib/helpers/organizationIds')
const userIdsMissingPrivateKeyEncrypted = require('./../../lib/helpers/userIdsMissingPrivateKeyEncrypted')
const GetOrganization = require('./../../lib/api/getOrganization')
const PostMePublicKey = require('./../../lib/api/postMePublicKey')
const PostOrganizationPublicKey = require('./../../lib/api/postOrganizationPublicKey')
const PostOrganizationUserPrivateKeyEncrypted = require('./../../lib/api/postOrganizationUserPrivateKeyEncrypted')

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
    let me = await new PostMePublicKey(options.hostname, currentUser.token(), currentUser.publicKey()).run()
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
      let organization = await new GetOrganization(currentUser.hostname(), currentUser.token(), organizationId).run()
      let publicKey = organization['public_key/1']

      spinner.start(`[${organization.slug}]`)

      // generate org keypair for the first time
      const organizationHasPublicKey = publicKey && publicKey.length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = currentUser.encrypt(genPrivateKey) // encrypt org private key with user's public key

        organization = await new PostOrganizationPublicKey(options.hostname, currentUser.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
        publicKey = organization['public_key/1']
        me = await new PostMePublicKey(options.hostname, currentUser.token(), currentUser.publicKey()).run()
      }

      // check if user has private_key_encrypted for org
      const mePrivateKeyEncrypted = me[`organization/${organizationId}/private_key_encrypted/1`]
      const meHasPrivateKeyEncrypted = mePrivateKeyEncrypted && mePrivateKeyEncrypted.length > 0
      if (!meHasPrivateKeyEncrypted) {
        const error = new Error()
        error.message = `missing private key for organization [${organization.slug}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
        throw error
      }

      currentUser.linkOrganization(organizationId, mePrivateKeyEncrypted)

      const canDecryptOrganization = decryptValue(encryptValue('true', publicKey), currentUser.organizationPrivateKey(organizationId))
      if (canDecryptOrganization !== 'true') {
        const error = new Error()
        error.message = `unable to encrypt/decrypt for organization [${organization.slug}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
        throw error
      }
      spinner.succeed(`[${organization.slug}]`)

      // check team is all synced
      spinner.start(`[${organization.slug}] team`)

      // check for users missing their private_key_encrypted
      const _userIdsMissingPrivateKeyEncrypted = userIdsMissingPrivateKeyEncrypted(organization)
      if (_userIdsMissingPrivateKeyEncrypted || _userIdsMissingPrivateKeyEncrypted.length > 0) {
        for (let ii = 0; ii < _userIdsMissingPrivateKeyEncrypted.length; ii++) {
          const userId = _userIdsMissingPrivateKeyEncrypted[ii]
          const userUsername = organization[`user/${userId}/username`]
          const userPublicKey = organization[`user/${userId}/public_key/1`]
          if (!userPublicKey || userPublicKey.length < 1) {
            spinner.warn(`[${organization.slug}][${userUsername}] missing public key. Tell them to run [dotenvx pro sync].`)
          } else {
            // encrypt organization private key using team member's public key
            const userPrivateKeyEncrypted = encryptValue(currentUser.organizationPrivateKey(organizationId), userPublicKey)

            // upload their encrypted private key to pro
            organization = await new PostOrganizationUserPrivateKeyEncrypted(options.hostname, currentUser.token(), organizationId, userId, userPublicKey, userPrivateKeyEncrypted).run()
          }
        }
      }

      spinner.succeed(`[${organization.slug}] team`)
    }

    const firstOrganizationId = _organizationIds()[0]
    if (firstOrganizationId) {
      currentUser.chooseOrganization(firstOrganizationId)
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

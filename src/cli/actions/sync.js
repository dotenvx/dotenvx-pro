const { logger } = require('@dotenvx/dotenvx')
const { PrivateKey } = require('eciesjs')

// database
const current = require('./../../db/current')
const userPrivateKey = require('./../../db/userPrivateKey')
const user = require('./../../db/user')
const organization = require('./../../db/organization')

// helpers
const { createSpinner } = require('./../../lib/helpers/createSpinner')
const encryptValue = require('./../../lib/helpers/encryptValue')
const decryptValue = require('./../../lib/helpers/decryptValue')

// api calls
const GetMe = require('./../../lib/api/getMe')
const GetOrganization = require('./../../lib/api/getOrganization')
const PostMePublicKey = require('./../../lib/api/postMePublicKey')
const PostOrganizationPublicKey = require('./../../lib/api/postOrganizationPublicKey')
const PostOrganizationUserPrivateKeyEncrypted = require('./../../lib/api/postOrganizationUserPrivateKeyEncrypted')

const spinner = createSpinner('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    // logged in
    spinner.start('logged in')
    if (current.token().length < 1) {
      const error = new Error()
      error.message = 'login required. Log in with [dotenvx pro login].'
      throw error
    }
    let me = await new GetMe(options.hostname, current.token()).run()
    user.store().store = me
    spinner.succeed(`[${user.username()}] logged in`)

    // verify/sync public key
    spinner.start(`[${user.username()}] encrypted`)
    if (userPrivateKey.publicKey().length < 1) {
      const error = new Error()
      error.message = 'missing public key. Try generating one with [dotenvx pro login].'
      throw error
    }
    me = await new PostMePublicKey(options.hostname, current.token(), userPrivateKey.publicKey()).run()
    user.store().store = me
    spinner.succeed(`[${user.username()}] encrypted`)

    // verify emergency kit
    spinner.start(`[${user.username()}] emergency kit`)
    if (!user.emergencyKitGeneratedAt()) {
      const error = new Error()
      error.message = 'emergency kit must be generated once. Generate it with [dotenvx pro settings emergencykit --unmask]'
      throw error
    }
    spinner.succeed(`[${user.username()}] emergency kit`)

    // organization(s) - check if any
    spinner.start('[@] logged in')
    const _organizationIds = user.organizationIds()
    if (!_organizationIds || _organizationIds.length < 1) {
      const error = new Error()
      error.message = 'Log into an organization with [dotenvx pro settings orgselect].'
      throw error
    }

    let currentOrganizationId = current.organizationId()

    // instead of current.organizationId here can i just get all of them?
    for (let iOrg = 0; iOrg < _organizationIds.length; iOrg++) {
      const organizationId = _organizationIds[iOrg]

      if (!currentOrganizationId) {
        currentOrganizationId = organizationId
      }

      current.selectOrganization(organizationId) // temp set current.organizationId()

      let remoteOrg = await new GetOrganization(current.hostname(), current.token(), current.organizationId()).run()
      organization.store().store = remoteOrg

      spinner.start(`[@${organization.slug()}] encrypted`)
      // generate org keypair for the first time
      const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = userPrivateKey.encrypt(genPrivateKey) // encrypt org private key with user's public key

        remoteOrg = await new PostOrganizationPublicKey(options.hostname, current.token(), current.organizationId(), genPublicKey, genPrivateKeyEncrypted).run()
        organization.store().store = remoteOrg
        me = await new PostMePublicKey(options.hostname, current.token(), userPrivateKey.publicKey()).run()
        user.store().store = me
      }

      const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
      if (!meHasPrivateKeyEncrypted) {
        const error = new Error()
        error.message = `missing private key for organization [${organization.slug()}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
        throw error
      }

      const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey())
      if (canDecryptOrganization !== 'true') {
        const error = new Error()
        error.message = `unable to encrypt/decrypt for organization [${organization.slug()}]. Ask your teammate to run [dotenvx pro sync] and then try again.`
        throw error
      }
      spinner.succeed(`[@${organization.slug()}] encrypted`)

      // check team is all synced
      spinner.start(`[@${organization.slug()}] team (${organization.userIds().length})`)

      // check for users missing their private_key_encrypted
      const _userIdsMissingPrivateKeyEncrypted = organization.userIdsMissingPrivateKeyEncrypted()
      if (_userIdsMissingPrivateKeyEncrypted || _userIdsMissingPrivateKeyEncrypted.length > 0) {
        for (let i = 0; i < _userIdsMissingPrivateKeyEncrypted.length; i++) {
          const userId = _userIdsMissingPrivateKeyEncrypted[i]

          // username and publicKey
          const username = organization.store().get(`user/${userId}/username`)
          const publicKey = organization.store().get(`user/${userId}/public_key/1`)

          if (!publicKey || publicKey.length < 1) {
            spinner.warn(`[@${organization.slug()}] teammate '${username}' missing public key. Tell them to run [dotenvx pro sync].`)
          } else {
            // encrypt organization private key using teammate's public key
            const privateKeyEncrypted = encryptValue(organization.privateKey(), publicKey)

            // upload their encrypted private key to pro
            await new PostOrganizationUserPrivateKeyEncrypted(options.hostname, current.token(), current.organizationId(), userId, publicKey, privateKeyEncrypted).run()
          }
        }
      }

      remoteOrg = await new GetOrganization(current.hostname(), current.token(), current.organizationId()).run()
      organization.store().store = remoteOrg

      spinner.succeed(`[@${organization.slug()}] team (${organization.userIds().length})`)
    }

    spinner.start('[@] logged in')
    current.selectOrganization(currentOrganizationId)
    spinner.succeed(`[@${organization.slug()}] logged in`)

    process.exit(0)
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

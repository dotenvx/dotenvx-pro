const { logger } = require('@dotenvx/dotenvx')
const { PrivateKey } = require('eciesjs')

// database
const current = require('./../../db/current')
const User = require('./../../db/user')
const Device = require('./../../db/device')
const Organization = require('./../../db/organization')

// helpers
const { createSpinner } = require('./../../lib/helpers/createSpinner')
const encryptValue = require('./../../lib/helpers/encryptValue')
const decryptValue = require('./../../lib/helpers/decryptValue')
const ValidateLoggedIn = require('./../../lib/helpers/validateLoggedIn')
const ValidatePublicKey = require('./../../lib/helpers/validatePublicKey')
const Errors = require('./../../lib/helpers/errors')

// api calls
const PostOrganizationUserPrivateKeyEncrypted = require('./../../lib/api/postOrganizationUserPrivateKeyEncrypted')

// services
const SyncMe = require('./../../lib/services/syncMe')
const SyncDevice = require('./../../lib/services/syncDevice')
const SyncPublicKey = require('./../../lib/services/syncPublicKey')
const SyncOrganization = require('./../../lib/services/syncOrganization')
const SyncOrganizationPublicKey = require('./../../lib/services/syncOrganizationPublicKey')

const spinner = createSpinner('syncing')

async function sync () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    // logged in
    spinner.start('logged in')
    new ValidateLoggedIn().run()
    let user = await new SyncMe(options.hostname, current.token()).run()
    spinner.succeed(`[${user.username()}] logged in`)

    // verify/sync public key
    spinner.start(`[${user.username()}] encrypted`)
    new ValidatePublicKey().run()
    user = new User()
    user = await new SyncPublicKey(options.hostname, current.token(), user.publicKey()).run()
    const device = new Device()
    device.touch()
    user = await new SyncDevice(options.hostname, current.token(), device.publicKey(), device.encrypt(user.privateKey())).run()
    spinner.succeed(`[${user.username()}] encrypted`)

    // sync device

    // verify emergency kit
    spinner.start(`[${user.username()}] emergency kit`)
    if (!user.emergencyKitGeneratedAt()) {
      spinner.warn(`[${user.username()}] emergency kit recommended. Generate it with [dotenvx pro settings emergencykit --unmask].`)
    } else {
      spinner.succeed(`[${user.username()}] emergency kit`)
    }

    // organization(s)
    spinner.start('[@] logged in')
    const _organizationIds = user.organizationIds()
    if (!_organizationIds || _organizationIds.length < 1) {
      throw new Errors({ username: user.username() }).missingOrganization()
    }

    let currentOrganizationId = current.organizationId()

    for (let iOrg = 0; iOrg < _organizationIds.length; iOrg++) {
      const organizationId = _organizationIds[iOrg]

      // for later - to auto-select an organization
      if (!currentOrganizationId) {
        currentOrganizationId = organizationId
      }

      let organization = await new SyncOrganization(options.hostname, current.token(), organizationId).run()
      spinner.start(`[@${organization.slug()}] encrypted`)

      // generate org keypair for the first time
      const organizationHasPublicKey = organization.publicKey() && organization.publicKey().length > 0
      if (!organizationHasPublicKey) {
        const kp = new PrivateKey()
        const genPublicKey = kp.publicKey.toHex()
        const genPrivateKey = kp.secret.toString('hex')
        const genPrivateKeyEncrypted = user.encrypt(genPrivateKey) // encrypt org private key with user's public key

        organization = await new SyncOrganizationPublicKey(options.hostname, current.token(), organizationId, genPublicKey, genPrivateKeyEncrypted).run()
        user = await new SyncPublicKey(options.hostname, current.token(), user.publicKey()).run()
      }

      const meHasPrivateKeyEncrypted = organization.privateKeyEncrypted() && organization.privateKeyEncrypted().length > 0
      if (!meHasPrivateKeyEncrypted) {
        throw new Errors({ slug: organization.slug() }).missingOrganizationPrivateKey()
      }

      const canDecryptOrganization = decryptValue(encryptValue('true', organization.publicKey()), organization.privateKey())
      if (canDecryptOrganization !== 'true') {
        throw new Errors({ slug: organization.slug() }).decryptionFailed()
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
          const username = organization.store.get(`u/${userId}/un`)
          const publicKey = organization.store.get(`u/${userId}/pk/1`)

          if (!publicKey || publicKey.length < 1) {
            spinner.warn(`[@${organization.slug()}] teammate '${username}' missing public key. Tell them to run [dotenvx pro sync].`)
          } else {
            // encrypt organization private key using teammate's public key
            const privateKeyEncrypted = encryptValue(organization.privateKey(), publicKey)

            // upload their encrypted private key to pro
            await new PostOrganizationUserPrivateKeyEncrypted(options.hostname, current.token(), organization.id(), userId, publicKey, privateKeyEncrypted).run()
          }
        }
      }

      organization = await new SyncOrganization(current.hostname(), current.token(), organizationId).run()
      spinner.succeed(`[@${organization.slug()}] team (${organization.userIds().length})`)
    }

    spinner.start('[@] logged in')
    current.selectOrganization(currentOrganizationId)
    const organization = new Organization()
    spinner.succeed(`[@${organization.slug()}] logged in`)

    process.exit(0)
  } catch (error) {
    spinner.stop()
    if (error.message) {
      logger.error(error.message)
    } else {
      logger.error(error)
    }
    if (error.help) {
      logger.help(error.help)
    }
    if (error.stack) {
      logger.debug(error.stack)
    }
    process.exit(1)
  }
}

module.exports = sync

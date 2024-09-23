const Enquirer = require('enquirer')
const enquirer = new Enquirer()
const { PrivateKey } = require('eciesjs')
const { logger } = require('@dotenvx/dotenvx')

const userPrivateKey = require('./../../../shared/userPrivateKey')
const cleanseRecoveryPhrase = require('./../../../lib/helpers/cleanseRecoveryPhrase')
const convertRecoveryPhraseToPrivateKey = require('./../../../lib/helpers/convertRecoveryPhraseToPrivateKey')
const sleep = require('./../../../lib/helpers/sleep')
const truncate = require('./../../../lib/helpers/truncate')
const { createSpinner } = require('./../../../lib/helpers/createSpinner')

const spinner = createSpinner('recovering your privateKey')

async function recover () {
  try {
    const input = await enquirer.prompt({
      type: 'password',
      name: 'recoveryPhrase',
      message: 'Please provide your recovery phrase (input is hidden, multiline supported, press enter twice to submit):',
      multiline: true
    })

    spinner.start('validating recovery phrase')
    await sleep(1000) // better dx

    let privateKey

    try {
      const cleanRecoveryPhrase = cleanseRecoveryPhrase(input.recoveryPhrase)
      privateKey = convertRecoveryPhraseToPrivateKey(cleanRecoveryPhrase)
    } catch (e) {
      try {
        privateKey = input.recoveryPhrase // maybe user put their private key in directly
        const _privateKey = new PrivateKey(Buffer.from(privateKey, 'hex'))
        // compute publicKey from privateKey
        _privateKey.publicKey.toHex()
      } catch (error) {
        spinner.fail(`invalid recovery phrase [${e.message}]`)
        console.error('✖ could not recover account')
        logger.blank('')
        logger.blank('Double-check your recovery phrase and try again. It should be made up of 24 words.')
        logger.blank('')
        logger.blank('Still having trouble? Contact support@dotenvx.com. We might be able to help.')
        process.exit(1)
      }
    }

    spinner.succeed('validated recovery phrase [*******]')
    spinner.start('recovering privateKey')
    await sleep(1000) // better dx
    userPrivateKey.recover(privateKey)
    spinner.succeed(`account recovered 🏆 [${truncate(userPrivateKey.privateKey())}]`)
    logger.help('⮕  next run [dotenvx pro login] to reconnect your device')
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    }
    process.exit(1)
  }
}

module.exports = recover

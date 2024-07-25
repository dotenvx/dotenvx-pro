const ora = require('ora')
const Enquirer = require('enquirer')
const enquirer = new Enquirer()

const store = require('./../../../shared/store')
const { logger } = require('./../../../shared/logger')
const cleanseRecoveryPhrase = require('./../../../lib/helpers/cleanseRecoveryPhrase')
const convertRecoveryPhraseToPrivateKey = require('./../../../lib/helpers/convertRecoveryPhraseToPrivateKey')
const sleep = require('./../../../lib/helpers/sleep')

const spinner = ora('recovering your privateKey')

async function recover () {
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
    spinner.fail(`invalid recovery phrase [${e.message}]`)
    logger.error('✖ could not recover account')
    logger.blank('')
    logger.blank('Double-check your recovery phrase and try again. It should be made up of 24 words.')
    process.exit(1)
  }

  spinner.succeed('validated recovery phrase [*******]')
  spinner.start('recovering privateKey')
  await sleep(1000) // better dx
  store.setPrivateKey(privateKey)
  spinner.succeed(`recovered privateKey [${store.getPrivateKeyShort()}]`)
  logger.success('✔ account recovered 🏆')
  logger.blank('')
  logger.blank('Next run [dotenvx pro login] to login and reconnect your device')
}

module.exports = recover

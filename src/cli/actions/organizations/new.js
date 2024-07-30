const ora = require('ora')
const open = require('open')
const crypto = require('crypto')
const { request } = require('undici')
const confirm = require('@inquirer/confirm').default

const { logger } = require('./../../../shared/logger')

const spinner = ora('waiting on browser creation')

async function neww () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const requestUid = `req_${crypto.randomBytes(4).toString('hex')}`
  const hostname = options.hostname
  const organizationsNewUrl = `${hostname}/organizations/new?request_uid=${requestUid}`

  try {
    // optionally allow user to open browser
    const answer = await confirm({ message: `press Enter to open [${organizationsNewUrl}]...` })

    spinner.start()

    if (answer) {
      await open(organizationsNewUrl)
    } else {
      process.exit(1)
    }
  } catch (error) {
    logger.error(error.toString())
    process.exit(1)
  }
}

module.exports = neww

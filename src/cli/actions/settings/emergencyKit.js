const fs = require('fs')
const path = require('path')
const qrcode = require('qrcode')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { logger } = require('@dotenvx/dotenvx')

const current = require('./../../../db/current')
const User = require('./../../../db/user')
const smartMask = require('./../../../lib/helpers/smartMask')
const maskRecoveryPhrase = require('./../../../lib/helpers/maskRecoveryPhrase')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')
const GetMe = require('./../../../lib/api/getMe')
const PostMeEmergencyKit = require('./../../../lib/api/postMeEmergencyKit')

async function emergencyKit () {
  const options = this.opts()

  function smartMaskRecoveryPhrase (str) {
    if (options.unmask) {
      return str
    } else {
      return maskRecoveryPhrase(str)
    }
  }

  function currentDate () {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  try {
    const user = new User()
    let privateKey = user.privateKey()
    let recoveryPhrase = user.recoveryPhrase()

    if (!privateKey || privateKey.length < 1) {
      const error = new Error()
      error.message = 'missing private key. Try generating one with [dotenvx pro login].'
      throw error
    }

    recoveryPhrase = smartMaskRecoveryPhrase(recoveryPhrase)
    recoveryPhrase = formatRecoveryPhrase(recoveryPhrase)
    privateKey = smartMask(privateKey, options.unmask)

    const publicKey = user.publicKey()

    // setup
    const existing = fs.readFileSync(path.join(__dirname, '../../../assets/emergencyKitBlank.pdf'))
    const pdf = await PDFDocument.load(existing)
    const pages = pdf.getPages()
    const page = pages[0]

    // fonts
    const monoFont = await pdf.embedFont(StandardFonts.Courier)

    // json
    const json = await new GetMe(current.hostname(), current.token()).run()

    // createdFor
    page.drawText(`created for ${json.username} on ${currentDate()}`, {
      x: 100,
      y: 590,
      size: 9,
      font: monoFont,
      color: rgb(0, 0, 0)
    })

    // publicKey
    page.drawText(publicKey, {
      x: 105,
      y: 444,
      size: 10,
      font: monoFont,
      color: rgb(0, 0, 0)
    })

    // privateKey
    page.drawText(privateKey, {
      x: 105,
      y: 373,
      size: 10,
      font: monoFont,
      color: rgb(0, 0, 0)
    })

    // recoveryPhrase
    recoveryPhrase.split('\n').forEach((line, index) => {
      const y = 305 - index * 18
      page.drawText(line, {
        x: 105,
        y,
        size: 10,
        font: monoFont,
        color: rgb(0, 0, 0)
      })
    })

    // qrcode
    const url = await qrcode.toDataURL(privateKey)
    const qrBuffer = Buffer.from(url.replace(/^data:image\/png;base64,/, ''), 'base64')
    const qrImage = await pdf.embedPng(qrBuffer)
    qrImage.scale(1)
    page.drawImage(qrImage, {
      x: 260,
      y: 80,
      width: 100,
      height: 100
    })

    // notify the user has downloaded emergency kit at least once
    try {
      await new PostMeEmergencyKit(current.hostname(), current.token()).run()
    } catch (error) {
      logger.error(`notifying ${current.hostname()} failed: ${error.message}`)
    }

    const pdfBytes = await pdf.save()

    if (options.stdout) {
      process.stdout.write(Buffer.from(pdfBytes))
    } else {
      fs.writeFileSync('dotenvx-emergency-kit.pdf', Buffer.from(pdfBytes))
      logger.success(`✔ created dotenvx-emergency-kit.pdf at [${process.cwd()}/dotenvx-emergency-kit.pdf]`)
    }
  } catch (error) {
    logger.error(error.message)

    process.exit(1)
  }
}

module.exports = emergencyKit

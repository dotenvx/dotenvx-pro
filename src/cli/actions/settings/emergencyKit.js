const fs = require('fs')
const path = require('path')
const qrcode = require('qrcode')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')

const { logger } = require('./../../../shared/logger')
const db = require('./../../../shared/db')
const currentUser = require('./../../../shared/currentUser')
const smartMask = require('./../../../lib/helpers/smartMask')
const maskRecoveryPhrase = require('./../../../lib/helpers/maskRecoveryPhrase')
const formatRecoveryPhrase = require('./../../../lib/helpers/formatRecoveryPhrase')

async function emergencyKit () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

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

  let privateKey = currentUser.getPrivateKey()
  let recoveryPhrase = currentUser.getRecoveryPhrase()
  recoveryPhrase = smartMaskRecoveryPhrase(recoveryPhrase)
  recoveryPhrase = formatRecoveryPhrase(recoveryPhrase)
  privateKey = smartMask(privateKey, options.unmask)

  // setup
  const existing = fs.readFileSync(path.join(__dirname, '../../../assets/emergencyKitBlank.pdf'))
  const pdf = await PDFDocument.load(existing)
  const pages = pdf.getPages()
  const page = pages[0]

  // fonts
  const monoFont = await pdf.embedFont(StandardFonts.Courier)

  // createdFor
  page.drawText(`created for ${db.getCurrentUserUsername()} on ${currentDate()}`, {
    x: 100,
    y: 590,
    size: 9,
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

  const pdfBytes = await pdf.save()
  process.stdout.write(Buffer.from(pdfBytes))
}

module.exports = emergencyKit

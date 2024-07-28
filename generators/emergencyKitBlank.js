#!/usr/bin/env node

const path = require('path')
const Pdfkit = require('pdfkit')
const qrcode = require('qrcode')

const mask = require('../src/lib/helpers/mask')
const maskRecoveryPhrase = require('../src/lib/helpers/maskRecoveryPhrase')
const formatRecoveryPhrase = require('../src/lib/helpers/formatRecoveryPhrase')

let privateKey = '2c93601cba85b3b2474817897826ebef977415c097f0bf57dcbaa3056e5d64d0'
// privateKey = ' '
let recoveryPhrase = 'cart guess electric adult carpet ritual wisdom obscure season tiger spatial stable arrow narrow rely almost brisk arrange dune dawn roast venture install dinosaur'
// recoveryPhrase = ''

function emergencyKitBlank (options = { unmask: false, example: true }) {
  function smartMask (str) {
    if (options.unmask) {
      return str
    } else {
      return mask(str)
    }
  }
  function smartMaskRecoveryPhrase (str) {
    if (options.unmask) {
      return str
    } else {
      return maskRecoveryPhrase(str)
    }
  }
  recoveryPhrase = smartMaskRecoveryPhrase(recoveryPhrase)
  recoveryPhrase = formatRecoveryPhrase(recoveryPhrase)
  privateKey = smartMask(privateKey)

  // set up doc to pipe to process.stdout
  const doc = new Pdfkit()
  doc.pipe(process.stdout)

  // meta
  const page = doc.page

  // fonts
  doc.registerFont('Display-Bold', path.join(__dirname, './assets/SF-Pro-Display-Bold.otf'))
  doc.registerFont('Text-Regular', path.join(__dirname, './assets/SF-Pro-Text-Regular.otf'))
  doc.registerFont('Text-Bold', path.join(__dirname, './assets/SF-Pro-Text-Bold.otf'))
  doc.registerFont('Text-Heavy', path.join(__dirname, './assets/SF-Pro-Text-Heavy.otf'))
  doc.registerFont('Text-ThinItalic', path.join(__dirname, './assets/SF-Pro-Text-ThinItalic.otf'))

  // logo
  const logoPath = path.join(__dirname, './assets/dotenvx.png')
  const logoWidth = 36
  doc.image(logoPath, 100, 675, { width: logoWidth, height: logoWidth })

  const crossSize = 50
  const crossThickness = 14
  const centerX = page.width / 2

  // Draw the horizontal part of the cross
  doc.rect(centerX - crossSize / 2, 100 - crossThickness / 2, crossSize, crossThickness)
  doc.fill('red')

  // Draw the vertical part of the cross
  doc.rect(centerX - crossThickness / 2, 100 - crossSize / 2, crossThickness, crossSize)
  doc.fill('red')

  // title
  doc.fillColor('black')
  doc.fontSize(40)
  const title1 = 'dotenvx. '
  const title2 = 'emergency kit.'
  const titleX = (page.width - doc.widthOfString(`${title1}${title2}`)) / 2
  doc.font('Display-Bold')
  doc.text(title1, titleX, 140, { continued: true })
  doc.fillColor('red')
  doc.text(title2)
  doc.fillColor('black')

  // created-for
  // doc.fontSize(9)
  // const createdFor = `created for ${store.getUsername()} on ${currentDate()}`
  // const createdForX = (page.width - doc.widthOfString(createdFor)) / 2
  // doc.font('Text-ThinItalic')
  // doc.fillColor('gray')
  // doc.text(createdFor, createdForX, 200)
  // doc.fillColor('black')

  // text
  doc.fontSize(12)
  const intro = 'The details below can be used to sign in to your dotenvx account in an emergency.'
  doc.font('Text-Regular')
  doc.text(intro, 100, 260, { align: 'left', width: page.width - (100 * 2) })

  // step 1
  const one = '1. Print out this document.'
  doc.font('Text-Regular')
  doc.text(one, 100, 310, { align: 'left', width: page.width - (100 * 2) })

  // step 2
  const two = '2. Store in a secure place where you can find it, e.g. a safe deposit box.'
  doc.font('Text-Regular')
  doc.text(two, 100, 330, { align: 'left', width: page.width - (100 * 2) })

  // label1
  const label1 = 'PRIVATE KEY'
  doc.fillColor('red')
  doc.fontSize(10)
  doc.font('Text-Heavy')
  doc.text(label1, 100, 380, { align: 'left', width: page.width - (100 * 2) })
  doc.fillColor('black')

  // privateKey input
  doc.strokeColor('red')
  doc.roundedRect(100, 400, page.width - (100 * 2), 30, 4)
  doc.stroke()
  doc.strokeColor('black')

  // privateKey value
  doc.fontSize(10)
  doc.font('Courier')
  doc.text(privateKey, 110, 412, { align: 'left', width: (page.width - (100 * 2) - 20) })

  // label2
  const label2 = 'RECOVERY PHRASE'
  doc.fillColor('blue')
  doc.fontSize(10)
  doc.font('Text-Heavy')
  doc.text(label2, 100, 450, { align: 'left', width: page.width - (100 * 2) })
  doc.fillColor('black')

  // recoveryPhrase input
  doc.strokeColor('blue')
  doc.roundedRect(100, 470, page.width - (100 * 2), 120, 4)
  doc.stroke()
  doc.strokeColor('black')

  // recoveryPhrase value
  doc.fontSize(12)
  doc.font('Courier')
  doc.text(recoveryPhrase, 110, 482, { align: 'left', width: (page.width - (100 * 2) - 20) })

  // help left column
  const help = 'Need help?'
  const email = 'support@dotenvx.com'
  const contactUsAt = 'Contact us at: '
  const mailtoLink = `mailto:${email}`
  doc.font('Text-Bold')
  doc.fontSize(10)
  doc.text(help, 100, 620, { align: 'left', width: (page.width - (100 * 2)) })
  doc.font('Text-Regular')
  doc.text(contactUsAt, 100, 640, { align: 'left', width: ((page.width - (100 * 2)) / 3), continued: true })
  doc.fillColor('gray')
  doc.text(email, { link: mailtoLink, underline: true, align: 'left', width: ((page.width - (100 * 2)) / 3) })
  doc.fillColor('black')

  qrcode.toDataURL(privateKey, function (err, url) {
    if (err) {
      throw err
    }

    // qr code center column
    const qrBuffer = Buffer.from(url.replace(/^data:image\/png;base64,/, ''), 'base64')
    const qrX = (page.width / 2) - (120 / 2)
    doc.image(qrBuffer, qrX, 610, { width: 120, height: 120 })

    // explainer right column
    const setup = 'Setup code'
    const setupMore = 'Your PRIVATE KEY is embedded in this QR Code. In the future, we\'ll provide tools to scan this code - setting up your account quickly and easily on new devices.'
    doc.font('Text-Bold')
    doc.fontSize(10)
    doc.text(setup, 380, 620, { align: 'left', width: (page.width - (100 * 2)) })
    doc.font('Text-Regular')
    doc.fontSize(9)
    doc.text(setupMore, 380, 640, { align: 'left', width: ((page.width - (100 * 2)) / 3) })

    // example
    if (options.example) {
      // Calculate the position to center the text diagonally
      const angle = Math.atan(page.height / page.width)

      // Save the graphics state
      doc.save()

      // Translate and rotate the coordinate system
      doc.translate(page.width / 2, page.height / 2)
      doc.rotate((angle * 180) / Math.PI)

      // Set the opacity and draw the text
      doc.fillColor('gray')
      doc.opacity(0.3)
      doc.fontSize(160)
      doc.text('EXAMPLE', -600, -120, { align: 'center' })

      // restore
      doc.restore()
    }

    doc.end()

    // doc.addPage()
    // doc.fontSize(14).text('This is page 2', 100, 100)
  })
}

emergencyKitBlank()

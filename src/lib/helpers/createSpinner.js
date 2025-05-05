const { getColor, bold } = require('@dotenvx/dotenvx')

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const HIDE_CURSOR = '\u001B[?25l'
const SHOW_CURSOR = '\u001B[?25h'
const CLEAR_LINE = '\r\x1b[K'
const SYMBOL_INFO = 'ℹ'
const SYMBOL_WARN = '⚠'
const SYMBOL_ERROR = '✖'
const SYMBOL_SUCCESS = '✔'

class Spinner {
  text
  interval
  frameIndex = 0
  symbol = getColor('blue')(FRAMES[0])

  constructor (text) {
    this.text = text
  }

  start (text) {
    if (text) {
      this.text = text
    }
    this.render()
    this.interval = setInterval(() => this.tick(), 50)
  }

  tick () {
    this.symbol = getColor('blue')(FRAMES[this.frameIndex++])
    if (this.frameIndex === FRAMES.length - 1) this.frameIndex = 0
    this.render()
  }

  render () {
    process.stdout.write(CLEAR_LINE + HIDE_CURSOR + (this.symbol ? this.symbol + ' ' : '') + this.text)
  }

  succeed (text) {
    if (text) {
      this.text = text
    }
    this.symbol = getColor('green')(SYMBOL_SUCCESS)
    this._end()
  }

  info (text) {
    if (text) {
      this.text = text
    }
    this.symbol = getColor('blue')(SYMBOL_INFO)
    this._end()
  }

  warn (text) {
    if (text) {
      this.text = text
    }
    this.symbol = getColor('orangered')(SYMBOL_WARN)
    this._end()
  }

  fail (text) {
    if (text) {
      this.text = text
    }
    this.symbol = getColor('red')(SYMBOL_ERROR)
    this._end()
  }

  stop () {
    this.symbol = ''
    this.text = ''
    clearInterval(this.interval)
    process.stdout.write(CLEAR_LINE + HIDE_CURSOR + (this.symbol ? this.symbol + ' ' : '') + this.text)
    process.stdout.write(SHOW_CURSOR)
  }

  _end () {
    this.render()
    clearInterval(this.interval)
    process.stdout.write(SHOW_CURSOR + '\n')
  }
}

const createSpinner = (initialMessage = '') => {
  const spinner = new Spinner(initialMessage)

  return {
    start: (message) => spinner.start(message),
    succeed: (message) => spinner.succeed(getColor('green')(message)),
    warn: (message) => spinner.warn(getColor('orangered')(message)),
    info: (message) => spinner.info(getColor('blue')(message)),
    done: (message) => spinner.succeed(message),
    fail: (message) => spinner.fail(bold(getColor('red')(message))),
    stop: () => spinner.stop()
  }
}

module.exports = { createSpinner, Spinner }

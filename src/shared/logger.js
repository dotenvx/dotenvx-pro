const winston = require('winston')
const chalk = require('chalk')

const printf = winston.format.printf
const combine = winston.format.combine
const createLogger = winston.createLogger
const transports = winston.transports

const levels = {
  error: 0,
  warn: 1,
  success: 2,
  info: 2,
  help: 2,
  blank: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

const error = chalk.bold.red
const warn = chalk.keyword('orangered')
const success = chalk.keyword('green')
const help = chalk.keyword('blue')
const http = chalk.keyword('green')
const verbose = chalk.keyword('plum')
const debug = chalk.keyword('plum')

const dotenvxFormat = printf(({ level, message, label, timestamp }) => {
  const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message

  switch (level.toLowerCase()) {
    case 'error':
      return error(formattedMessage)
    case 'warn':
      return warn(formattedMessage)
    case 'success':
      return success(formattedMessage)
    case 'info':
      return formattedMessage
    case 'help':
      return help(formattedMessage)
    case 'http':
      return http(formattedMessage)
    case 'verbose':
      return verbose(formattedMessage)
    case 'debug':
      return debug(formattedMessage)
    case 'blank': // custom
      return formattedMessage
  }
})

const logger = createLogger({
  level: 'info',
  levels,
  format: combine(
    dotenvxFormat
  ),
  transports: [
    new transports.Console()
  ]
})

const setLogLevel = options => {
  const logLevel = options.debug
    ? 'debug'
    : options.verbose
      ? 'verbose'
      : options.quiet
        ? 'error'
        : options.logLevel

  if (!logLevel) return
  logger.level = logLevel
  // Only log which level it's setting if it's not set to quiet mode
  if (!options.quiet || (options.quiet && logLevel !== 'error')) {
    logger.debug(`Setting log level to ${logLevel}`)
  }
}

module.exports = {
  logger,
  setLogLevel
}

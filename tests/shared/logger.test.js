const capcon = require('capture-console')
const t = require('tap')
const chalk = require('chalk')
const sinon = require('sinon')

const { logger, setLogLevel } = require('../../src/shared/logger')

t.beforeEach((ct) => {
  sinon.restore()
})

t.test('logger.blank', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.blank(message)
  })

  ct.equal(stdout, 'message1\n')

  ct.end()
})

t.test('logger.debug', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.debug(message)
  })

  ct.equal(stdout, '') // blank because log level

  ct.end()
})

t.test('logger.verbose', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.verbose(message)
  })

  ct.equal(stdout, '') // blank because log level

  ct.end()
})

t.test('logger.http', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.http(message)
  })

  ct.equal(stdout, '') // blank because log level

  ct.end()
})

t.test('logger.help', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.help(message)
  })

  ct.equal(stdout, `${chalk.keyword('blue')('message1')}\n`)

  ct.end()
})

t.test('logger.info', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.info(message)
  })

  ct.equal(stdout, 'message1\n')

  ct.end()
})

t.test('logger.success', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.success(message)
  })

  ct.equal(stdout, `${chalk.keyword('green')('message1')}\n`)

  ct.end()
})

t.test('logger.warn', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.warn(message)
  })

  ct.equal(stdout, `${chalk.keyword('orangered')('message1')}\n`)

  ct.end()
})

t.test('logger.error', ct => {
  const message = 'message1'

  const stdout = capcon.interceptStdout(() => {
    logger.error(message)
  })

  ct.equal(stdout, `${chalk.bold.red('message1')}\n`)

  ct.end()
})

t.test('logger.blank as object', ct => {
  const message = { key: 'value' }

  const stdout = capcon.interceptStdout(() => {
    logger.blank(message)
  })

  ct.equal(stdout, `${JSON.stringify({ key: 'value' })}\n`)

  ct.end()
})

t.test('setLogLevel', ct => {
  setLogLevel({ quiet: true })
  ct.same(logger.level, 'error')

  setLogLevel({ verbose: true })
  ct.same(logger.level, 'verbose')

  setLogLevel({ debug: true })
  ct.same(logger.level, 'debug')

  setLogLevel({ logLevel: 'silly' })
  ct.same(logger.level, 'silly')

  setLogLevel({})
  ct.same(logger.level, 'silly')

  setLogLevel({ logLevel: 'info' })

  ct.end()
})

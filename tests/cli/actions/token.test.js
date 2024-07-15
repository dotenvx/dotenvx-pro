const t = require('tap')
const sinon = require('sinon')
const capcon = require('capture-console')

const store = require('../../../src/shared/store')
const token = require('../../../src/cli/actions/token')
const { logger } = require('../../../src/shared/logger')

t.beforeEach((ct) => {
  sinon.restore()
})

t.test('token', ct => {
  const optsStub = sinon.stub().returns({})
  const fakeContext = { opts: optsStub }
  const stub1 = sinon.stub(store, 'configPath').returns('/some/path/.env')
  const stub2 = sinon.stub(store, 'getToken').returns('dxo_1234')
  const processExitStub = sinon.stub(process, 'exit')

  const stdout = capcon.interceptStdout(() => {
    token.call(fakeContext)
  })

  t.ok(stub1.called, 'store.configPath() called')
  t.ok(stub2.called, 'store.getToken() called')
  t.equal(stdout, 'dxo_1234')
  t.ok(processExitStub.notCalled)

  ct.end()
})

t.test('token - undefined', ct => {
  const optsStub = sinon.stub().returns({})
  const fakeContext = { opts: optsStub }
  const stub1 = sinon.stub(store, 'configPath').returns('/some/path/.env')
  const stub2 = sinon.stub(store, 'getToken').returns(undefined)
  const processExitStub = sinon.stub(process, 'exit')
  const loggerErrorStub = sinon.stub(logger, 'error')

  token.call(fakeContext)

  t.ok(stub1.called, 'store.configPath() called')
  t.ok(stub2.called, 'store.getToken() called')
  t.ok(loggerErrorStub.calledWith('not found'), 'logger.error')
  t.ok(processExitStub.calledWith(1), 'process.exit(1)')

  ct.end()
})

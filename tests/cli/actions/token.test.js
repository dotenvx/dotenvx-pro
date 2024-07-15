const t = require('tap')
const sinon = require('sinon')
const capcon = require('capture-console')

const store = require('./../../../src/shared/store')
const token = require('./../../../src/cli/actions/token')

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

  const stdout = capcon.interceptStdout(() => {
    token.call(fakeContext)
  })

  t.ok(stub1.called, 'store.configPath() called')
  t.ok(stub2.called, 'store.getToken() called')
  t.equal(stdout, '\x1b[1m\x1b[31mnot found\x1b[39m\x1b[22m\n')
  t.ok(processExitStub.calledWith(1), 'process.exit(1)')

  ct.end()
})

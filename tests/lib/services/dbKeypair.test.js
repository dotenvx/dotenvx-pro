const t = require('tap')
require('../../setup')(t)
const sinon = require('sinon')

const Organization = require('../../../src/db/organization')
const DbKeypair = require('../../../src/lib/services/dbKeypair')

const envFile = '.env'
let originalDirectory

t.beforeEach((ct) => {
  // in order to simulate envFilepath lookup correctly, we need to simulate running from the root directory of the repo - in this case simulated under tests/repos/dotenvx/app1
  originalDirectory = process.cwd()
  process.chdir('tests/repos/dotenvx/app1')
})

t.afterEach((ct) => {
  sinon.restore()
  process.chdir(originalDirectory)
})

t.test('#run (no arguments)', ct => {
  // process.chdir(originalDirectory)

  const result = new DbKeypair().run()

  ct.same(result, {})

  ct.end()
})

t.test('#usernameName', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.usernameName(), 'dotenvx/app1')

  ct.end()
})

t.test('#slug', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.slug(), 'dotenvx')

  ct.end()
})

t.test('#slug - memoizes', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.slug(), 'dotenvx')
  ct.same(dbk.slug(), 'dotenvx')

  ct.end()
})

t.test('#organizationId', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.organizationId(), '99')

  ct.end()
})

t.test('#organizationId (throws is not found)', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:other/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  try {
    dbk.organizationId()
    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, can\'t find organization [@other]. did you join it? [dotenvx pro settings orgjoin]')
  }

  ct.end()
})

t.test('#repositoryId', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.repositoryId(), '1')

  ct.end()
})

t.test('#repositoryId (throws if not found)', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/other.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  try {
    dbk.repositoryId()
    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, can\'t find project [@dotenvx/other]. did you push it? [dotenvx pro push]')
  }

  ct.end()
})

t.test('#organization', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  ct.same(dbk.organization(), new Organization('99'))

  ct.end()
})

t.test('#run (finds .env file)', ct => {
  const dbk = new DbKeypair(envFile)
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  const result = dbk.run()

  ct.same(result, {
    DOTENV_PUBLIC_KEY: '020666fa64c3e4ea8f7cc6ee48ef56641ecb7ed5cb829016066dd4dfd7ce05f5e3',
    DOTENV_PRIVATE_KEY: '74d6ff245dd24c0fcb32f99aa3b4c4ac9de402cc35aa5eece35106d4496d22ae'
  })

  ct.end()
})

t.test('#run (finds .env file as array)', ct => {
  const dbk = new DbKeypair([envFile])
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _gitUrl to simulate a real repo
  const result = dbk.run()

  ct.same(result, {
    DOTENV_PUBLIC_KEY: '020666fa64c3e4ea8f7cc6ee48ef56641ecb7ed5cb829016066dd4dfd7ce05f5e3',
    DOTENV_PRIVATE_KEY: '74d6ff245dd24c0fcb32f99aa3b4c4ac9de402cc35aa5eece35106d4496d22ae'
  })

  ct.end()
})

t.test('#run (finds .env file with specified key)', ct => {
  const dbk = new DbKeypair(envFile, 'DOTENV_PRIVATE_KEY')
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _
  const result = dbk.run()

  ct.same(result, '74d6ff245dd24c0fcb32f99aa3b4c4ac9de402cc35aa5eece35106d4496d22ae')

  ct.end()
})

t.test('#run (respects privateKey set already in process.env)', ct => {
  process.env.DOTENV_PRIVATE_KEY = 'respect me!'

  const dbk = new DbKeypair(envFile, 'DOTENV_PRIVATE_KEY')
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _
  const result = dbk.run()
  ct.same(result, 'respect me!')

  const dbk2 = new DbKeypair(envFile, 'DOTENV_PUBLIC_KEY')
  sinon.stub(dbk2, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk2, '_gitRoot').returns('.') // stub _
  const result2 = dbk2.run()
  ct.same(result2, '020666fa64c3e4ea8f7cc6ee48ef56641ecb7ed5cb829016066dd4dfd7ce05f5e3')

  ct.end()
})

t.test('#run (respects publicKey set already in process.env)', ct => {
  process.env.DOTENV_PUBLIC_KEY = 'respect me!'

  const dbk = new DbKeypair(envFile, 'DOTENV_PUBLIC_KEY')
  sinon.stub(dbk, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk, '_gitRoot').returns('.') // stub _
  const result = dbk.run()
  ct.same(result, 'respect me!')

  const dbk2 = new DbKeypair(envFile, 'DOTENV_PRIVATE_KEY')
  sinon.stub(dbk2, '_gitUrl').returns('git@github.com:dotenvx/app1.git') // stub _gitUrl to simulate a real repo
  sinon.stub(dbk2, '_gitRoot').returns('.') // stub _
  const result2 = dbk2.run()
  ct.same(result2, '74d6ff245dd24c0fcb32f99aa3b4c4ac9de402cc35aa5eece35106d4496d22ae')

  ct.end()
})

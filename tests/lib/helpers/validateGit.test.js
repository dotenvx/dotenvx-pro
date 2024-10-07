const t = require('tap')
const sinon = require('sinon')

const ValidateGit = require('../../../src/lib/helpers/validateGit')

t.test('#validateGit', ct => {
  const inst = new ValidateGit()
  sinon.stub(inst, '_isGitRepo').returns(true)
  sinon.stub(inst, '_gitRoot').returns('/mock/root')
  sinon.stub(inst, '_gitUrl').returns('git@github.com:username/repository.git')

  ct.same(inst.run(), undefined)

  ct.end()
})

t.test('#validateGit (not git repo)', ct => {
  const inst = new ValidateGit()
  sinon.stub(inst, '_isGitRepo').returns(false)

  try {
    inst.run()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, must be a git repository')
  }

  ct.end()
})

t.test('#validateGit (not git root)', ct => {
  const inst = new ValidateGit()
  sinon.stub(inst, '_gitRoot').returns(undefined)

  try {
    inst.run()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, could not determine git repository\'s root')
  }

  ct.end()
})

t.test('#validateGit (not remote origin)', ct => {
  const inst = new ValidateGit()
  sinon.stub(inst, '_gitUrl').returns(undefined)

  try {
    inst.run()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, must have a remote origin (git remote -v)')
  }

  ct.end()
})

t.test('#validateGit (not github origin)', ct => {
  const inst = new ValidateGit()
  sinon.stub(inst, '_gitUrl').returns('git@gitlab.com:username/repository.git')

  try {
    inst.run()

    ct.fail('should have raised an error but did not')
  } catch (error) {
    ct.equal(error.message, 'oops, must be a github.com remote origin (git remote -v)')
  }

  ct.end()
})

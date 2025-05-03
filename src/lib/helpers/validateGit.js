const isGitRepo = require('./isGitRepo')
const gitRoot = require('./gitRoot')
const gitUrl = require('./gitUrl')
const isGithub = require('./isGithub')

const Errors = require('./errors')

class ValidateGit {
  run () {
    // must be a git repo
    if (!this._isGitRepo()) {
      const error = new Errors().missingGitRepo()
      throw error
    }

    // must be a git root
    if (!this._gitRoot()) {
      const error = new Errors().missingGitRoot()
      throw error
    }

    // must have a remote origin url
    const giturl = this._gitUrl()
    if (!giturl) {
      const error = new Errors().missingGitRemote()
      throw error
    }

    // must be a github remote
    if (!this._isGithub(giturl)) {
      const error = new Errors().invalidGithubRemote()
      throw error
    }
  }

  _isGitRepo () {
    return isGitRepo()
  }

  _gitRoot () {
    return gitRoot()
  }

  _gitUrl () {
    return gitUrl()
  }

  _isGithub (giturl) {
    return isGithub(giturl)
  }
}

module.exports = ValidateGit

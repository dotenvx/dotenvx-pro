const isGitRepo = require('./isGitRepo')
const gitRoot = require('./gitRoot')
const gitUrl = require('./gitUrl')
const isGithub = require('./isGithub')

function validateGit () {
  // must be a git repo
  if (!isGitRepo()) {
    throw new Error('oops, must be a git repository')
  }

  // must be a git root
  const gitroot = gitRoot()
  if (!gitroot) {
    throw new Error('oops, could not determine git repository\'s root')
  }

  // must have a remote origin url
  const giturl = gitUrl()
  if (!giturl) {
    throw new Error('oops, must have a remote origin (git remote -v)')
  }

  // must be a github remote
  if (!isGithub(giturl)) {
    throw new Error('oops, must be a github.com remote origin (git remote -v)')
  }
}

module.exports = validateGit

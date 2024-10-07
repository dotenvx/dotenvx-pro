const isGitRepo = require('./isGitRepo')
const gitRoot = require('./gitRoot')
const gitUrl = require('./gitUrl')
const isGithub = require('./isGithub')

function validateGit () {
  // must be a git repo
  if (!isGitRepo()) {
    const error = new Error('oops, must be a git repository')
    error.help = '? create one with [git init .]'

    throw error
  }

  // must be a git root
  const gitroot = gitRoot()
  if (!gitroot) {
    const error = new Error('oops, could not determine git repository\'s root')
    error.help = '? create one with [git init .]'

    throw error
  }

  // must have a remote origin url
  const giturl = gitUrl()
  if (!giturl) {
    const error = new Error('oops, must have a remote origin (git remote -v)')
    error.help = '? create it at [github.com/new] and then run [git remote add origin git@github.com:username/repository.git]'

    throw error
  }

  // must be a github remote
  if (!isGithub(giturl)) {
    const error = new Error('oops, must be a github.com remote origin (git remote -v)')
    error.help = '? create it at [github.com/new] and then run [git remote add origin git@github.com:username/repository.git]'
    error.help2 = 'ℹ need support for other origins? [please tell us](https://github.com/dotenvx/dotenvx/issues)'

    throw error
  }
}

module.exports = validateGit

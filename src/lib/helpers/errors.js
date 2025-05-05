class Errors {
  constructor (options = {}) {
    this.filename = options.filename
    this.filepath = options.filepath
  }

  missingEnvKeysFile () {
    const code = 'MISSING_ENV_KEYS_FILE'
    const message = `[${code}] missing ${this.filename} file (${this.filepath})`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/580`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingGitRepo () {
    const code = 'MISSING_GIT_REPO'
    const message = `[${code}] must be inside a git repository`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/578`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingGitRoot () {
    const code = 'MISSING_GIT_ROOT'
    const message = `[${code}] could not determine git repository's root`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/579`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingGitRemote () {
    const code = 'MISSING_GIT_REMOTE'
    const message = `[${code}] missing remote origin (git remote -v)`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/581`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  invalidGithubRemote () {
    const code = 'INVALID_GIT_REMOTE'
    const message = `[${code}] origin must be github.com`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/582`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  loginRequired () {
    const code = 'LOGIN_REQUIRED'
    const message = `[${code}] Log in with [dotenvx pro login]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/583`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  econnrefused () {
    const code = 'ECONNREFUSED'
    const message = `[${code}] connection refused`
    const help = `[${code}] check your internet connection`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }
}

module.exports = Errors

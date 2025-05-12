class Errors {
  constructor (options = {}) {
    this.filename = options.filename
    this.filepath = options.filepath
    this.username = options.username
    this.slug = options.slug
    this.publicKeyName = options.publicKeyName
    this.privateKeyName = options.privateKeyName
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

  missingEnvFile () {
    const code = 'MISSING_ENV_FILE'
    const message = `[${code}] missing ${this.filename} file (${this.filepath})`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/589`

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

  econnrefused () {
    const code = 'ECONNREFUSED'
    const message = `[${code}] connection refused`
    const help = `[${code}] check your internet connection`

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

  missingUserPublicKey () {
    const code = 'MISSING_USER_PUBLIC_KEY'
    const message = `[${code}] Try generating one with [dotenvx pro login]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/585`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingOrganization () {
    const code = 'MISSING_ORGANIZATION'
    const message = `[${code}] Connect [user:${this.username}] to an organization with [dotenvx pro settings orgconnect]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/586`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingDevice () {
    const code = 'MISSING_DEVICE'
    const message = `[${code}] Missing device for [user:${this.username}]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/594`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  organizationNotConnected () {
    const code = 'ORGANIZATION_NOT_CONNECTED'
    const message = `[${code}] Connect [user:${this.username}] to organization [org:${this.slug}] with [dotenvx pro settings orgconnect]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/591`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingOrganizationPrivateKey () {
    const code = 'MISSING_ORGANIZATION_PRIVATE_KEY'
    const message = `[${code}] Ask your [org:${this.slug}] teammate to run [dotenvx pro sync] and then try again.`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/587`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  decryptionFailed () {
    const code = 'DECRYPTION_FAILED'
    const message = `[${code}] Unable to encrypt/decrypt for organization [org:${this.slug}]`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/588`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingDotenvPublicKey () {
    const code = this.publicKeyName ? `MISSING_${this.publicKeyName}` : 'MISSING_DOTENV_PUBLIC_KEY'
    const message = `[${code}] missing from ${this.filename} (${this.filepath})`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/590`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingDotenvPrivateKey () {
    const code = this.privateKeyName ? `MISSING_${this.privateKeyName}` : 'MISSING_DOTENV_PRIVATE_KEY'
    const message = `[${code}] missing from ${this.filename} (${this.filepath})`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/590`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }
}

module.exports = Errors

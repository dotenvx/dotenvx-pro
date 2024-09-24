const Conf = require('conf')

const current = require('./current')

class User {
  constructor (userId = current.id()) {
    this.hostfolder = current.hostfolder()
    this.userId = current.id()

    if (!this.userId) {
      throw new Error('missing user. Log in with [dotenvx pro login].')
    }

    this.store = new Conf({
      cwd: process.env.DOTENVX_CONFIG || undefined,
      projectName: 'dotenvx',
      configName: `${this.hostfolder}/user-${this.userId}`,
      projectSuffix: '',
      fileExtension: 'json'
    })
  }

  configPath () {
    return this.store.path
  }

  username () {
    return this.store.get('username')
  }

  emergencyKitGeneratedAt () {
    return this.store.get('emergency_kit_generated_at')
  }

  organizationIds () {
    const ids = []

    const json = this.store.store
    for (const key in json) {
      const match = key.match(/^organization\/(\d+)\/private_key_encrypted/)

      if (match && json[key] !== undefined) {
        ids.push(match[1]) // add organization id
      }
    }

    return ids
  }
}

module.exports = User

const Conf = require('conf')

const Errors = require('../lib/helpers/errors')

const current = require('./current')
const Organization = require('./organization')

class User {
  constructor (userId = current.id()) {
    this.userId = userId
    this.hostfolder = current.hostfolder()

    if (!this.userId) {
      const error = new Errors().loginRequired()
      throw error
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

  organizations () {
    const c = []

    for (const organizationId of this.organizationIds()) {
      const o = new Organization(organizationId)

      c.push(o)
    }

    return c
  }

  lookups () {
    let h = {}

    for (const organization of this.organizations()) {
      h[`lookup/organizationIdBySlug/${organization.slug()}`] = organization.id()

      h = { ...h, ...organization.lookups() }
    }

    return h
  }
}

module.exports = User

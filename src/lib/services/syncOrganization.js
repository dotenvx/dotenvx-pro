const Organization = require('./../../db/organization')
const GetOrganization = require('./../../lib/api/getOrganization')

class SyncOrganization {
  constructor (hostname, token, id) {
    this.hostname = hostname
    this.token = token
    this.id = id
  }

  async run () {
    const organization = new Organization(this.id)

    const remoteOrg = await new GetOrganization(this.hostname, this.token, this.id).run()

    organization.store.store = remoteOrg

    return organization
  }
}

module.exports = SyncOrganization

const Organization = require('./../../db/organization')
const PostOrganizationPublicKey = require('./../../lib/api/postOrganizationPublicKey')

class SyncOrganizationPublicKey {
  constructor (hostname, token, id, publicKey, privateKeyEncrypted) {
    this.hostname = hostname
    this.token = token
    this.id = id
    this.publicKey = publicKey
    this.privateKeyEncrypted = privateKeyEncrypted
  }

  async run () {
    const organization = new Organization(this.id)

    const remoteOrg = await new PostOrganizationPublicKey(this.hostname, this.token, this.id, this.publicKey, this.privateKeyEncrypted).run()

    organization.store.store = remoteOrg

    return organization
  }
}

module.exports = SyncOrganizationPublicKey

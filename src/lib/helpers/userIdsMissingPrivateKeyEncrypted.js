function userIdsMissingPrivateKeyEncrypted (organizationJson) {
  const ids = []

  for (const key in organizationJson) {
    // user/2/private_key_encrypted/1
    const match = key.match(/^user\/(\d+)\/private_key_encrypted/)

    if (match && organizationJson[key] == null) {
      ids.push(match[1]) // add user id
    }
  }

  return ids
}

module.exports = userIdsMissingPrivateKeyEncrypted

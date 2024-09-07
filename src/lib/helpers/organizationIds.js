function organizationIds(meJson) {
  const ids = []

  for (const key in meJson) {
    const match = key.match(/^organization\/(\d+)\/private_key_encrypted/)

    if (match && meJson[key] !== undefined) {
      ids.push(match[1]) // add organization id
    }
  }

  return ids
}

module.exports = organizationIds

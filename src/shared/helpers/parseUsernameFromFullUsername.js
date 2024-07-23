function parseUsernameFromFullUsername (fullUsername) {
  // Remove the leading gh|gl/
  const username = fullUsername.toLowerCase().replace(/^(gh|gl)\//, '')

  // Convert to lowercase
  return username.toLowerCase()
}

module.exports = parseUsernameFromFullUsername

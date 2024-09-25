function extractSlug (usernameName) {
  // Extract the 'slug/repository' part
  const parts = usernameName.split(/\//)

  return parts[0] // slug
}

module.exports = extractSlug

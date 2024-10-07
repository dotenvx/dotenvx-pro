const fs = require('fs')

function removeKeyFromEnvFile (filePath, keyName) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const newLines = lines.filter(line => !line.trim().startsWith(`${keyName}=`))

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
}

module.exports = removeKeyFromEnvFile

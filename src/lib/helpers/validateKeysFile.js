const fs = require('fs')
const path = require('path')

const Errors = require('./errors')

class ValidateKeysFile {
  run () {
    const filename = '.env.keys'
    const filepath = path.resolve(filename)

    // .env.keys file must exist
    if (!fs.existsSync(filepath)) {
      const error = new Errors({ filename, filepath }).missingEnvKeysFile()
      throw error
    }
  }
}

module.exports = ValidateKeysFile

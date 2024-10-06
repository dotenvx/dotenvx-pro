const treeify = require('object-treeify')

const { logger, getColor } = require('@dotenvx/dotenvx')

const dotenvx = require('@dotenvx/dotenvx')
const ArrayToTree = require('./../../lib/helpers/arrayToTree')

const DbKeypair = require('./../../lib/services/dbKeypair')

const notSyncedIcon = getColor('red')('✖')
const syncedIcon = getColor('green')('✔')

function ls (directory) {
  try {
    // debug args
    logger.debug(`directory: ${directory}`)

    const options = this.opts()
    logger.debug(`options: ${JSON.stringify(options)}`)

    const filepaths = dotenvx.ls(directory, options.envFile, options.excludeEnvFile)
    logger.debug(`filepaths: ${JSON.stringify(filepaths)}`)

    // if present in db keypairs then data has been pushed/synced
    const filepathsWithCheckmarks = filepaths.map(filepath => {
      // short-circuit for .env.keys file
      if (filepath.endsWith('.env.keys')) {
        return `${filepath}`
      }

      const keypair = new DbKeypair(filepath).run()
      if (Object.keys(keypair).length > 0) {
        return `${filepath} ${syncedIcon}`
      } else {
        return `${filepath} ${notSyncedIcon}`
      }
    })

    const tree = new ArrayToTree(filepathsWithCheckmarks).run()
    logger.debug(`tree: ${JSON.stringify(tree)}`)

    logger.info(treeify(tree))
  } catch (error) {
    if (error.message) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

module.exports = ls

const treeify = require('object-treeify')

const { logger } = require('./../../shared/logger')

const dotenvx = require('@dotenvx/dotenvx')
const ArrayToTree = require('./../../lib/helpers/arrayToTree')

function ls (directory) {
  // debug args
  logger.debug(`directory: ${directory}`)

  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  const filepaths = dotenvx.ls(directory, options.envFile, options.excludeEnvFile)
  logger.debug(`filepaths: ${JSON.stringify(filepaths)}`)

  const filepathsWithCheckmarks = filepaths.map(filepath => `${filepath} ✔`)

  const tree = new ArrayToTree(filepathsWithCheckmarks).run()
  logger.debug(`tree: ${JSON.stringify(tree)}`)

  logger.info(treeify(tree))
}

module.exports = ls

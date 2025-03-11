const path = require('path')
const { fdir: Fdir } = require('fdir')
const treeify = require('object-treeify')

const current = require('./../../../db/current')
const ArrayToTree = require('./../../../lib/helpers/arrayToTree')

function filepaths (directory) {
  return new Fdir()
    .withFullPaths()
    .crawl(directory)
    .sync()
}

function storetree () {
  try {
    const _storepath = current.configPath()
    if (_storepath && _storepath.length > 1) {
      const directory = path.dirname(_storepath)
      const tree = new ArrayToTree(filepaths(directory)).run()
      console.log(treeify(tree))
    } else {
      console.error('missing storepath. Try running [dotenvx pro login].')
      process.exit(1)
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = storetree

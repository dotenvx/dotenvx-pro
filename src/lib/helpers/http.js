const { request } = require('undici')

const Errors = require('./errors')

async function http (url, opts = {}) {
  try {
    return await request(url, opts)
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Errors().econnrefused()
    }

    throw err
  }
}

module.exports = { request: http }

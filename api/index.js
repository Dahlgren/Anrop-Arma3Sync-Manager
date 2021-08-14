const express = require('express')

module.exports = (arma3sync, mods) => {
  const router = express.Router()

  router.use('/arma3sync', require('./arma3sync')(arma3sync))
  router.use('/mods', require('./mods')(mods))

  return router
}

var express = require('express')

module.exports = function (arma3sync, mods) {
  var router = express.Router()

  router.use('/arma3sync', require('./arma3sync')(arma3sync))
  router.use('/mods', require('./mods')(mods))

  return router
}

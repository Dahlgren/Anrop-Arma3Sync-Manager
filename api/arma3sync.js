var express = require('express')

module.exports = function (arma3sync) {
  var router = express.Router()

  router.post('/build', function (req, res) {
    arma3sync.build(function (err, out) {
      res.json({
        error: err,
        output: out
      })
    })
  })

  return router
}

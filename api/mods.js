var express = require('express')
var cors = require('cors')

module.exports = function (mods) {
  var router = express.Router()

  router.get('/', cors(), function (req, res) {
    res.json(mods.mods)
  })

  router.post('/', function (req, res) {
    mods.updateMods(function () {
      res.json(mods.mods)
    })
  })

  router.delete('/:id', function (req, res) {
    if (!req.params.id) {
      return res.sendStatus(400)
    }

    mods.delete(req.params.id, function (err) {
      if (err) {
        res.status(500).json(err)
      } else {
        res.status(204).json({})
      }
    })
  })

  return router
}

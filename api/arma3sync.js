const express = require('express')

module.exports = (arma3sync) => {
  const router = express.Router()

  router.post('/build', (req, res) => {
    arma3sync.build()
      .then(() => {
        res.status(204).json({})
      })
      .catch((err) => {
        res.status(500).json(err)
      })
  })

  router.post('/init', (req, res) => {
    arma3sync.init()
      .then(() => {
        res.status(204).json({})
      })
      .catch((err) => {
        res.status(500).json(err)
      })
  })

  return router
}

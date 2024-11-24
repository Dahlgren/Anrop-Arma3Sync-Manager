const express = require('express')
const cors = require('cors')

module.exports = (mods) => {
  const router = express.Router()

  router.get('/', cors(), (req, res) => {
    res.json(mods.mods)
  })

  router.post('/', (req, res) => {
    mods.updateMods()
    res.status(204).json({})
  })

  router.post('/:id/update', (req, res) => {
    if (!req.params.id) {
      return res.sendStatus(400)
    }

    mods.updateMod(req.params.id)
    res.status(204).json({})
  })

  router.delete('/:id', (req, res) => {
    if (!req.params.id) {
      return res.sendStatus(400)
    }

    mods.delete(req.params.id)
      .then(() => {
        res.status(204).json({})
      })
      .catch((err) => {
        res.status(500).json(err)
      })
  })

  return router
}

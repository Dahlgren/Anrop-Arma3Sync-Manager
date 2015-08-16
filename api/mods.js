var express = require('express');

module.exports = function (mods) {
  var router = express.Router();

  router.get('/', function (req, res) {
    res.json(mods.mods);
  });

  router.delete('/:id', function (req, res) {
    mods.delete(req.params.id, function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(204).json({});
      }
    });
  });

  return router;
};

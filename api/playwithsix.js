var express = require('express');

module.exports = function (mods) {
  var router = express.Router();

  router.post('/', function (req, res) {
    mods.download(req.body.name, function (err, mods) {
      if (err) {
        console.error("Failed to download " + req.body.name + ". " + err);
      }
    });

    res.sendStatus(204);
  });

  router.post('/search', function (req, res) {
    mods.search(req.body.query, function (err, mods) {
      if (err) {
        res.json({
          error: err,
        });
      } else {
        res.json({
          mods: mods,
        });
      }
    });
  });

  return router;
};

var armaClassParser = require('arma-class-parser')
var fs = require('fs')
var path = require('path')

module.exports = function (modPath, callback) {
  var metaCpp = path.join(modPath, 'meta.cpp')
  fs.readFile(metaCpp, 'utf8', function (err, data) {
    if (err) {
      return callback(null, null)
    }

    var meta = armaClassParser.parse(data)
    callback(null, {
      id: meta.publishedid,
      name: meta.name
    })
  })
}

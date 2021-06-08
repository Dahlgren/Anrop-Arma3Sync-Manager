var async = require('async')
var events = require('events')
var filesize = require('filesize')
var fs = require('fs.extra')
var path = require('path')

var getFolderSize = require('./getFolderSize')
var getSteamMeta = require('./getSteamMeta')

var Mods = function (config, state, arma3sync) {
  this.arma3sync = arma3sync
  this.config = config
  this.mods = []
  this.state = state
  this.updateMods()
}

Mods.prototype = new events.EventEmitter()

Mods.prototype.delete = function (mod, cb) {
  var self = this
  fs.rmrf(path.join(this.config.path, mod), function (err) {
    self.arma3sync.build()

    if (err) {
      console.log(err)
      return cb(err)
    }

    self.updateMods(cb)
  })
}

Mods.prototype.updateMods = function (cb) {
  if (!cb) {
    cb = function () {}
  }

  var self = this

  self.state.setRefreshing(true)
  self.loadMods(function (err, mods) {
    self.state.setRefreshing(false)

    if (err) {
      console.log(err)
      return cb(err)
    }

    self.mods = mods
    self.emit('mods', mods)
    cb()
  })
}

Mods.prototype.loadMods = function (cb) {
  var self = this
  fs.readdir(self.config.path, function (err, files) {
    if (err) {
      return cb(err)
    }

    var mods = files.filter(function (file) {
      return file.charAt(0) === '@'
    })

    async.map(mods, self.resolveModData.bind(self), cb)
  })
}

Mods.prototype.resolveModData = function (modName, cb) {
  var self = this
  var modPath = path.join(self.config.path, modName)
  async.parallel({
    folderSize: function (cb) {
      getFolderSize(modPath, cb)
    },
    steamWorkshop: function (cb) {
      getSteamMeta(modPath, cb)
    }
  }, function (err, results) {
    if (err) {
      return cb(err)
    }

    cb(null, {
      name: modName,
      size: results.folderSize,
      formattedSize: filesize(results.folderSize),
      steamWorkshop: results.steamWorkshop
    })
  })
}

module.exports = Mods

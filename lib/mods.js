var async = require('async')
var events = require('events')
var filesize = require('filesize')
var fs = require('fs.extra')
var path = require('path')

var getFolderSize = require('./getFolderSize')

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
      cb(err)
    } else {
      self.updateMods(cb)
    }
  })
}

Mods.prototype.updateMods = function (cb) {
  if (!cb) {
    cb = function () {}
  }

  var self = this

  self.state.setRefreshing(true)
  fs.readdir(self.config.path, function (err, files) {
    if (err) {
      console.log(err)
      cb(err)
    } else {
      var mods = files.filter(function (file) {
        return file.charAt(0) === '@'
      })

      async.map(mods, function (modName, cb) {
        var modPath = path.join(self.config.path, modName)
        getFolderSize(modPath, function (err, size) {
          if (err) {
            cb(err)
          } else {
            cb(null, {
              name: modName,
              size: size,
              formattedSize: filesize(size)
            })
          }
        })
      }, function (err, mods) {
        self.state.setRefreshing(false)

        if (err) {
          cb(err)
        } else {
          self.mods = mods
          self.emit('mods', mods)
          cb()
        }
      })
    }
  })
}

module.exports = Mods

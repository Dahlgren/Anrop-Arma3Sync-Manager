var async = require('async')
var events = require('events')
var filesize = require('filesize')
var getFolderSize = require('get-folder-size')
var fs = require('fs.extra')
var _ = require('lodash')
var path = require('path')
var playwithsix = require('playwithsix')

var resolveRequiredBy = require('./utils/resolveRequiredBy')
var resolveRequires = require('./utils/resolveRequires')

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

Mods.prototype.download = function (mod, cb) {
  var self = this
  var currentDownloadMod = null

  var options = {
    lite: this.config.liteMods,
    skipDependencies: this.config.skipDependencies
  }

  self.state.setDownloading(true)
  playwithsix.downloadMod(this.config.path, mod, options, function (err, mods) {
    self.state.setDownloading(false)
    self.arma3sync.build()
    self.updateMods()

    if (cb) {
      cb(err, mods)
    }
  }).on('progress', function (progress) {
    var modName = progress.mod

    if (!currentDownloadMod || currentDownloadMod.name !== modName) {
      if (currentDownloadMod) {
        currentDownloadMod.progress = null
      }

      var mod = _.find(self.mods, {name: modName})

      if (mod) {
        currentDownloadMod = mod
      } else {
        currentDownloadMod = {
          name: modName,
          outdated: false,
          playWithSix: true
        }
        self.mods.push(currentDownloadMod)
      }
    }

    // Progress in whole percent
    var newProgress = parseInt(progress.completed / progress.size * 100, 10)

    if (newProgress !== currentDownloadMod.progress) {
      currentDownloadMod.progress = newProgress
      self.emit('mods', self.mods)
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

      self.search('', function (err, pwsModsArr) {
        if (err) {
          return cb(err)
        }

        var pwsMods = _.keyBy(pwsModsArr, 'name')

        playwithsix.checkOutdated(self.config.path, function (err, outdatedMods) {
          if (err) {
            console.error('Error while checking for outdated mods: ' + err)
          }

          async.map(mods, function (modName, cb) {
            var modPath = path.join(self.config.path, modName)
            async.parallel({
              playWithSix: function (cb) {
                self.playWithSixInfo(modPath, function (info) {
                  var mod = null
                  if (info && info.name) {
                    var pwsMod = pwsMods[info.name]
                    if (pwsMod) {
                      mod = info
                      mod.dependencies = pwsMod.dependencies
                      mod.tags = pwsMod.tags
                      mod.title = pwsMod.title
                      mod.type = pwsMod.type
                    }
                  }

                  cb(null, mod)
                })
              },
              size: function (cb) {
                getFolderSize(modPath, function (err, size) {
                  if (err) {
                    cb(err)
                  } else {
                    cb(null, size)
                  }
                })
              }
            }, function (err, results) {
              if (err) {
                return cb(err)
              }

              cb(null, {
                name: modName,
                outdated: outdatedMods && outdatedMods.indexOf(modName) >= 0,
                playWithSix: results.playWithSix,
                size: results.size,
                formattedSize: filesize(results.size)
              })
            })
          }, function (err, mods) {
            resolveRequires(mods)
            resolveRequiredBy(mods)

            self.state.setRefreshing(false)

            if (err) {
              cb(err)
            } else {
              self.mods = mods
              self.emit('mods', mods)
              cb()
            }
          })
        })
      })
    }
  })
}

Mods.prototype.playWithSixInfo = function (modPath, cb) {
  var pwsFile = path.join(modPath, '.synq.json')
  fs.readFile(pwsFile, 'utf-8', function (err, data) {
    if (err) {
      console.error('Could not read PWS info for mod path ' + modPath + ' due to: ' + err)
    }

    if (cb) {
      if (data) {
        cb(_.pick(JSON.parse(data), ['branch', 'date', 'name', 'version']))
      } else {
        cb(null)
      }
    }
  })
}

Mods.prototype.search = function (query, cb) {
  playwithsix.search(query, function (err, mods) {
    if (err) {
      cb(err)
    } else {
      mods.map(function (mod) {
        mod.formattedSize = filesize(mod.size)
      })
      cb(null, mods)
    }
  })
}

module.exports = Mods

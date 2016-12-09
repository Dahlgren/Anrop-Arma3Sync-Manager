var async = require('async');
var events = require('events');
var filesize = require('filesize');
var getFolderSize = require('get-folder-size');
var fs = require('fs.extra');
var _ = require('lodash');
var path = require('path');
var playwithsix = require('playwithsix');

var Mods = function (config, state, arma3sync) {
  this.arma3sync = arma3sync;
  this.config = config;
  this.mods = [];
  this.state = state;
  this.updateMods();
};

Mods.prototype = new events.EventEmitter();

Mods.prototype.delete = function (mod, cb) {
  var self = this;
  fs.rmrf(path.join(this.config.path, mod), function (err) {
    self.arma3sync.build();

    if (err) {
      cb(err);
    } else {
      self.updateMods(cb);
    }
  });
};

Mods.prototype.download = function (mod, cb) {
  var self = this;
  var currentDownloadMod = null;
  var currentDownloadProgress = 0;

  self.state.setDownloading(true);
  playwithsix.downloadMod(this.config.path, mod, {lite: this.config.liteMods}, function(err, mods) {
    self.state.setDownloading(false);
    self.arma3sync.build();
    self.updateMods();

    if (cb) {
      cb(err, mods);
    }
  }).on('progress', function (progress) {
    var modName = progress.mod;

    if (!currentDownloadMod || currentDownloadMod.name != modName) {
      if (currentDownloadMod) {
        currentDownloadMod.progress = null;
      }

      var mod = _.find(self.mods, {name: modName});

      if (mod) {
        currentDownloadMod = mod;
      } else {
        currentDownloadMod = {
          name: modName,
          outdated: false,
          playWithSix: true,
        };
        self.mods.push(currentDownloadMod);
      }
    }

    // Progress in whole percent
    var newProgress = parseInt(progress.completed / progress.size * 100, 10);

    if (newProgress != currentDownloadMod.progress) {
      currentDownloadMod.progress = newProgress;
      self.emit('mods', self.mods);
    }
  });
};

Mods.prototype.updateMods = function (cb) {
  if (!cb) {
    cb = function () {};
  }

  var self = this;

  self.state.setRefreshing(true);
  fs.readdir(self.config.path, function (err, files) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      var mods = files.filter(function (file) {
        return file.charAt(0) == "@";
      });

      self.search("", function (err, pwsModsArr) {
        if (err) {
          return cb(err);
        }

        var pwsMods = _.keyBy(pwsModsArr, 'name');

        playwithsix.checkOutdated(self.config.path, function (err, outdatedMods) {
          async.map(mods, function (modName, cb) {
            var modPath = path.join(self.config.path, modName);
            var pwsMod = pwsMods[modName];

            getFolderSize(modPath, function(err, size) {
              var mod = {
                name: modName,
                outdated: outdatedMods && outdatedMods.indexOf(modName) >= 0,
                playWithSix: false,
              };

              if (!err) {
                mod.formattedSize = filesize(size);
                mod.size = size;
              }

              if (pwsMod) {
                mod.playWithSix = true;
                mod.title = pwsMod.title;
                mod.type = pwsMod.type;
              }

              cb(null, mod);
            });
          }, function (err, mods) {
            self.state.setRefreshing(false);

            if (err) {
              cb(err);
            } else {
              self.mods = mods;
              self.emit('mods', mods);
              cb();
            }
          });
        });
      })
    }
  });
};

Mods.prototype.removeDuplicates = function (mods) {
  return mods.reduce(function(a,b){
    if (a.indexOf(b) < 0 ) a.push(b);
    return a;
  },[]);
};

Mods.prototype.resolveMods = function (modsToResolve, cb) {
  var self = this;
  playwithsix.resolveDependencies(modsToResolve, {lite: this.config.liteMods}, function (err, mods) {
    if (!err && mods) {
      cb(null, self.removeDuplicates(modsToResolve.concat(mods)));
    } else {
      cb(err);
    }
  });
};

Mods.prototype.search = function (query, cb) {
  playwithsix.search(query, function (err, mods) {
    if (err) {
      cb(err);
    } else {
      mods.map(function (mod) {
        mod.formattedSize = filesize(mod.size);
      });
      cb(null, mods);
    }
  });
};

module.exports = Mods;

var async = require('async');
var events = require('events');
var filesize = require('filesize');
var fs = require('fs.extra');
var path = require('path');
var playwithsix = require('playwithsix');

var Mods = function (config) {
  this.config = config;
  this.mods = [];
  this.updateMods();
};

Mods.prototype = new events.EventEmitter();

Mods.prototype.delete = function (mod, cb) {
  var self = this;
  fs.rmrf(path.join(this.config.path, mod), function (err) {
    if (err) {
      cb(err);
    } else {
      self.updateMods(cb);
    }
  });
};

Mods.prototype.download = function (mod, cb) {
  var self = this;
  playwithsix.downloadMod(this.config.path, mod, {lite: this.config.liteMods}, function(err, mods) {
    self.updateMods();
    cb(err, mods);
  });
};

Mods.prototype.updateMods = function (cb) {
  if (!cb) {
    cb = function () {};
  }

  var self = this;
  fs.readdir(self.config.path, function (err, files) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      var mods = files.filter(function (file) {
        return file.charAt(0) == "@";
      });

      playwithsix.checkOutdated(self.config.path, function (err, outdatedMods) {
        async.map(mods, function (mod, cb) {
          var modPath = path.join(self.config.path, mod);
          self.isPlayWithSixMod(modPath, function (isPlayWithSixMod) {
            cb(null, {
              name: mod,
              outdated: outdatedMods && outdatedMods.indexOf(mod) >= 0,
              playWithSix: isPlayWithSixMod,
            });
          });
        }, function (err, mods) {
          if (err) {
            cb(err);
          } else {
            self.mods = mods;
            self.emit('mods', mods);
            cb();
          }
        });
      });
    }
  });
};

Mods.prototype.isPlayWithSixMod = function (modPath, cb) {
  var pwsFile = path.join(modPath, '.synq.json');
  fs.exists(pwsFile, function (exists) {
    if (cb) {
      cb(exists);
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

var path = require('path');
var spawn = require('child_process').spawn;

var Arma3Sync = function (config) {
  this.config = config;
};

Arma3Sync.prototype.build = function (cb) {
  var args = [
    '-BUILD',
    this.config.repository,
  ];

  this.execute(args, cb);
};

Arma3Sync.prototype.execute = function (args, cb) {
  var err = null;
  var output = "";

  var java = [
    '-jar',
    this.config.arma3syncJarFile,
  ];

  var childProcess = spawn(this.config.java, java.concat(args), {
    cwd: this.config.arma3sync, env: process.env
  });

  childProcess.stdout.on('data', function (data) {
    output += data.toString();
  });

  childProcess.stderr.on('data', function (data) {
    output += data.toString();
  });

  childProcess.on('close', function (code) {
    cb(err, output);
  });

  childProcess.on('error', function (code) {
    err = code;
  });
};

module.exports = Arma3Sync;

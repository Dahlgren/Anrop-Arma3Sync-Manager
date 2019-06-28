/*
 * Based on https://github.com/alessioalex/get-folder-size/blob/1.0.1/index.js
 * Uses stat instead of lstat
 */

var fs = require('fs')
var path = require('path')
var async = require('async')

function readSizeRecursive (item, ignoreRegEx, callback) {
  var cb
  var ignoreRegExp

  if (!callback) {
    cb = ignoreRegEx
    ignoreRegExp = null
  } else {
    cb = callback
    ignoreRegExp = ignoreRegEx
  }

  fs.stat(item, function stat (e, stats) {
    var total = !e ? (stats.size || 0) : 0

    if (!e && stats.isDirectory()) {
      fs.readdir(item, function readdir (err, list) {
        if (err) { return cb(err) }

        async.forEach(
          list,
          function iterate (dirItem, next) {
            readSizeRecursive(
              path.join(item, dirItem),
              ignoreRegExp,
              function readSize (error, size) {
                if (!error) { total += size }

                next(error)
              }
            )
          },
          function done (finalErr) {
            cb(finalErr, total)
          }
        )
      })
    } else {
      if (ignoreRegExp && ignoreRegExp.test(item)) {
        total = 0
      }

      cb(e, total)
    }
  })
}

module.exports = readSizeRecursive

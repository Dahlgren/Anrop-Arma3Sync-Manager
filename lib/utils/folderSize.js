const fs = require('fs').promises
const path = require('path')

module.exports = function folderSize (filepath) {
  return fs.stat(filepath)
    .then((stats) => {
      if (stats.isDirectory()) {
        return fs.readdir(filepath)
          .then((files) => {
            return Promise.all(files.map((file) => {
              return folderSize(path.join(filepath, file))
            }))
          })
          .then((fileSizes) => {
            return fileSizes.reduce((a, b) => a + b, 0)
          })
      }

      return stats.size
    })
}

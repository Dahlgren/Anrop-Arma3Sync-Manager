const ArmaClassParser = require('arma-class-parser')
const fs = require('fs').promises
const path = require('path')

module.exports = function steamMeta (modPath) {
  const metaCpp = path.join(modPath, 'meta.cpp')
  return fs.readFile(metaCpp, 'utf8')
    .then((data) => {
      const meta = ArmaClassParser.parse(data)
      return {
        id: meta.publishedid,
        name: meta.name
      }
    })
    .catch(() => {
      return null
    })
}

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

class FileHashCache {
  constructor (repoPath, diskCacheFilename) {
    this.filesCache = {}
    this.repoPath = repoPath
    this.diskCacheFilename = diskCacheFilename
    this.diskCache = this.readCache(this.diskCacheFilename)
  }

  readCache () {
    return fs.promises.readFile(this.diskCacheFilename)
      .then((jsonStr) => {
        const files = JSON.parse(jsonStr)
        files.forEach((file) => {
          this.filesCache[file.filename] = file
        })
        return this.cleanCache()
      })
      .catch((err) => {
        console.log('error reading cache', err)
      })
  }

  writeCache () {
    return this.cleanCache()
      .then(() => {
        const cache = Object.values(this.filesCache)
        const jsonStr = JSON.stringify(cache)
        fs.promises.writeFile(this.diskCacheFilename, jsonStr)
      })
  }

  cleanCache () {
    return Promise.all(Object.keys(this.filesCache).map((filename) => {
      return this.fileStat(filename)
        .then((stat) => {
          if (!stat) {
            delete this.filesCache[filename]
          }
        })
    }))
  }

  fileAbsolutePath (filename) {
    return path.resolve(this.repoPath, filename)
  }

  fileRepoPath (filename) {
    return path.relative(this.repoPath, filename)
  }

  fileStat (filename) {
    return fs.promises.stat(this.fileAbsolutePath(filename))
      .catch(() => {
        return null
      })
  }

  computeFileHash (filename) {
    return new Promise((resolve, reject) => {
      const shasum = crypto.createHash('sha1')
      const fileStream = fs.createReadStream(this.fileAbsolutePath(filename))

      fileStream.on('error', (err) => {
        if (err.code === 'ENOENT') {
          return resolve(null)
        }

        return reject(err)
      })

      fileStream.on('readable', () => {
        const data = fileStream.read()
        if (data) {
          return shasum.update(data)
        }

        return resolve(shasum.digest('hex'))
      })
    })
  }

  hash (filename) {
    filename = this.fileRepoPath(filename)
    return Promise.all([this.fileStat(filename), this.diskCache])
      .then(([fileStat]) => {
        if (!fileStat) {
          return null
        }

        const { mtime, size } = fileStat
        const cached = this.filesCache[filename]

        if (cached && cached.mtime === mtime.toJSON() && cached.size === size) {
          return cached.hash
        }

        return this.computeFileHash(filename)
          .then((hash) => {
            this.filesCache[filename] = {
              filename,
              hash,
              mtime,
              size
            }
            return hash
          })
      })
  }
}

module.exports = FileHashCache

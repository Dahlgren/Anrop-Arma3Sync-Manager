const fs = require('fs')

class SteamManifestCache {
  constructor (diskCacheFilename) {
    this.manifests = {}
    this.diskCacheFilename = diskCacheFilename
    this.diskCache = this.readCache(this.diskCacheFilename)
  }

  readCache () {
    return fs.promises.readFile(this.diskCacheFilename)
      .then((jsonStr) => {
        this.manifests = JSON.parse(jsonStr)
      })
      .catch((err) => {
        console.log('error reading cache', err)
      })
  }

  writeCache () {
    const jsonStr = JSON.stringify(this.manifests)
    return fs.promises.writeFile(this.diskCacheFilename, jsonStr)
  }

  wipeCache () {
    this.manifests = {}
  }

  removeManifest (id) {
    delete this.manifests[id]
  }

  getManifest (id) {
    return this.manifests[id]
  }

  saveManifest (id, manifest) {
    this.manifests[id] = manifest
  }
}

module.exports = SteamManifestCache

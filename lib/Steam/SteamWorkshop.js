const path = require('path')

const SteamManifestComparison = require('./SteamManifestComparison')

const appId = '107410'

module.exports = class SteamWorkshop {
  constructor (steamUser, fileHashCache, steamManifestCache) {
    this.steamUser = steamUser
    this.fileHashCache = fileHashCache
    this.steamManifestCache = steamManifestCache
    this.comparer = new SteamManifestComparison(this.fileHashCache)
  }

  async fetchManifest (ugcId) {
    const cachedManifest = this.steamManifestCache.getManifest(ugcId)
    if (cachedManifest) {
      return cachedManifest
    }

    const fileResults = await this.steamUser.getPublishedFileDetails([ugcId])
    const ugcFileDetails = fileResults.files[ugcId]
    const result = await this.steamUser.getManifest(appId, appId, ugcFileDetails.hcontent_file, 'public')
    this.steamManifestCache.saveManifest(ugcId, result.manifest)
    return result.manifest
  }

  async validateItem (ugcId, directory) {
    const manifest = await this.fetchManifest(ugcId)
    const result = await this.comparer.compare(manifest, directory)
    return {
      outdated: result.outdated.map(file => path.relative(directory, file.filename)).sort(),
      missing: result.missing.map(file => path.relative(directory, file.filename)).sort(),
      extra: result.extra.map(filename => path.relative(directory, filename)).sort()
    }
  }
}

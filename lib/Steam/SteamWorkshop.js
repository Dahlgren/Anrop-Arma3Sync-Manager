const fs = require('fs').promises
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
    const { outdated, missing, extra } = await this.comparer.compare(manifest, directory)
    return {
      outdated: outdated.map(file => file.filename).sort(),
      missing: missing.map(file => file.filename).sort(),
      extra: extra.sort()
    }
  }

  async downloadItem (ugcId, directory) {
    const manifest = await this.fetchManifest(ugcId)
    const { outdated, missing, extra } = await this.comparer.compare(manifest, directory)
    const deletePromises = Promise.all(extra.map(filename => this.deleteFile(filename, directory)))
    const downloadPromises = Promise.all(outdated.concat(missing).map(file => this.downloadFile(file, directory)))
    await Promise.all([deletePromises, downloadPromises])
  }

  async deleteFile (filename, directory) {
    await fs.unlink(path.resolve(directory, filename))
  }

  async downloadFile (file, directory) {
    await this.steamUser.downloadFile(appId, appId, file, file.localFilename)
  }
}

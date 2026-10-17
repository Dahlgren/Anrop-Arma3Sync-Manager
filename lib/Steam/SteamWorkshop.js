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
    let { outdated, missing, extra } = await this.comparer.compare(manifest, directory)
    if (outdated.length == 1 && outdated[0].filename == 'meta.cpp') {
      outdated = []
    }
    return {
      outdated: outdated.map(file => file.filename).sort(),
      missing: missing.map(file => file.filename).sort(),
      extra: extra.sort()
    }
  }

  async downloadItem (ugcId, directory) {
    const manifest = await this.fetchManifest(ugcId)
    const { outdated, missing, extra } = await this.comparer.compare(manifest, directory)
    const filesToDownload = outdated.concat(missing)
    await this.createDirectories(filesToDownload)
    const deletePromises = Promise.all(extra.map(filename => this.deleteFile(filename, directory)))
    const downloadPromises = Promise.all(filesToDownload.map(file => this.downloadFile(file, directory)))
    await Promise.all([deletePromises, downloadPromises])
    await this.removeEmptyDirectories(directory, true)
    await this.updateMetaCpp(ugcId, directory)
  }

  async createDirectories (files) {
    const directories = new Set(files.map(file => path.dirname(file.localFilename)))
    await Promise.all([...directories].map(directory => fs.mkdir(directory, { recursive: true })))
  }

  async removeEmptyDirectories (directory, isRoot = false) {
    const dirents = await fs.readdir(directory, { withFileTypes: true })
    const names = new Set(dirents.map(dirent => dirent.name))
    const removed = await Promise.all(dirents.map(async (dirent) => {
      const direntPath = path.resolve(directory, dirent.name)

      if (dirent.isDirectory()) {
        return this.removeEmptyDirectories(direntPath)
      }

      // Remove leftover zsync files whose original file no longer exists
      if (dirent.name.endsWith('.zsync') && !names.has(dirent.name.slice(0, -'.zsync'.length))) {
        await fs.unlink(direntPath)
        return true
      }

      return false
    }))
    const isEmpty = removed.every(Boolean)

    if (isEmpty && !isRoot) {
      await fs.rmdir(directory)
      return true
    }

    return false
  }

  async deleteFile (filename, directory) {
    await fs.unlink(path.resolve(directory, filename))
  }

  async downloadFile (file, directory) {
    try {
      await this.steamUser.downloadFile(appId, appId, file, file.localFilename)
    } catch (error) {
      console.log('error downloading', file, error)
    }
  }

  async updateMetaCpp (ugcId, directory) {
    const metaCppFile = path.resolve(directory, 'meta.cpp')
    try {
      try {
        await fs.access(metaCppFile)
      } catch (error) {
        await fs.writeFile(metaCppFile, `publishedid = ${ugcId};`)
        return
      }

      const metaCppContents = await fs.readFile(metaCppFile, { encoding: 'utf8' })
      if (metaCppContents.includes('publishedid')) {
        await fs.writeFile(metaCppFile, metaCppContents.replace('publishedid = 0;', `publishedid = ${ugcId};`))
      } else {
        await fs.writeFile(metaCppFile, metaCppContents + `\npublishedid = ${ugcId};\n`)
      }
    } catch (error) {
      console.log('error writing meta.cpp', error)
    }
  }
}

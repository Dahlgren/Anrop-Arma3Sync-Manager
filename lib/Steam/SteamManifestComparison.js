const path = require('path')
const SteamUser = require('steam-user')

const getFiles = require('../utils/getFiles')

const emptyFileHash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
const ignoredManifestPaths = [
  '/.git/',
  '/.synqinfo',
  '/.synq.json',
  '/.svn/',
  '/optionals/',
  '/userconfig/'
]

module.exports = class SteamManifestComparison {
  constructor (fileHashCache) {
    this.fileHashCache = fileHashCache
  }

  containsIgnoredManifestPath (filePath) {
    return ignoredManifestPaths.filter(path => filePath.includes(path)).length > 0
  }

  manifestFiles (manifest, directory) {
    return manifest.files
      .filter(file => !(file.flags & SteamUser.EDepotFileFlag.Directory))
      .map(file => (
        {
          ...file,
          localFilename: this.resolvePath(directory, file.filename.toLowerCase())
        }
      ))
      .filter(file => {
        return !this.containsIgnoredManifestPath(file.localFilename)
      })
  }

  resolvePath (base, filePath) {
    base = base.replace(/\\/g, '/')
    filePath = filePath.replace(/\\/g, '/')
    return path.join(base, filePath)
  }

  async compareManifestFiles (manifestFiles) {
    return Promise.all(manifestFiles.map(async (file) => {
      let expectedHash = file.sha_content

      if (parseInt(file.size, 10) === 0) {
        expectedHash = emptyFileHash
      }

      const fileHash = await this.fileHashCache.hash(file.localFilename)
      return {
        file,
        match: expectedHash === fileHash,
        missing: fileHash === null
      }
    }))
  }

  async extraLocalFiles (manifestFiles, directory) {
    const manifestFilenames = manifestFiles.map(file => file.localFilename)
    const localFilenames = await getFiles(directory)
    return localFilenames
      .filter(localFilename => !localFilename.endsWith('.zsync'))
      .filter(localFilename => !manifestFilenames.includes(localFilename))
  }

  async compare (manifest, directory) {
    const manifestFiles = this.manifestFiles(manifest, directory)
    const [manifestFilesMatches, extraLocalFiles] = await Promise.all([
      this.compareManifestFiles(manifestFiles),
      this.extraLocalFiles(manifestFiles, directory)
    ])

    return {
      valid: manifestFilesMatches.filter(result => result.match).map(result => result.file),
      outdated: manifestFilesMatches.filter(result => !result.match && !result.missing).map(result => result.file),
      missing: manifestFilesMatches.filter(result => result.missing).map(result => result.file),
      extra: extraLocalFiles
    }
  }
}

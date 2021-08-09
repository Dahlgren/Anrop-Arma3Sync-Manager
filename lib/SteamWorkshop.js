const path = require('path')
const SteamUser = require('steam-user')

const appId = '107410'
const emptyFileHash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'

const ignoredPaths = [
  '/.svn/',
  '/optionals/'
]

class SteamWorkshop {
  constructor (steamUser, fileHashCache) {
    this.steamUser = steamUser
    this.fileHashCache = fileHashCache
  }

  static containsIgnoredPath (filePath) {
    return ignoredPaths.filter(path => filePath.includes(path)).length > 0
  }

  static manifestFiles (directory, manifest) {
    const manifestFiles = manifest.files
    const filesMetadata = manifestFiles.filter(file => !(file.flags & SteamUser.EDepotFileFlag.Directory))

    // Lowercase all file paths
    filesMetadata.forEach(file => {
      file.filename = SteamWorkshop.resolvePath(directory, file.filename.toLowerCase())
    })

    // Remove ignored files
    return filesMetadata.filter(file => {
      return !SteamWorkshop.containsIgnoredPath(file.filename)
    })
  }

  static resolvePath (base, filePath) {
    base = base.replace(/\\/g, '/')
    filePath = filePath.replace(/\\/g, '/')
    return path.join(base, filePath)
  }

  async findInvalidFiles (files) {
    const matches = await Promise.all(files.map(async (file) => {
      let expectedHash = file.sha_content

      if (parseInt(file.size, 10) === 0) {
        expectedHash = emptyFileHash
      }

      const fileHash = await this.fileHashCache.hash(file.filename)
      return {
        file,
        match: expectedHash === fileHash
      }
    }))
    return matches.filter(file => !file.match).map(file => file.file)
  }

  async fetchManifest (ugcId) {
    const fileResults = await this.steamUser.getPublishedFileDetails([ugcId])
    const ugcFileDetails = fileResults.files[ugcId]
    const result = await this.steamUser.getManifest(appId, appId, ugcFileDetails.hcontent_file, 'public')
    return result.manifest
  }

  async validateItem (ugcId, directory) {
    const manifest = await this.fetchManifest(ugcId)
    const files = SteamWorkshop.manifestFiles(directory, manifest)
    const invalidFiles = await this.findInvalidFiles(files)

    return {
      outdated: invalidFiles.length > 0
    }
  }
}

module.exports = SteamWorkshop

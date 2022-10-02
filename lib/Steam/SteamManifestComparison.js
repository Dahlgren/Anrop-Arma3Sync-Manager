const path = require('path')
const SteamUser = require('steam-user')

const emptyFileHash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
const ignoredPaths = [
  '/.svn/',
  '/optionals/'
]

module.exports = class SteamManifestComparison {
  constructor (fileHashCache) {
    this.fileHashCache = fileHashCache
  }

  containsIgnoredPath (filePath) {
    return ignoredPaths.filter(path => filePath.includes(path)).length > 0
  }

  manifestFiles (manifest, directory) {
    const manifestFiles = manifest.files
    const filesMetadata = manifestFiles.filter(file => !(file.flags & SteamUser.EDepotFileFlag.Directory))

    // Lowercase all file paths
    filesMetadata.forEach(file => {
      file.filename = this.resolvePath(directory, file.filename.toLowerCase())
    })

    // Remove ignored files
    return filesMetadata.filter(file => {
      return !this.containsIgnoredPath(file.filename)
    })
  }

  resolvePath (base, filePath) {
    base = base.replace(/\\/g, '/')
    filePath = filePath.replace(/\\/g, '/')
    return path.join(base, filePath)
  }

  async compare (manifest, directory) {
  	const files = this.manifestFiles(manifest, directory)
    const matches = await Promise.all(files.map(async (file) => {
      let expectedHash = file.sha_content

      if (parseInt(file.size, 10) === 0) {
        expectedHash = emptyFileHash
      }

      const fileHash = await this.fileHashCache.hash(file.filename)
      return {
        file,
        match: expectedHash === fileHash,
        missing: fileHash === null
      }
    }))
    return {
    	valid: matches.filter(result => result.match).map(result => result.file),
      outdated: matches.filter(result => !result.match && !result.missing).map(result => result.file),
      missing: matches.filter(result => result.missing).map(result => result.file)
    }
  }
}

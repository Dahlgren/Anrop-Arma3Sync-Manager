const { a3sDirectory, repoBuildService, setFileHasher } = require('arma3sync-lib')

module.exports = class Arma3Sync {
  constructor (state, fileHashCache) {
    this.state = state
    this.fileHashCache = fileHashCache
    setFileHasher(this.fileHashCache)
  }

  build () {
    this.state.setBuilding(true)
    return repoBuildService.update()
      .then(() => {
        return this.fileHashCache.writeCache()
      })
      .catch((err) => {
        console.log('failed to build', err)
        throw err
      })
      .finally(() => {
        this.state.setBuilding(false)
      })
  }

  init () {
    this.state.setBuilding(true)
    return repoBuildService.initializeRepository()
      .then(() => {
        this.state.setInitialized(true)
      })
      .catch((err) => {
        console.log('failed to initialize', err)
        throw err
      })
      .finally(() => {
        this.state.setBuilding(false)
      })
  }

  validate () {
    this.state.setBuilding(true)
    return a3sDirectory.getSync()
      .then(() => {
        this.state.setInitialized(true)
      })
      .catch((err) => {
        console.log('repo not initialized', err)
      })
      .finally(() => {
        this.state.setBuilding(false)
      })
  }
}

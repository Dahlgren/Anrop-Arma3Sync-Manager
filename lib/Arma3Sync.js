const { a3sDirectory, repoBuildService } = require('arma3sync-lib')

module.exports = class Arma3Sync {
  constructor (state) {
    this.state = state
  }

  build () {
    this.state.setBuilding(true)
    return repoBuildService.update()
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

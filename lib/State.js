const EventEmitter = require('events').EventEmitter

module.exports = class State extends EventEmitter {
  constructor () {
    super()
    this.state = {
      building: false,
      downloading: false,
      refreshing: false
    }
  }

  setBuilding (building) {
    this.state.building = building
    this.emit('state', this.state)
  }

  setDownloading (downloading) {
    this.state.downloading = downloading
    this.emit('state', this.state)
  }

  setRefreshing (refreshing) {
    this.state.refreshing = refreshing
    this.emit('state', this.state)
  }
}

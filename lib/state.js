var events = require('events');

var State = function () {
  this.state = {
    building: false,
    downloading: false,
    refreshing: false,
  }
};

State.prototype = new events.EventEmitter();

State.prototype.setBuilding = function (building) {
  this.state.building = building;
  this.emit('state', this.state);
};

State.prototype.setDownloading = function (downloading) {
  this.state.downloading = downloading;
  this.emit('state', this.state);
}

State.prototype.setRefreshing = function (refreshing) {
  this.state.refreshing = refreshing;
  this.emit('state', this.state);
}

module.exports = State;

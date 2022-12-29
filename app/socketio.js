const io = require('socket.io-client')

angular.module('app')
  .factory('socket', ['socketFactory', function (socketFactory) {
    const socket = socketFactory({
      ioSocket: io.connect()
    })
    socket.forward('error')
    socket.forward('mods')
    socket.forward('state')
    return socket
  }])
  .run(['socket', function (socket) {
  }])

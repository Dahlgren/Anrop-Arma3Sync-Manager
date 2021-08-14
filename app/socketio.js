angular.module('app')
  .factory('socket', function (socketFactory) {
    const socket = socketFactory()
    socket.forward('error')
    socket.forward('mods')
    socket.forward('state')
    return socket
  })
  .run(function (socket) {
  })

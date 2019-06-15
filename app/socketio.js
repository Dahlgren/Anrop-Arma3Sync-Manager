angular.module('app')
  .factory('socket', function (socketFactory) {
    var socket = socketFactory()
    socket.forward('error')
    socket.forward('mods')
    socket.forward('state')
    return socket
  })
  .run(function (socket) {
  })

angular.module('app')
  .factory('socket', (socketFactory) => {
    const socket = socketFactory()
    socket.forward('error')
    socket.forward('mods')
    socket.forward('state')
    return socket
  })
  .run()

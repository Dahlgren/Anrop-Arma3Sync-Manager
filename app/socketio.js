angular.module('app', [
  'btford.socket-io',
]).
factory('socket', function (socketFactory) {
  var socket = socketFactory();
  socket.forward('error');
  socket.forward('mods');
  return socket;
}).
run(function (socket) {
})

require('./style.css')

require('angular')
require('angular-socket-io')
require('angular-sweetalert')

angular.module('app', [
  'btford.socket-io',
  'oitozero.ngSweetAlert'
])

require('./arma3sync')
require('./mods')
require('./socketio.js')

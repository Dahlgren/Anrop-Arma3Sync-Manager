var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var logger = require('morgan');
var path = require('path');
var socketio = require('socket.io');

var config = require('./config');
var Arma3Sync = require('./lib/arma3sync');
var Mods = require('./lib/mods');

var app = express();
var server = http.Server(app);
var io = socketio(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(require('connect-livereload')());
app.use(express.static(path.join(__dirname, 'public')));

var arma3sync = new Arma3Sync(config);
var mods = new Mods(config);

app.use('/api', require('./api')(arma3sync, mods));

app.get('/*', function(req, res) {
  res.render('public/index.html');
});

io.on('connection', function (socket) {
  socket.emit('mods', mods.mods);
});

mods.on('mods', function(mods) {
  io.emit('mods', mods);
});

server.listen(config.port);

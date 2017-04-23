var bodyParser = require('body-parser');
var express = require('express');
var favicon = require('serve-favicon');
var http = require('http');
var logger = require('morgan');
var path = require('path');
var socketio = require('socket.io');

var config = require('./config');
var State = require('./lib/state');
var Arma3Sync = require('./lib/arma3sync');
var Mods = require('./lib/mods');

var app = express();
var server = http.Server(app);
var io = socketio(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(require('connect-livereload')());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

var state = new State();
var arma3sync = new Arma3Sync(config, state);
var mods = new Mods(config, state, arma3sync);

app.use('/api', require('./api')(arma3sync, mods));

app.get('/*', function(req, res) {
  res.render('public/index.html');
});

io.on('connection', function (socket) {
  socket.emit('mods', mods.mods);
  socket.emit('state', state.state);
});

mods.on('mods', function(mods) {
  io.emit('mods', mods);
});

state.on('state', function(state) {
  io.emit('state', state);
});

server.listen(config.port, config.host);

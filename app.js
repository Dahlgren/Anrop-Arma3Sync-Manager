require('dotenv').config()

if (process.env.NEW_RELIC_LICENSE_KEY && process.env.NEW_RELIC_APP_NAME) {
  require('newrelic')
}

const bodyParser = require('body-parser')
const express = require('express')
const favicon = require('serve-favicon')
const http = require('http')
const logger = require('morgan')
const path = require('path')
const SocketIO = require('socket.io').Server

const State = require('./lib/State')
const Arma3Sync = require('./lib/Arma3Sync')
const Mods = require('./lib/Mods')

const app = express()
const server = http.Server(app)
const io = new SocketIO(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(require('connect-livereload')())
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))

const state = new State()
const arma3sync = new Arma3Sync(state)
const mods = new Mods(state, arma3sync)

app.use('/api', require('./api')(arma3sync, mods))

app.get('/*', (req, res) => {
  res.render('public/index.html')
})

io.on('connection', (socket) => {
  socket.emit('mods', mods.mods)
  socket.emit('state', state.state)
})

mods.on('mods', (mods) => {
  io.emit('mods', mods)
})

state.on('state', (state) => {
  io.emit('state', state)
})

arma3sync.validate()

server.listen(process.env.WEB_PORT, process.env.WEB_HOST)

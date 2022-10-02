const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const SteamSession = require('steam-session')

module.exports = class SteamAuth extends EventEmitter {
  constructor (username, password, refreshTokenPath) {
    super()
    this.username = username
    this.password = password
    this.refreshTokenPath = refreshTokenPath
  }

  login () {
    return fs.promises.readFile(this.refreshTokenPath, 'utf-8')
      .then((refreshToken) => {
        this.emit('refreshToken', JSON.parse(refreshToken))
      })
      .catch((err) => {
        console.log(err)
        this.loginWithUsernameAndPassword()
      })
  }

  loginWithUsernameAndPassword () {
    this.steamSession = new SteamSession.LoginSession(SteamSession.EAuthTokenPlatformType.SteamClient)

    this.steamSession.startWithCredentials({
      accountName: this.username,
      password: this.password
    })

    this.steamSession.on('authenticated', async () => {
      const session = this.steamSession
      console.log('Authenticated successfully! Printing your tokens now...')
      console.log(`SteamID: ${session.steamID}`)
      console.log(`Account name: ${session.accountName}`)
      console.log(`Access token: ${session.accessToken}`)
      console.log(`Refresh token: ${session.refreshToken}`)
      fs.promises.writeFile(this.refreshTokenPath, JSON.stringify(session.refreshToken))

      this.emit('refreshToken', session.refreshToken)
    })
  }
}

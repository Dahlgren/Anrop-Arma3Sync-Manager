const EventEmitter = require('events').EventEmitter
const filesize = require('filesize')
const fs = require('fs-extra')
const path = require('path')

const folderSize = require('./utils/folderSize')
const steamMeta = require('./utils/steamMeta')

module.exports = class Mods extends EventEmitter {
  constructor (state, arma3sync, steamUser, steamWorkshop, fileHashCache) {
    super()
    this.arma3sync = arma3sync
    this.fileHashCache = fileHashCache
    this.mods = []
    this.path = process.env.ARMA3SYNC_REPO_PATH
    this.state = state
    this.steamUser = steamUser
    this.steamWorkshop = steamWorkshop
  }

  delete (mod, cb) {
    return fs.remove(path.join(this.path, mod))
      .then(() => {
        this.arma3sync.build()
        this.updateMods()
      })
  }

  updateMods (cb) {
    this.state.setRefreshing(true)
    return this.loadMods()
      .then((mods) => {
        this.fileHashCache.writeCache()
        this.mods = mods
        this.emit('mods', mods)
      })
      .finally(() => {
        this.state.setRefreshing(false)
      })
  }

  loadMods (cb) {
    return fs.readdir(this.path)
      .then((files) => {
        const mods = files.filter((file) => {
          return file.charAt(0) === '@'
        })

        return Promise.all(mods.map((mod) => this.resolveModData(mod)))
      })
  }

  resolveModData (modName, cb) {
    const modPath = path.join(this.path, modName)
    return Promise.all([
      folderSize(modPath),
      steamMeta(modPath)
    ]).then(([folderSize, steamMeta]) => {
      const modData = {
        name: modName,
        size: folderSize,
        formattedSize: filesize(folderSize),
        steamWorkshop: steamMeta
      }

      if (!this.contentServersReady || !(steamMeta && steamMeta.id)) {
        return modData
      }

      return this.steamWorkshop.validateItem(steamMeta.id, modPath)
        .then((data) => {
          return {
            ...modData,
            steamWorkshop: {
              ...modData.steamWorkshop,
              files: data
            }
          }
        })
        .catch((err) => {
          console.log('error validating steam workshop mod', steamMeta.id, err)
          return modData
        })
    })
  }
}

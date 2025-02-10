const EventEmitter = require('events').EventEmitter
const filesize = require('filesize')
const fs = require('fs-extra')
const path = require('path')

const folderSize = require('./utils/folderSize')
const steamMeta = require('./utils/steamMeta')

module.exports = class Mods extends EventEmitter {
  constructor (state, arma3sync, steamUser, steamWorkshop, fileHashCache, steamManifestCache) {
    super()
    this.arma3sync = arma3sync
    this.fileHashCache = fileHashCache
    this.mods = []
    this.path = process.env.ARMA3SYNC_REPO_PATH
    this.state = state
    this.steamUser = steamUser
    this.steamWorkshop = steamWorkshop
    this.steamManifestCache = steamManifestCache
  }

  modPath (mod) {
    return path.join(this.path, mod)
  }

  delete (mod) {
    return fs.remove(this.modPath(mod))
      .then(() => {
        this.arma3sync.build()
        this.updateMods()
      })
  }

  updateMod (mod) {
    this.state.setRefreshing(true)
    const modPath = this.modPath(mod)

    return steamMeta(modPath)
      .then(async (steamMeta) => {
        if (!steamMeta || !steamMeta.id) {
          throw new Error('Mod does not have a Steam Workshop ID in meta.cpp')
        }

        await this.steamWorkshop.downloadItem(steamMeta.id, modPath)
        await this.updateMods()
        this.arma3sync.build()
      })
      .catch((err) => {
        console.log('error updating mod', err)
      })
      .finally(() => {
        this.state.setRefreshing(false)
      })
  }

  updateMods (force) {
    this.state.setRefreshing(true)

    if (force) {
      this.steamManifestCache.wipeCache()
    }

    return this.loadMods()
      .then((mods) => {
        this.mods = mods
        this.emit('mods', mods)
      })
      .catch((err) => {
        console.log('error updating mods', err)
      })
      .finally(() => {
        return this.fileHashCache.writeCache()
      })
      .finally(() => {
        return this.steamManifestCache.writeCache()
      })
      .finally(() => {
        this.state.setRefreshing(false)
      })
  }

  loadMods () {
    return fs.readdir(this.path)
      .then((files) => {
        const mods = files.filter((file) => {
          return file.charAt(0) === '@'
        })

        return Promise.all(mods.map((mod) => this.resolveModData(mod)))
      })
  }

  resolveModData (mod, cb) {
    const modPath = this.modPath(mod)
    return Promise.all([
      folderSize(modPath),
      steamMeta(modPath)
    ]).then(([folderSize, steamMeta]) => {
      const modData = {
        name: mod,
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

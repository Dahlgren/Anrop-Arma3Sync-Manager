module.exports = function (mods) {
  return mods.map(function (mod) {
    if (!mod.playWithSix || !mod.playWithSix.dependencies) {
      return mod
    }

    mod.playWithSix.requires = mod.playWithSix.dependencies.map(function (dependency) {
      return {
        exists: mods.some(function (mod) {
          return mod.name === dependency
        }),
        name: dependency
      }
    })

    return mod
  })
}

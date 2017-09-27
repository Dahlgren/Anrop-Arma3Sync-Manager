module.exports = function (mods) {
  return mods.map(function (mod) {
    if (!mod.playWithSix) {
      return mod
    }

    var name = mod.name
    mod.playWithSix.requiredBy = mods.filter(function (mod) {
      if (!mod.playWithSix || !mod.playWithSix.dependencies) {
        return false
      }

      return mod.playWithSix.dependencies.indexOf(name) >= 0
    }).map(function (mod) {
      return {
        exists: true,
        name: mod.name
      }
    })

    return mod
  })
}

const childProcess = require('child_process')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)

module.exports = class Arma3Sync {
  constructor (config, state) {
    this.config = config
    this.state = state
  }

  build () {
    const args = [
      '-BUILD',
      this.config.repository
    ]

    this.state.setBuilding(true)
    return this.execute(args)
      .catch((err) => {
        console.log('failed to build', err)
        throw err
      })
      .finally(() => {
        this.state.setBuilding(false)
      })
  }

  execute (args) {
    const jar = [
      '-jar',
      this.config.arma3syncJarFile
    ]

    return execFile(this.config.java, jar.concat(args))
  }
}

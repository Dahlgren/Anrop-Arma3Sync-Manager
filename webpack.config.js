const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './index.js',
  mode: 'development',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  }
}

var webpack = require('webpack')

function createConfig(out, plugins) {
  return {
    entry: './src/umdEntry.js',
    output: {
      path: './umd/',
      filename: out,
      libraryTarget: 'umd',
      library: 'BasicStreams',
    },
    module: {
      loaders: [
        {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
      ],
    },
    plugins: plugins,
  }
}

module.exports = [
  createConfig('basicStreams.js', []),
  createConfig('basicStreams.min.js', [new webpack.optimize.UglifyJsPlugin()]),
]

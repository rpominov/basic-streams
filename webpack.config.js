var webpack = require('webpack')

function createConfig(out, plugins) {
  return {
    entry: './src/index.js',
    output: {
      path: './dist/',
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
  createConfig('index.js', []),
  createConfig('index.min.js', [new webpack.optimize.UglifyJsPlugin()]),
]

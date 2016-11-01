module.exports = {
  entry: {
    'frontend': './frontend.js'
  },
  devtool: 'inline-source-map',
  output: {
    path: __dirname,
    filename: '[name]-bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};

const gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  connect = require('connect'),
  serveStatic = require('serve-static'),
  connectLiveReload = require('connect-livereload'),
  //  historyApiFallback = require('connect-history-api-fallback'),
  path = require('path'),
  distDir = __dirname,
  webpack = require('webpack'),
  bundler = webpack({
    entry: {
      'app': './app.js'
    },
    devtool: 'inline-source-map',
    output: {
      path: distDir,
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
  });


gulp.task('js', cb => {
  bundler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('webpack:build', err);
    }
    $.util.log('[webpack:build]', stats.toString({
      colors: true,
      chunkModules: false
    }));
    cb();
    $.livereload.reload();
  });
});

gulp.task('serve', () => {
  const port = process.env.PORT || 3000;
  $.livereload.listen();
  connect()
    .use(connectLiveReload())
  //.use(historyApiFallback())
    .use(serveStatic(distDir))
    .listen(port);
});

gulp.task('dev', ['js', 'serve'], () => {
  gulp.watch(['app.js'], ['js']);
});

gulp.task('default', [], () => {
  gulp.start('dev');
});

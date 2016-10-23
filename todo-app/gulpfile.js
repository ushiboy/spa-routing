const gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  connect = require('connect'),
  runApiServer = require('./api-server'),
  serveStatic = require('serve-static'),
  connectLiveReload = require('connect-livereload'),
  historyApiFallback = require('connect-history-api-fallback'),
  proxyMiddleware = require('http-proxy-middleware'),
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
  const port = Number(process.env.PORT || '3000'),
    apiPort = port + 1;

  runApiServer(apiPort);

  $.livereload.listen();
  connect()
    .use(connectLiveReload())
    .use(proxyMiddleware([
      '/api'
    ], {
      target: `http://localhost:${apiPort}`,
      changeOrigin: true
    }))
    .use(historyApiFallback())
    .use(serveStatic(distDir))
    .listen(port);
});

gulp.task('dev', ['js', 'serve'], () => {
  gulp.watch(['app.js'], ['js']);
});

gulp.task('default', [], () => {
  gulp.start('dev');
});

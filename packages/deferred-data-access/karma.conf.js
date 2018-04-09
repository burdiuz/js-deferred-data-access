const { getBabelLoader } = require('./webpack.helpers');

// Karma configuration
module.exports = (config) => {
  config.set({
    basePath: __dirname,
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      'source/**/*.spec.js',
    ],
    exclude: [],
    preprocessors: {
      'source/**/*.js': ['webpack', 'sourcemap'],
    },
    reporters: ['coverage', 'progress', 'coveralls'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
    },
    webpack: {
      resolve: {
        extensions: ['.js'],
      },
      module: {
        rules: [
          {
            test: /(\.spec\.js$|stubs\.js$)/,
            use: getBabelLoader(['transform-es2015-modules-commonjs']),
          },
          {
            test: /\.js$/,
            exclude: /(\.spec\.js$|stubs\.js$)/,
            use: getBabelLoader(['babel-plugin-istanbul', 'transform-es2015-modules-commonjs']),
          },
        ],
      },
      devtool: 'inline-source-map',
    },
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false,
        colors: true,
      },
      stats: 'errors-only',
    },
    plugins: [
      require('karma-webpack'),
      require('karma-coverage'),
      require('karma-coveralls'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-mocha'),
      require('karma-sinon-chai'),
    ],
    port: 9876,
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    browsers: ['Firefox', 'Chrome'],
    //browsers: ['Chrome', 'IE', 'Firefox'],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  });
};

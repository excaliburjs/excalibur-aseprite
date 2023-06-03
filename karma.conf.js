// Karma configuration
// Generated on Wed Oct 06 2021 20:12:33 GMT-0500 (Central Daylight Time)

const webpack = require('./webpack.config');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    webpack,

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['jasmine'],

    proxies: {
      // smooths over loading files because karma prepends '/base/' to everything
      '/test/' : '/base/test/'
    },

    // list of files / patterns to load in the browser
    files: [
      'node_modules/excalibur/build/dist/excalibur.js',
      'test/unit/_boot.ts',
      { pattern: './src/**/*.js.map', included: false, served: true },
      { pattern: './test/**/*.js.map', included: false, served: true },
      { pattern: './test/**/*.json', included: false, served: true },
      { pattern: './test/**/*.png', included: false, served: true },
      { pattern: './test/**/*.aseprite', included: false, served: true }
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'test/unit/_boot.ts': ['webpack']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity
  })
}

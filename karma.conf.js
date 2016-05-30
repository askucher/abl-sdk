// Karma configuration
// Generated on Fri May 13 2016 14:19:16 GMT+0000 (UTC)

module.exports = function(config) {
  config.set({

    

   

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'https://js.stripe.com/v2/',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-beta1/jquery.js',
      'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js',
      'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.4/moment-timezone.js',
      'node_modules/angular/angular.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.0.9/angular-material.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/resources/_modules.ls',
      'test/resources/enabledDebug.ls',
      'test/resources/xabl.ls',
      'main.js',
      'test/tests/*.ls'
    ],



    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
       '**/*.ls': ['livescript']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8080,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],
    
     // you can define custom flags
    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      }
    },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

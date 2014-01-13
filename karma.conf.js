var CI = !!process.env.TRAVIS;
var SAUCE = !!process.env.SAUCE_USERNAME;
var NG_VERSION = process.env.NG_VERSION;
var MIN = process.env.MIN ? '.min' : '';
var SINGLE_RUN = (!!process.env.SINGLE_RUN) || false;
var BUILD = process.env.TRAVIS_BUILD_NUMBER
  ? 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'
  : 'LOCAL ' + require('os').hostname();

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    autoWatch: true,
    logLevel: config.LOG_INFO,
    colors: true,
    singleRun: SAUCE,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 20000,
    files: [
      'vendor/angular.' + NG_VERSION + '.js',
      'vendor/angular-mocks.' + NG_VERSION + '.js',
      'ng-hyper' + MIN + '.js',
      'test/*.test.js'
    ],

    browsers: SAUCE
      ? ['sl_chrome_linux', 'sl_chrome_windows', 'sl_chrome_mac', 'sl_firefox_linux', 'sl_firefox_windows', 'sl_firefox_mac', 'sl_safari_mac', 'sl_ie7', 'sl_ie8', 'sl_ie9', 'sl_ie10', 'sl_ie11']
      : ['Chrome', 'Firefox', 'Safari', 'PhantomJS'],

    // TODO wait for sauce to support ws
    // https://github.com/angular/angular.js/blob/master/karma-shared.conf.js#L136
    transports: SAUCE ? ['xhr-polling'] : ['websocket', 'xhr-polling'],

    sauceLabs: {
      testName: 'ng-hyper w/ Angular v' + NG_VERSION,
      startConnect: !CI,
      options: {
        'selenium-version': '2.37.0'
      },
      build: BUILD,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER || null
    },

    customLaunchers: {
      sl_chrome_linux: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'linux'
      },
      sl_chrome_windows: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 8.1'
      },
      sl_chrome_mac: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'OS X 10.9'
      },
      sl_firefox_linux: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'linux'
      },
      sl_firefox_windows: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 8.1'
      },
      sl_firefox_mac: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'OS X 10.9'
      },
      sl_safari_mac: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.9'
      },
      sl_ie7: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows XP',
        version: '7'
      },
      sl_ie8: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '8'
      },
      sl_ie9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2008',
        version: '9'
      },
      sl_ie10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2012',
        version: '10'
      },
      sl_ie11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    }
  });

  if (!CI) return;
  config.loggers.push({
    type: 'file',
    filename: process.env.LOGS_DIR + '/' + 'karma.log'
  });
};

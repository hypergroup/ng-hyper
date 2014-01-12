/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyper translator service
 */

pkg.factory('hyperTranslator', [
  function() {
    return function(str) {
      return str;
    }
  }
]);

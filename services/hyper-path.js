/**
 * Module dependencies
 */

var pkg = require('../package');
var request = require('hyper-path');

/**
 * hyper path service
 */

pkg.factory('hyperPath', [
  function() {
    return request;
  }
]);

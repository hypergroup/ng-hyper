/**
 * Module dependencies
 */

var template = require('../templates/input.html');
var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

/**
 * hyperInput
 */

package.directive('hyperInput', [
  function() {
    return {
      replace: true,
      template: template,
      scope: {
        input: '=hyperInput'
      }
    };
  }
]);

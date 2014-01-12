/**
 * Module dependencies
 */

var inputs = require('../templates/inputs.html');
var pkg = require('../package');

/**
 * hyperInput
 */

pkg.directive('hyperInput', [
  function() {
    return {
      template: inputs,
      replace: true,
      scope: {
        input: '=hyperInput'
      }
    };
  }
]);

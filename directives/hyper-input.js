/**
 * Module dependencies
 */

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
      template: '<input data-ng-model="hyperValues[input.name]" data-ng-class="{\'ng-hyper-loading\': !input, \'ng-hyper-loaded\': input}" name="{{input.name}}" type="{{input.type}}" placeholder="{{input.prompt || input.placeholder || input.name}}" data-ng-required="input.required">',
      scope: {
        input: '=hyperInput',
        hyperValues: '&'
      }
    };
  }
]);

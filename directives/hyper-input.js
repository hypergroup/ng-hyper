/**
 * Module dependencies
 */

var inputs = require('../templates/inputs.html');
var pkg = require('../package');

/**
 * hyperInput
 */

pkg.directive('hyperInput', [
  'hyper',
  function(hyper) {
    return {
      template: inputs,
      replace: true,
      scope: {
        input: '=hyperInput'
      },
      link: function($scope, el, attrs) {
        hyper.get('input.placeholder', $scope, function(placeholder) {
          $scope.placeholder = placeholder;
        });
      }
    };
  }
]);

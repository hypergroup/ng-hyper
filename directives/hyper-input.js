/**
 * Module dependencies
 */

var inputs = require('../templates/inputs.html');
var package = require('../package');

/**
 * hyperInput
 */

package.directive('hyperInput', [
  function() {
    return {
      template: inputs,
      replace: true,
      scope: true,
      link: function($scope, elem, attrs) {
        $scope.$watch(attrs.hyperInput, function(input) {
          $scope.input = input;
        });
      }
    };
  }
]);

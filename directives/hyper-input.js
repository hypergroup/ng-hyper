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
      compile: function compile(tElement, tAttrs) {
        var inputClass = tAttrs.class;
        var placeholder = tAttrs.placeholder;
        tElement.removeClass(tAttrs.class);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
            scope.inputClass = inputClass;
            scope.placeholder = placeholder;
          },
          post: function postLink($scope, el, attrs) {
            hyper.get('input.placeholder', $scope, function(placeholder) {
              if (placeholder) $scope.placeholder = placeholder;
            });
          }
        };
      }
    };
  }
]);

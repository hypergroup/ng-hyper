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
        var inputClass = tAttrs['class'];
        tElement.removeClass(tAttrs['class']);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
            scope.inputClass = inputClass;
          },
          post: function postLink($scope, el, attrs) {
            function watch(path, fn) {
              hyper.get('input.' + path, $scope, function(val) {
                $scope[path] = val;
                fn && fn(val);
              });
            }
            watch('placeholder');
            watch('prompt');
          }
        };
      }
    };
  }
]);

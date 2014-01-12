/**
 * Module dependencies
 */

var pkg = require('../package');
var utils = require('../lib/utils');

/**
 * hyper translate directive
 */

pkg.directive('hyperTranslate', [
  'hyper',
  'hyperTranslator',
  function(hyper, hyperTranslator) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        var transParts = attrs.hyperTranslate.split('<-');

        var translation;
        hyper.get(transParts[0].trim(), $scope, function(translationContent) {
          if (!translationContent) return;
          translation = translationContent;
          translate();
        });

        if (!transParts[1]) return;
        angular.forEach(transParts[1].split(','), function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.trim().split(' as ');
          var path = parts[0];
          var target = parts[1];

          hyper.get(path, $scope, function(value, req) {
            var t = target || req.target;
            $scope[t] = value;

            translate();
          });
        });

        function translate() {
          if (!translation) return elem.text('');
          var res = hyperTranslator(translation, $scope);
          if (!res) return elem.text('');
          elem.text(res);
        }
      }
    };
  }
]);

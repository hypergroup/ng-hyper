/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyperInput
 */

pkg.directive('hyperInputOptions', [
  'hyper',
  function(hyper) {
    return {
      link: function ($scope, el, attrs) {
        hyper.get(attrs.hyperInputOptions, $scope, function(options) {
          $scope.options = options = options || [];
          angular.forEach(options, function(opt) {
            if (!opt) return;

            function set(key) {
              hyper.get(key, opt, function(val) {
                opt[key] = val;
                try {
                  $scope.$digest();
                } catch (e) {}
              });
            }

            set('text');
            set('value');
          });
        });
      }
    };
  }
]);

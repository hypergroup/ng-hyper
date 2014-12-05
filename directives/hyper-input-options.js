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
          $scope.options = options || [];
          fetch();
        });

        $scope.$watch('options[0].text', function(val) {
          if (typeof val === 'object' && val.href) fetch();
        });

        function fetch() {
          angular.forEach($scope.options || [], function(opt) {
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
          });
        }
      }
    };
  }
]);

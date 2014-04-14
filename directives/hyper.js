/**
 * Module dependencies
 */

var pkg = require('../package');
var merge = require('../lib/utils').merge;

/**
 * hyper scope directive
 *
 * The 'hyper' directive is an attribute that exposes a path property
 * of a 'hyper' api in the scope of the client. For example, if we know
 * we need the data at `.account.name` it would traverse our api and expose
 * `name` into our $scope.
 *
 * You may also specify a binding name: `.account.name as firstName` and the
 * value of `.account.name` will be assigned to `$scope.firstName`.
 */

pkg.directive('hyper', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        var exprs = attrs.hyper.split(',');

        angular.forEach(exprs, function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.trim().split(' as ');
          var path = parts[0];
          var target = parts[1];

          hyper.get(path, $scope, function(value, req) {
            var t = target || req.target;
            $scope[t] = merge($scope[t], value);

            if (status.isLoaded(value)) return status.loaded(elem);
            return status.undef(elem);
          });
        });
      }
    };
  }
]);

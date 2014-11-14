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

        var exprs = attrs.hyper.trim().split(/ *, */);

        angular.forEach(exprs, function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.split(/ +as +/);
          var paths = parts[0].split(/ +or +/);
          var target = parts[1];

          var responses = [];
          angular.forEach(paths, function(path, i) {
            hyper.get(path, $scope, function(value, req) {
              responses[i] = {target: target || req.target, value: value};
              update();
            });
          });

          function update() {
            var res = select(responses);
            var t = res ? res.target : target;
            var value = res ? res.value : undefined;
            $scope[t] = merge($scope[t], value);
            if (status.isLoaded(value)) return status.loaded(elem);
            return status.undef(elem);
          }
        });
      }
    };
  }
]);

/**
 * Iterate through the available responses and pick first first defined response
 *
 * @param {Array} responses
 * @return {Object|Null}
 */

function select(responses) {
  for (var i = 0, l = responses.length; i < l; i++) {
    var res = responses[i];
    // bail because the higher precidence paths haven't finished
    if (!res) return null;
    if (!res.value) continue;
    return res;
  }
}

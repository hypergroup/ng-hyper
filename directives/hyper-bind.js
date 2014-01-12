/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyperBind
 */

pkg.directive('hyperBind', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperBind, $scope, function(value, req) {
          // expose value to the scope
          $scope[req.target] = value;

          // set the element contents
          elem.text(format(value));

          if (status.isLoaded(value)) return status.loaded(elem);
          return status.loading(elem);
        });
      }
    };

    function format(value, def) {
      if (status.isLoaded(value)) return value;
      if (typeof def === 'undefined') return '';
      return def;
    };
  }
]);

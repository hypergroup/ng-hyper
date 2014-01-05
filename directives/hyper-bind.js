/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var format = utils.formatValue;
var loading = utils.loading;
var loaded = utils.loaded;
var isLoaded = utils.isLoaded;

/**
 * hyperBind
 */

package.directive('hyperBind', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        loading(elem);

        $watchPath.call($scope, attrs.hyperBind, function(err, value, req) {
          // TODO come up with an error strategy
          if (err) return console.error(err.stack || err);

          // expose value to the scope
          $scope[req.target] = value;

          // set the element contents
          elem.text(format(value));

          if (isLoaded(value)) return loaded(elem);
          return loading(elem);
        });
      }
    };
  }
]);

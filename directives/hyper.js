/**
 * Module dependencies
 */

var package = require('../package');
var request = require('hyper-path');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

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
 *
 * If the attribute `hyper-progressive` is set it will not, set `display: none;`
 * on the element as it is loading.
 */

package.directive('hyper', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        if (!attrs.hyperProgressive) elem.css('display', 'none');

        // split the command to allow binding to arbitrary names
        var parts = attrs.hyper.split(' as ');
        var path = parts[0];
        var target = parts[1];

        var req = $watchPath.call($scope, path, function(err, value) {
          $scope[target || req.target] = value;
          if (value === 0 || value) elem.css('display', '');
        });
      }
    };
  }
]);

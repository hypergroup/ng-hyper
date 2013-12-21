/**
 * Module dependencies
 */

var package = require('../package');
var request = require('hyper-path');
var each = require('each');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var merge = utils.merge;

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

package.directive('hyper', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        var exprs = attrs.hyper.split(',');

        each(exprs, function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.trim().split(' as ');
          var path = parts[0];
          var target = parts[1];

          $watchPath.call($scope, path, function(err, value, req) {
            // TODO come up with an error strategy
            if (err) return console.error(err.stack || err);

            var t = target || req.target
            $scope[t] = merge($scope[t], value);
            if (value !== 0 && !value) return;

            elem.removeClass('ng-hyper-loading');
            elem.addClass('ng-hyper-loaded');
          });
        });
      }
    };
  }
]);

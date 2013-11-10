/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

/**
 * hyperStyle
 */

package.directive('hyperStyle', [
  '$rootScope',
  function($rootScope) {
    var styles = $rootScope.styles = $rootScope.$new();
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {

        var rules = attrs.hyperStyle.split(',');

        rules.forEach(function(style) {
          style = style.trim();
          $watchPath.call($scope, style, function(err, value) {
            // TODO come up with an error strategy
            if (err) return console.error(err);

            var name = style.split('.').pop();
            styles[name] = value;
          });
        })

      }
    };
  }
]);

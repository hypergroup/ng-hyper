/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

/**
 * hyperBind
 */

package.directive('hyperBind', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        $watchPath.call($scope, attrs.hyperBind, function(err, value) {
          // TODO come up with an error strategy
          if (err) return console.error(err);

          // display numbers correctly
          elem.text(value === 0 ? value : (value || ''));
          if (value !== 0 && !value) return;

          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');
        });
      }
    };
  }
]);

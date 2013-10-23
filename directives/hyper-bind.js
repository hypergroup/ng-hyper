/**
 * Module dependencies
 */

var package = require('../package');
var request = require('hyper-path');

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
        if (!attrs.hyperProgressive) elem.css('display', 'none');

        $watchPath.call($scope, attrs.hyperBind, function(err, value) {
          // display numbers correctly
          elem.text(value === 0 ? value : (value || ''));
          if (value === 0 || value) elem.css('display', '');
        });
      }
    };
  }
]);

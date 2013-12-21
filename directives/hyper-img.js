/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

/**
 * hyperImg
 */

package.directive('hyperImg', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        $watchPath.call($scope, attrs.hyperImg, function(err, value) {
          // TODO come up with an error strategy
          if (err) return console.error(err.stack || err);

          var isUndef = typeof value === 'undefined';

          var src = isUndef ? '' : (value.src || value.href || value);
          var title = isUndef ? '' : (value.title || value.alt || '');

          // TODO add srcset
          attrs.$set('src', src);
          attrs.$set('alt', title);
          if (isUndef) return;

          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');
        });
      }
    };
  }
]);

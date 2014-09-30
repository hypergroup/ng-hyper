/**
 * Module dependencies
 */

var pkg = require('../package');
var map = require('map');

/**
 * hyperImgBackground
 */

pkg.directive('hyperImgBackground', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperImgBackground, $scope, function(value) {
          var isLoaded = status.isLoaded(value);

          var src = isLoaded
            ? (value.src || value.href || value)
            : '';
          var title = isLoaded
            ? (value.title || value.alt || '')
            : '';

          if (src) elem.css('background-image', 'url(' + src + ')');
          else elem.css('background-image', null);

          if (isLoaded) return status.loaded(elem);
          return status.undef(elem);
        });
      }
    };
  }
]);

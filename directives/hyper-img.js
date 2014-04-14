/**
 * Module dependencies
 */

var pkg = require('../package');
var map = require('map');

/**
 * hyperImg
 */

pkg.directive('hyperImg', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperImg, $scope, function(value) {
          var isLoaded = status.isLoaded(value);

          var src = isLoaded
            ? (value.src || value.href || value)
            : '';
          var title = isLoaded
            ? (value.title || value.alt || '')
            : '';

          if (angular.isArray(src)) {
            var srcset = map(src, function(img) {
              return img.src + ' ' + (img.size || '');
            }).join(', ');
            elem.prop('srcset', srcset);
            src = src[0].src;
          }

          elem.prop('src', src);
          elem.prop('alt', title);

          if (isLoaded) return status.loaded(elem);
          return status.undef(elem);
        });
      }
    };
  }
]);

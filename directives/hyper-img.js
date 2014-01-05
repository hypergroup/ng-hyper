/**
 * Module dependencies
 */

var package = require('../package');
var type = require('type');
var map = require('map');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var loading = utils.loading;
var loaded = utils.loaded;

/**
 * hyperImg
 */

package.directive('hyperImg', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        loading(elem);

        $watchPath.call($scope, attrs.hyperImg, function(err, value) {
          // TODO come up with an error strategy
          if (err) return console.error(err.stack || err);

          var isLoaded = utils.isLoaded(value);

          var src = isLoaded
            ? (value.src || value.href || value)
            : '';
          var title = isLoaded
            ? (value.title || value.alt || '')
            : '';

          if (type(src) === 'array') {
            var srcset = map(src, function(img) {
              return img.src + ' ' + (img.size || '');
            }).join(', ');
            attrs.$set('srcset', srcset);
            src = src[0].src;
          }

          attrs.$set('src', src);
          attrs.$set('alt', title);

          if (isLoaded) return loaded(elem);
          return loading(elem);
        });
      }
    };
  }
]);

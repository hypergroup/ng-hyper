/**
 * Module dependencies
 */

var package = require('../package');
var encode = require('websafe-base64').encode;
var slug = require('slug');
var map = require('map');

/**
 * Initialize our regular expression for url construction/deconstruction
 */

var regexp = /:([\w-]+)/g;

/**
 * Register it with angular
 */

package.directive('hyperLink', [
  function() {
    return {
      link: function($scope, elem, attrs) {
        if (!attrs.hyperProgressive) elem.css('display', 'none');
        
        var keys = parse(attrs.hyperLink);

        var exp = '[' + keys.toString() + ']';

        $scope.$watch(exp, function() {
          var loaded = true;

          var href = attrs.hyperLink.replace(regexp, function(full, key) {
            if ($scope[key]) return $scope[key];
            loaded = false;
            return '-';
          });

          // we're still waiting for properties to come in
          if (!loaded && !attrs.hyperProgressive) return;

          elem.attr('href', href);
          elem.css('display', '');
        }, true);
      }
    };
  }
]);

/**
 * Parse the link 
 */

exports.parse = parse;
function parse(link) {
  return map(link.match(regexp), function(key) {
    return key.substr(1);
  });
}

/**
 * Format a value for the url
 */

exports.fmt = fmt;
function fmt(v) {
  return (v && v.href ? encode(v.href) : slug(v || '')) || v;
}

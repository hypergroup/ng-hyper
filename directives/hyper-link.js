/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
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
        elem.addClass('ng-hyper-loading');

        var href = attrs.hyperLink;
        var keys = parse(href);

        // If it doesn't have any templated properties just render it
        if (!keys) return loadLink(href);

        var exp = '[' + keys.toString() + ']';

        $scope.$watch(exp, function() {
          var res = create(attrs.hyperLink, $scope);

          // we're still waiting for properties to come in
          if (!res.loaded) return;

          loadLink(res.href);
        }, true);

        function loadLink(href) {
          elem.attr('href', href);
          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');
        }
      }
    };
  }
]);

exports.create = create;
function create(href, $scope) {
  var res = {loaded: true};
  res.href = href.replace(regexp, function(full, key) {
    if ($scope[key] || $scope[key] === 0) return fmt($scope[key]);
    res.loaded = false;
    return '-';
  });
  return res;
};

/**
 * Parse the link 
 */

exports.parse = parse;
function parse(link) {
  var matches = link.match(regexp);
  if (!matches) return;
  return map(matches, function(key) {
    return key.substr(1);
  });
}

/**
 * Format a value for the url
 */

exports.fmt = fmt;
function fmt(v) {
  if (v && v.href) return utils.encode(v.href);
  return slug(v);
}

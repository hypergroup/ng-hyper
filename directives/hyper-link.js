/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var slug = require('slug');
var map = require('map');

/**
 * Initialize our regular expression for url construction/deconstruction
 */

var regexp = /:([\w-\.]+)/g;

/**
 * Register it with angular
 */

package.directive('hyperLink', [
  '$location',
  function($location) {
    return {
      link: function($scope, elem, attrs) {
        elem.addClass('ng-hyper-loading');

        var href = attrs.hyperLink;

        // watch the location and add an active class
        $scope.$on('$locationChangeSuccess', updateActive);

	$watch.call($scope, href, function(formatted) {
	  href = formatted;
          elem.attr('href', formatted);
          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');
          updateActive();
   	});

        var isActive = false;
        function updateActive() {
          if (href === ($location.url() || '/')) {
            elem.addClass('active');
            isActive = true;
          } else if (isActive) {
            elem.removeClass('active');
            isActive = false;
          }
        }
      }
    };
  }
]);

exports.$watch = $watch;
function $watch(href, cb) {
  var $scope = this;
  var keys = parse(href);
  if (!keys) return cb(href);

  var values = {};
  map(keys, function(key) {
    $watchPath.call($scope, key, function(err, value) {
      if (err) return console.error(err.stack || err);
      values[key] = value;
      update(values);
    });
  });

  function update(values) {
    var res = create(href, values);
    if (res.loaded) cb(res.href);
  };
};

exports.create = create;
function create(href, values) {
  var res = {loaded: true};
  res.href = href.replace(regexp, function(full, key) {
    if (values[key] || values[key] === 0) return fmt(values[key]);
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

/**
 * Module dependencies
 */

var request = require('hyper-path');
var websafe = require('websafe-base64');
var type = require('type');

/**
 * Watch the value at a path
 */

exports.$watchPath = function(path, fn) {
  var $scope = this;

  // Make the request to the api
  var req = request(path);

  // we're not starting at the root of the api so we need to watch
  // the first property, or `req.index`, in the path
  if (!req.isRoot) $scope.$watch(req.index, function(parent, old) {
    req._root = req._root || {};
    req._root[req.index] = parent;
    req.scope(req._root);
  }, true);

  // listen to any updates from the api
  req.on(function(err, value) {
    $safeApply.call($scope, function() {
      fn(err, value, req);
    });
  });

  // stop listening when our directive goes away
  $scope.$on('$destroy', function() {
    req.off();
  });
};

/**
 * Safely call apply
 *
 * @param {Function} fn
 * @api private
 */

exports.$safeApply = $safeApply;
function $safeApply(fn) {
  var phase = this.$root.$$phase;
  if (phase === '$apply' || phase === '$digest') return fn();
  this.$apply(fn);
}

exports.encode = function(str) {
  return websafe.encode(str);
};

exports.decode = function(str) {
  return websafe.decode(str);
};

exports.loading = function(elem) {
  elem.removeClass('ng-hyper-loaded');
  elem.addClass('ng-hyper-loading');
};

exports.loaded = function(elem) {
  elem.removeClass('ng-hyper-loading');
  elem.addClass('ng-hyper-loaded');
};

exports.formatValue = function(value, def) {
  if (exports.isLoaded(value)) return value;
  if (typeof def === 'undefined') return '';
  return def;
};

exports.isLoaded = function(value) {
  return !!(value === 0 || value === false || value);
};

/**
 * Expose merge
 */

exports.merge = merge;

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

function merge (a, b) {
  var t = type(b);
  // set simple types
  if (t !== 'object' && t !== 'array') return b;

  // if they're different types just return b
  if (type(a) !== t) return b;

  // make the arrays the same length
  if (t === 'array') a.splice(b.length);

  // remove any old properties
  // TODO is there a way to improve the O(2N)?
  if (t === 'object') {
    for (var key in a) {
      // don't delete angular properties
      if (key.charAt && key.charAt(0) === '$') continue;
      if (!b[key]) delete a[key];
    }
  }

  for (var key in b) {
    a[key] = merge(a[key], b[key]);
  }
  return a;
}

exports.shallowMerge = shallowMerge;
function shallowMerge(a, b) {
  for (var k in b) {
    a[k] = b[k];
  }
  return a;
}

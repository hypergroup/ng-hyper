/**
 * Module dependencies
 */

var request = require('hyper-path');
var websafe = require('websafe-base64');

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

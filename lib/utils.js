/**
 * Module dependencies
 */

var type = require('type');

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

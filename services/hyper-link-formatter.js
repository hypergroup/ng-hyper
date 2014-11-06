/**
 * Module dependencies
 */

var pkg = require('../package');
var websafe = require('websafe-base64');
var slug = require('slug');

/**
 * hyper link formatter service
 */

pkg.factory('hyperLinkFormatter', [
  'hyperHttpRoot',
  function(root) {
    function encode(value) {
      if (value && value.href) return websafe.encode(value.href.replace(root, '~'));
      if (angular.isString(value)) return slug(value);
      if (angular.isNumber(value)) return '' + value;
      return '-';
    }

    function decode(str) {
      try {
        return websafe.decode(str).replace('~', root);
      } catch (e) {}
    }

    return {
      encode: encode,
      decode: decode
    };
  }
]);

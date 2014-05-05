/**
 * Module dependencies
 */

var pkg = require('../package');
var each = angular.forEach;
var map = require('map');

/**
 * setup the link regexp
 */

pkg.value('hyperLinkRegexp', /:([\w-\.]+)/g);

/**
 * hyper link service
 */

pkg.factory('hyperLink', [
  'hyper',
  'hyperLinkFormatter',
  'hyperLinkRegexp',
  function(hyper, formatter, regexp) {
    function create(href, values) {
      var res = {loaded: true};
      res.href = href.replace(regexp, function(full, path) {
        if (values[path] || values[path] === 0) return formatter.encode(values[path]);
        res.loaded = false;
        return '-';
      });
      if (res.href.charAt(0) === '/') res.href = res.href.substring(1);
      return res;
    }

    create.watch = function(href, $scope, fn) {
      var paths = create.parse(href);
      if (!paths) return fn(href);

      var values = {};
      each(paths, function(path) {
        hyper.get(path, $scope, function(value) {
          values[path] = value;
          update(values);
        });
      });

      function update(values) {
        var res = create(href, values);
        if (res.loaded) fn(res.href);
      }
    };

    create.parse = function(link) {
      var matches = link.match(regexp);
      if (!matches) return;
      return map(matches, function(path) {
        return path.substr(1); // take off the ':'
      });
    };

    return create;
  }
]);

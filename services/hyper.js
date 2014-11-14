/**
 * Module dependencies
 */

var pkg = require('../package');
var $safeApply = require('../lib/utils').$safeApply;

/**
 * hyper service
 */

pkg.factory('hyper', [
  '$exceptionHandler',
  'hyperBackend',
  'hyperPath',
  function($exceptionHandler, backend, request) {
    function get(path, $scope, fn) {
      var req = request(path, backend);

      // we're not starting at the root of the api so we need to watch
      // the first property in the path, or `req.index`, as the root
      if (!req.isRoot) $scope.$watch(req.index, function(parent) {
        req._root = req.root || {};
        req._root[req.index] = parent;
        req.scope(req._root);
      }, true);

      // listen to any updates from the api
      req.on(function(err, value) {
        if (err) return $exceptionHandler(err);
        $safeApply.call($scope, function() {
          fn(value, req);
        });
      });

      $scope.$on('$destroy', function() {
        req.off();
      });

      return req;
    }

    function submit(method, action, data, fn, disableRefresh) {
      backend.submit(method, action, data, fn, disableRefresh);
    }

    return {
      get: get,
      submit: submit
    };
  }
]);

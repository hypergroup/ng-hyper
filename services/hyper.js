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
      if (typeof $scope === 'function') {
        fn = $scope;
        $scope = null;
      };

      var req = request(path, backend);

      // we're not starting at the root of the api so we need to watch
      // the first property in the path, or `req.index`, as the root
      if (!req.isRoot && $scope && $scope.$watch) $scope.$watch(req.index, function(parent) {
        req._root = req.root || {};
        req._root[req.index] = parent;
        req.scope(req._root);
      }, true);

      if ($scope && !$scope.$watch) req.scope($scope);

      // listen to any updates from the api
      req.on(function(err, value) {
        if (err) return $exceptionHandler(err);

        if ($scope && $scope.$apply) return $safeApply.call($scope, function() {
          fn(value, req);
        });

        fn(value, req);
      });

      if ($scope && $scope.$on) {
        $scope.$on('$destroy', function() {
          req.off();
        });
      } else {
        req.off();
      }

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

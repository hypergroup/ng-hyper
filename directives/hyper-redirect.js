/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * Register it with angular
 */

pkg.directive('hyperRedirect', [
  '$location',
  'hyperLink',
  'hyperStatus',
  function($location, hyperLink, status) {
    return {
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyperLink.watch(attrs.hyperRedirect, $scope, function(href) {
          $location.replace();
          $location.path(href);
        });
      }
    };
  }
]);

/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * Initialize our regular expression for url construction/deconstruction
 */

var regexp = /:([\w-\.]+)/g;

/**
 * Register it with angular
 */

pkg.directive('hyperLink', [
  '$location',
  'hyperLink',
  'hyperStatus',
  function($location, hyperLink, status) {
    return {
      link: function($scope, elem, attrs) {
        status.loading(elem);

        var href = attrs.hyperLink;
        var isActive = false;

        // watch the location and add an active class
        $scope.$on('$locationChangeSuccess', updateActive);

        hyperLink.watch(href, $scope, function(formatted) {
          href = formatted;
          elem.attr('href', formatted);
          status.loaded(elem);
          updateActive();
        });

        function updateActive() {
          if (isActive) return setInactive();
          if (href === ($location.url() || '/')) return setActive();
        }

        function setActive() {
          elem.addClass('active');
          isActive = true;
        }

        function setInactive() {
          elem.removeClass('active');
          isActive = false;
        }
      }
    };
  }
]);

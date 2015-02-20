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
        var showActive = !attrs.hyperLinkDisableActive;

        // watch the location and add an active class
        if (showActive) $scope.$on('$locationChangeSuccess', updateActive);

        hyperLink.watch(href, $scope, function(formatted) {
          href = formatted;
          elem.attr('href', formatted);
          status.loaded(elem);
          if (showActive) updateActive();
        });

        function updateActive() {
          var location = $location.url() || '/';
          return (href === location || '/' + href === location) ?
            setActive() :
            setInactive();
        }

        function setActive() {
          if (isActive) return;
          elem.addClass('active');
          isActive = true;
        }

        function setInactive() {
          if (!isActive) return;
          elem.removeClass('active');
          isActive = false;
        }
      }
    };
  }
]);

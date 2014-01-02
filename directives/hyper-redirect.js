/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var hl = require('./hyper-link');

/**
 * Register it with angular
 */

package.directive('hyperRedirect', [
  '$location',
  function($location) {
    return {
      link: function($scope, elem, attrs) {
	elem.addClass ('ng-hyper-loading');

	hl.$watch.call($scope, attrs.hyperRedirect, function(href) {
	  console.log(href);
	  $location.path(href);
	});
      }
    };
  }
]);

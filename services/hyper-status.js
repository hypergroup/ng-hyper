/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyper status service
 */

pkg.factory('hyperStatus', [
  function() {
    return {
      loading: function(elem) {
        elem.removeClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loading');
      },
      loaded: function(elem) {
        elem.removeClass('ng-hyper-loading');
        elem.removeClass('ng-hyper-loaded-undefined');
        elem.addClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loaded-defined');
      },
      undef: function(elem) {
        elem.removeClass('ng-hyper-loading');
        elem.removeClass('ng-hyper-loaded-defined');
        elem.addClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loaded-undefined');
      },
      isLoaded: function(value) {
        return typeof value !== 'undefined';
      }
    };
  }
]);

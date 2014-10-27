/**
 * Module dependencies
 */

var pkg = require('../package');
var each = angular.forEach;
var utils = require('../lib/utils');
var $safeApply = utils.$safeApply;
var merge = utils.merge;
var isCrossDomain = require('url').isCrossDomain;

/**
 * HyperController
 */

pkg.controller('HyperController', [
  '$scope',
  '$routeParams',
  'hyper',
  'hyperLinkFormatter',
  function HyperController($scope, $routeParams, hyper, hyperLinkFormatter) {
    // keep track of current the subscriptions
    var scopes = {};

    $scope.$watch(function() {
      return $routeParams;
    }, function(newVal, oldVal) {

      // clean up the old parameters/values
      each(oldVal, function(value, key) {
        // the param hasn't changed since last time
        if ($routeParams[key] == value) return;

        // unsubscribe from the old url and clean up the scope
        if (scopes[key]) scopes[key].$destroy();
        delete $scope[key];
        delete scopes[key];
      });

      // add the new params
      each($routeParams, function(value, key) {
        // ignore slugs
        if (key === 'slug') return;

        // try decoding the parameter
        var href = hyperLinkFormatter.decode(value);

        // it didn't look like a valid url
        if (!href) return;

        // if it doesn't look like a url don't do anything with it
        if (href.indexOf('http') !== 0 && href.indexOf('/') !== 0) return;

        // don't allow CORS attacks
        // TODO give an error message
        // if (isCrossDomain(href)) return;

        var requestScope = scopes[key] = $scope.$new(true);
        requestScope.value = {href: href};
        hyper.get('value', requestScope, function(body, req) {
          $scope[key] = merge($scope[key], body);
        });
      });
    }, true);
  }
]);

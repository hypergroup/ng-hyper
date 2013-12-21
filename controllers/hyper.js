/**
 * Module dependencies
 */

var package = require('../package');
var each = require('each');
var request = require('hyper-emitter');
var utils = require('../lib/utils');
var $safeApply = utils.$safeApply;
var merge = utils.merge;
var isCrossDomain = require('url').isCrossDomain;

/**
 * HyperController
 */

package.controller('HyperController', [
  '$scope',
  '$routeParams',

  function HyperController($scope, $routeParams) {
    // keep track of current the subscriptions
    var subscriptions = {};

    $scope.$watch(function() {
      return $routeParams;
    }, function(newVal, oldVal) {

      // clean up the old parameters/values
      each(oldVal, function(key, value) {
        // the param hasn't changed since last time
        if ($routeParams[key] == value) return;

        // unsubscribe from the old url and clean up the scope
        if (subscriptions[key]) subscriptions[key]();
        delete $scope[key];
        delete subscriptions[key];
      });

      // add the new params
      each($routeParams, function(key, value) {
        // ignore slugs
        if (key === 'slug') return;

        // try decoding the parameter
        var href;
        try { href = utils.decode(value); } catch(e) {}

        // it didn't look like a valid url
        if (!href) return;

        // if it doesn't look like a url don't do anything with it
        if (href.indexOf('http') !== 0 && href.indexOf('/') !== 0) return;

        // don't allow CORS attacks
        if (isCrossDomain(href)) return;

        // subscribe to the href
        subscriptions[key] = request
          .get(href, function(err, body) {
            // TODO come up with an error strategy
            if (err) return console.error(err.stack || err);

            $safeApply.call($scope, function() {
              $scope[key] = merge($scope[key], body);
            });
          });
      });
    }, true);

    $scope.$on('$destroy', function() {
      each(subscriptions, function(key, off) {
        off();
      });
    });
  }
]);

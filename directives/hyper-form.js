/**
 * Module dependencies
 */

var package = require('../package');
var emitter = require('hyper-emitter');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var $safeApply = utils.$safeApply;
var each = require('each');
var createLink = require('./hyper-link').create;
var qs = require('querystring');

/**
 * hyperForm
 */

package.directive('hyperForm', [
  '$location',
  function($location) {
    return {
      scope: true,
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        // get a user-specified callback
        var cb = attrs.hyperHandle ? $scope.$eval(attrs.hyperHandle) : noop;

        $watchPath.call($scope, attrs.hyperForm, function(err, value) {
          // TODO come up with an error strategy
          if (err) return console.error(err.stack || err);

          if (!value || !value.action) return;

          // mark the element as loaded
          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');

          // TODO do we need to set these values? The only thing I can
          //      think of is rendering the site on the server..
          // Set the action and method for the form
          // elem.attr('method', value.method || 'GET');
          // elem.attr('action', value.action);

          // Expose the list of shown inputs to the view
          var inputs = $scope.inputs = [];
          var values = $scope.values = {};

          each(value.input, function(name, conf) {
            if (conf.type === 'hidden') return $scope.values[name] = typeof conf.value === 'undefined' ? conf : conf.value;
            // We have to clone this object so hyper-path doesn't watch for changes on the model
            inputs.push(merge({
              model: conf.value,
              name: name
            }, conf));
          });

          // TODO handle form validation

          // TODO fix this - it's ugly
          var form = elem[0];
          form.onsubmit = function() {
            $scope.submit();
          };

          function followLink() {
            var url = value.action + '?' + qs.stringify($scope.values);
            // TODO create a child scope
            var res = createLink(attrs.hyperAction, {query: {href: url}});
            if (!res.loaded) return;
            $safeApply.call($scope, function() {
              $location.path(res.href);
            });
          }

          $scope.submit = function() {
            $scope.hyperFormLoading = true;
            each(inputs, function(input) {
              if (typeof input.model === 'undefined') return;
              $scope.values[input.name] = input.model;
            });
            attrs.hyperAction && value.method === 'GET'
              ? followLink()
              : emitter.submit(value.method, value.action, $scope.values, onfinish);
          };
        });

        function onfinish(err, res) {
          $safeApply.call($scope, function() {
            delete $scope.hyperFormLoading;
            cb(err, res);
            if (err) $scope.hyperFormError = err;
            // TODO what are other status that we want to expose?
          });
        }
      }
    };
  }
]);

function noop() {}

function merge(a, b) {
  for (var k in b) {
    a[k] = b[k];
  }
  return a;
}

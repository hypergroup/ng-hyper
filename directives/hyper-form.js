/**
 * Module dependencies
 */

var package = require('../package');
var client = require('hyperagent');
var emitter = require('hyper-emitter');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var $safeApply = utils.$safeApply;
var each = require('each');

/**
 * hyperForm
 */

package.directive('hyperForm', [
  function() {
    return {
      scope: true,
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        // get a user-specified callback
        var cb = attrs.hyperHandle ? $scope.$eval(attrs.hyperHandle) : noop;

        $watchPath.call($scope, attrs.hyperForm, function(err, value) {
          // TODO come up with an error strategy
          if (err) return console.error(err);

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
          $scope.hyperInputs = {};
          $scope.hyperValues = {};

          each(value.input, function(name, conf) {
            if (conf.type !== 'hidden') return $scope.hyperInputs[name] = conf;
            $scope.hyperValues[name] = conf.value || conf;
          });

          // TODO handle form validation

          // TODO fix this - it's ugly
          var form = elem[0];
          form.onsubmit = function() {
            $scope.hyperFormLoading = true;
            emitter.submit(value.method, value.action, $scope.hyperValues, onfinish);
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

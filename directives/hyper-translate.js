/**
 * Module dependencies
 */

var package = require('../package');
var request = require('hyper-path');
var each = require('each');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var Polyglot = require('polyglot');

/**
 * hyper translate directive
 */

package.directive('hyperTranslate', [
  function() {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        var polyglot = new Polyglot();

        var transParts = attrs.hyperTranslate.split('<-');

        var name;
        $watchPath.call($scope, transParts[0].trim(), function(err, value, req) {
          // TODO come up with an error strategy
          if (err) return console.error(err.stack || err);

          if (!value) return;
          name = '$$' + req.target;
          var phrases = {};
          phrases[name] = value;

          polyglot.extend(phrases);
          translate();
        });

        if (!transParts[1]) return;
        each(transParts[1].split(','), function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.trim().split(' as ');
          var path = parts[0];
          var target = parts[1];

          $watchPath.call($scope, path, function(err, value, req) {
            // TODO come up with an error strategy
            if (err) return console.error(err.stack || err);

            var t = target || req.target;
            $scope[t] = value;

            translate();
          });
        });

        function translate() {
          if (!name) return;
          var res = polyglot.t(name, $scope);
          if (res === name) return elem.text('');
          elem.text(res);
        }
      }
    };
  }
]);

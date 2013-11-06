/**
 * Module dependencies
 */

var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;

/**
 * hyperInput
 */

package.directive('hyperInput', [
  function() {
    return {
      require: 'ngModel',
      link: function($scope, elem, attrs) {
        // disable hiding the element until loaded
        elem.addClass('ng-hyper-loading');

        $scope.$watch(attrs.hyperInput, function(conf) {
          if (!conf) return;

          // mark the element as loaded
          elem.removeClass('ng-hyper-loading');
          elem.addClass('ng-hyper-loaded');

          var name = attrs.name;
          elem.attr('value', conf.value);
          elem.attr('type', conf.type || 'text');
          elem.attr('placeholder', conf.prompt || conf.placeholder || name);
          if (conf.min) elem.attr('min', conf.min);
          if (conf.max) elem.attr('max', conf.max);
          if (conf.step) elem.attr('step', conf.step);
          if (conf.required) elem.attr('required', 'required');

          // TODO do validation
        });
      }
    };
  }
]);

/**
 * Module dependencies
 */

var templates = {
  input: require('../templates/input.html'),
  select: require('../templates/select.html'),
  textarea: require('../templates/textarea.html')
};
var package = require('../package');
var utils = require('../lib/utils');
var $watchPath = utils.$watchPath;
var loading = utils.loading;
var loaded = utils.loaded;

/**
 * hyperInput
 */

package.directive('hyperInput', [
  '$compile',
  function($compile) {
    return {
      replace: true,
      template: templates.input,
      scope: {
        input: '=hyperInput'
      },
      link: function($scope, elem, attrs) {
        loading(elem);

        var current = 'input';
        $scope.$watch('input.type', function(type) {
          if (!$scope.input) return loading(elem);
          if (type === 'select') return replace('select');
          if (type === 'textarea') return replace('textarea');
          return replace('input');
        });

        function replace(name) {
          if (name === current) return loaded(elem);
          current = name;
          var template = templates[name];
          var e = $compile(template)($scope);
          elem.replaceWith(e);
          loaded(e);
        }
      }
    };
  }
]);

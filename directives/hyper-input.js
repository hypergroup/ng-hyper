/**
 * Module dependencies
 */

var templates = {
  input: require('../templates/input.html'),
  select: require('../templates/select.html'),
  textarea: require('../templates/textarea.html')
};
var pkg = require('../package');

/**
 * hyperInput
 */

pkg.directive('hyperInput', [
  '$compile',
  'hyperStatus',
  function($compile, status) {
    // cache the compiled templates
    var compiled = {};
    function compile(name) {
      if (compiled[name]) return compiled[name];
      return compiled[name] = $compile(templates[name]);
    }

    return {
      priority: 1000,
      template: templates.input,
      replace: true,
      scope: {
        input: '=hyperInput'
      },
      link: function($scope, elem, attrs) {
        status.loading(elem);

        var current = 'input';
        $scope.$watch('input.type', function(type) {
          if (!type) return status.loading(elem);
          if (type === 'select') return replace('select');
          if (type === 'textarea') return replace('textarea');
          return replace('input');
        });

        function replace(name) {
          if (name === current) return status.loaded(elem);
          current = name;
          var template = compile(name);
          var e = template($scope);
          elem.replaceWith(e);
          elem = e; // this isn't good if others want to attach to the input item
          status.loaded(elem);
        }
      }
    };
  }
]);

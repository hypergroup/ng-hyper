describe('directives', function() {
  var $scope, html, $http, $location;

  describe('hyper', function() {
    it('should load a value into the scope', function() {
      var elem = html('<div hyper=".users.key"></div>');
      expect(elem).toBeLoaded();
      expect(elem.scope().key).toBe('value');
    });

    it('should load a renamed value into the scope', function() {
      var elem = html('<div hyper=".users.key as other"></div>');
      expect(elem).toBeLoaded();
      expect(elem.scope().other).toBe('value');
    });

    it('should not be able to traverse a non-existant link', function() {
      var elem = html('<div hyper=".i-dont-exist"></div>');
      expect(elem).not.toBeLoaded();
      expect(elem.scope()['i-dont-exist']).not.toBeDefined();
    });

    it('should traverse a deep path', function() {
      var elem = html('<div hyper=".users.friends.other.value"></div>');
      expect(elem).toBeLoaded();
      expect(elem.scope().value).toBe('test');
    });

    it('should traverse a nested set of elements', function() {
      var elem = html('<div hyper=".users"><div hyper="users.friends.thingy"></div></div>');
      expect(elem).toBeLoaded();
      var child = elem.find('div');
      expect(child).toBeLoaded();
      expect(child.scope().thingy).toBe('thing');
    });

    it('should not load a non-existant child', function() {
      var elem = html('<div hyper=".users"><div hyper="users.non-existant.value"></div></div>');
      expect(elem).toBeLoaded();
      var child = elem.find('div');
      expect(child).not.toBeLoaded();
      expect(child.scope().value).not.toBeDefined();
    });

    it('should be able to set multiple values', function() {
      var elem = html('<div hyper=".users.key, .users.friends.thingy"></div>');
      expect(elem).toBeLoaded();
      expect(elem.scope().key).toBe('value');
      expect(elem.scope().thingy).toBe('thing');
    });

    it('should be able to rename multiple values', function() {
      var elem = html('<div hyper=".users.key as other, .users.friends.thingy as foo"></div>');
      expect(elem).toBeLoaded();
      expect(elem.scope().key).not.toBeDefined();
      expect(elem.scope().other).toBe('value');
      expect(elem.scope().thingy).not.toBeDefined();
      expect(elem.scope().foo).toBe('thing');
    });

    it('should bind to a collection', function() {
      var elem = html('<div hyper=".items"><div ng-repeat="item in items" hyper="item.title"></div></div>');
      expect(elem).toBeLoaded();
      var children = elem.find('div');
      expect(children.length).toBe(5);
      var first = angular.element(children[0]);
      var second = angular.element(children[1]);
      expect(first.scope().title).toBe('Item 1');
      expect(second.scope().title).toBe('Item 2');
    });
  });

  describe('hyper-bind', function() {
    it('should bind a value to the content of an element', function() {
      var elem = html('<div hyper-bind=".users.key"></div>');
      expect(elem).toBeLoaded();
      expect(elem).toHaveText('value');
    });

    it('should not bind to a non-existant value', function() {
      var elem = html('<div hyper-bind=".users.non-existant"></div>');
      expect(elem).not.toBeLoaded();
      expect(elem).toHaveText('');
    });

    it('should bind the element text to "0"', function() {
      var elem = html('<div hyper-bind=".users.zero"></div>');
      expect(elem).toBeLoaded();
      expect(elem).toHaveText('0');
    });
  });

  describe('hyper-form', function() {

  });

  describe('hyper-img', function() {
    it('should bind the src property to an image src', function() {
      var elem = html('<img hyper-img=".users.image">');
      expect(elem).toBeLoaded();
      expect(elem.prop('src')).toBe('http://example.com/image.png');
    });

    it('should bind the alt property to an image title', function() {
      var elem = html('<img hyper-img=".users.image">');
      expect(elem).toBeLoaded();
      expect(elem.prop('alt')).toBe('My Cool Pic');
    });

    it('should create a srcset for a list of images', function() {
      var elem = html('<img hyper-img=".users.images">');
      expect(elem).toBeLoaded();
      expect(elem.prop('src')).toBe('http://example.com/image.png');
      expect(elem.prop('srcset')).toBe('http://example.com/image.png 1x, http://example.com/image-lrg.png 2x');
    });
  });

  describe('hyper-input', function() {
    it('should create a input element based on a config', function() {
      $scope.input = {
        type: 'text',
        placeholder: 'enter your name',
        name: 'name',
        $model: ''
      };
      var elem = unwrapElement(html('<input hyper-input="input" />'));

      expect(elem.prop('type')).toBe('text');
      expect(elem.prop('placeholder')).toBe('enter your name');
      expect(elem.prop('name')).toBe('name');

      // TODO figure out how to trigger a change event
      // make sure the $model changes
      setVal(elem, 'my input');
      $scope.$digest();
      // expect($scope.input.$model).toBe('my input');
    });

    it('should replace the input when the type changes', function() {
      $scope.input = {
        type: 'email',
        name: 'email',
        $model: ''
      };

      var parent = html('<input hyper-input="input" />')
      var elem = unwrapElement(parent);
      expect(elem).toBeType('input');
      expect(elem.length).toBe(1);

      $scope.input.type = 'textarea';
      $scope.$digest();
      elem = unwrapElement(parent);
      expect(elem).toBeType('textarea');
      expect(elem.length).toBe(1);

      $scope.input.type = 'select';
      $scope.input.options = [
         {value: 'thing@example.com'},
         {value: 'other@example.com'}
      ];
      $scope.$digest();
      elem = unwrapElement(parent);
      expect(elem).toBeType('select');
      expect(elem.length).toBe(1);
      expect(elem.children().length).toBe($scope.input.options.length + 1); // angular adds an empty option by default
    });
  });

  describe('hyper-link', function() {
    it('should create a link from a resource in the scope', function() {
      var elem = html('<div hyper=".users"><a hyper-link="/users/:users">Users</a></div>');
      expect(elem).toBeLoaded();
      var child = elem.children();
      expect(child).toBeLoaded();
      expect(child.prop('href')).toEndWith('/users/L2FwaS91c2Vycw');
    });

    it('should create a slug from a string value', function() {
      var elem = html('<div hyper=".users"><a hyper-link="/users/:users/:users.key">Users</a></div>');
      expect(elem).toBeLoaded();
      var child = elem.children();
      expect(child).toBeLoaded();
      expect(child.prop('href')).toEndWith('/users/L2FwaS91c2Vycw/value');
    });

    it('should traverse paths to encode a link', function() {
      var elem = html('<a hyper-link="/link/:.users.friends.other"></a>');
      expect(elem).toBeLoaded();
      expect(elem.prop('href')).toEndWith('/link/L2FwaS9vdGhlcg');
    });
  });

  describe('hyper-redirect', function() {
    it('should redirect to the link on load', function() {
      var elem = html('<div hyper-redirect="/users/:.users/:.users.key"></div>');
      expect($location.path()).toBe('/users/L2FwaS91c2Vycw/value');
    });

    it('should not redirect when the resource is not found', function() {
      var elem = html('<div hyper-redirect="/link/:.non-existant"></div>');
      expect($location.path()).toBe('');
    });
  });

  // Helpers
  beforeEach(module('ng-hyper'));

  beforeEach(function() {
    this.addMatchers({
      toHaveClass: function(c) {
        var not = this.isNot ? ' not' : '';
        this.message = function() {
          return 'Expected ' + this.actual +  not + ' to have class "' + c + '"';
        };

        return this.actual.hasClass(c);
      },
      toHaveText: function(text) {
        var not = this.isNot ? ' not' : '';
        var actual = this.actual.text();
        this.message = function() {
          return 'Expected ' + this.actual + not + ' to have text "' + text + '". Got "' + actual + '"';
        };

        return actual === text;
      },
      toBeLoaded: function() {
        var not = this.isNot ? ' not' : '';
        this.message = function() {
          return 'Expected ' + this.actual +  not + ' to be loaded';
        };

        return this.actual.hasClass('ng-hyper-loaded')
          && !this.actual.hasClass('ng-hyper-loading');
      },
      toEndWith: function(text) {
        var not = this.isNot ? ' not' : '';
        this.message = function() {
          return 'Expected ' + this.actual + not + ' to end with ' + text;
        }
        return this.actual.substr(-text.length) === text;
      },
      toBeType: function(type) {
        type = type.toUpperCase();
        var not = this.isNot ? ' not' : '';

        this.message = function() {
          return 'Expected ' + this.actual + not + ' to be of type ' + type.toLowerCase();
        }

        return this.actual[0].nodeName === type;
      }
    });
  });

  beforeEach(inject(function($injector) {
    $http = $injector.get('$httpBackend');
    $location = $injector.get('$location');

    $http
      .when('GET', '/api')
      .respond({
        href: '/api',
        users: {
          href: '/api/users'
        },
        items: {
          href: '/api/items'
        }
      });

    $http
      .when('GET', '/api/users')
      .respond({
        href: '/api/users',
        key: 'value',
        zero: 0,
        friends: {
          href: '/api/users/friends'
        },
        image: {
          src: 'http://example.com/image.png',
          title: 'My Cool Pic'
        },
        images: {
          src: [
            {src: 'http://example.com/image.png', size: '1x'},
            {src: 'http://example.com/image-lrg.png', size: '2x'}
          ]
        }
      });

    $http
      .when('GET', '/api/users/friends')
      .respond({
        href: '/api/users/friends',
        thingy: 'thing',
        other: {
          href: '/api/other'
        }
      });

    $http
      .when('GET', '/api/items')
      .respond({
        href: '/api/items',
        data: [
          {href: '/api/items/1'},
          {href: '/api/items/2'},
          {href: '/api/items/1'},
          {href: '/api/items/2'},
          {href: '/api/items/1'}
        ]
      });

    $http
      .when('GET', '/api/items/1')
      .respond({
        href: '/api/items/1',
        title: 'Item 1'
      });

    $http
      .when('GET', '/api/items/2')
      .respond({
        href: '/api/items/2',
        title: 'Item 2'
      });

    $http
      .when('GET', '/api/other')
      .respond({
        href: '/api/other',
        value: 'test'
      });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    $scope = $rootScope;

    html = function(tmpl) {
      var elem = angular.element(tmpl);
      $compile(elem)($scope);
      $scope.$digest();
      try {
        $http.flush();
      } catch (e) {}
      return elem;
    };
  }));

  // https://github.com/angular/angular.js/blob/master/test/ng/directive/formSpec.js
  function setVal(elem, val) {
    elem.val(val);
    elem.triggerHandler('change');
  }

  // We have a lame wrapper div for now...
  // Once I figure out how to replace an element while keeping it in sync
  // with ng-repeat this wrapper will go away
  function unwrapElement(wrapper) {
    return angular.element(wrapper.children()[0]);
  }
});

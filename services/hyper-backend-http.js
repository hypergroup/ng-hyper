/**
 * Module dependencies
 */

var pkg = require('../package');
var Emitter = require('emitter');
var parseLinks = require('links-parser');

// set the default api path to '/api'
var loc = window.location;
var base = loc.protocol + '//' + loc.host;
pkg.value('hyperHttpRoot', base + '/api');

// list of headers to check for refreshes
pkg.value('hyperHttpRefreshHeaders', [
  'location',
  'content-location'
]);

/**
 * Firefox is the worst
 */

var isFirefox = !!~window.navigator.userAgent.indexOf('Firefox');

/**
 * hyper backend http service
 */

pkg.factory('hyperBackend', [
  '$http',
  'hyperHttpRoot',
  'hyperHttpEmitter',
  'hyperHttpRefreshHeaders',
  '$cacheFactory',
  function($http, rootHref, emitter, refreshHeaders, $cache) {
    var cache = $cache('hyperHttpCache');

    return {
      root: root,
      get: get,
      submit: submit
    };

    function root(fn) {
      return get(rootHref, fn);
    }

    function get(href, fn) {
      // strip any hashes
      href = href.replace(/#.*/, '');

      return emitter(href, get(true));
      function get(recurse) {
        return function(body) {
          // The emitter just sent us a new response
          // We want everyone to have thier own copies as well
          if (body) return fn(null, angular.copy(body));

          $http
            .get(href, {cache: cache})
            .success(function(body, status, headers) {
              var links = {};
              try {
                links = parseLinks(headers('link'));
              } catch (e) {}

              if (recurse &&
                  typeof body.href === 'string' &&
                  href !== body.href) emitter(body.href, get());

              fn(null, body, links);
            })
            .error(function(err, status) {
              // Just return an empty body if it's not found
              if (status === 404) return fn();
              fn(err);
            });
        };
      }
    };

    function submit(method, action, data, fn, disableRefresh) {
      method = method.toUpperCase();
      var req = {method: method, url: action};

      if (method === 'GET') req.params = data;
      else req.data = data;

      $http(req)
        .success(function(body, status, headers) {
          var links = {};
          try {
            links = parseLinks(headers('link'));
          } catch (e) {}
          fn(null, body, links);

          if (method === 'GET') return;

          if (!disableRefresh) emitter.refresh(action, !isFirefox);
          angular.forEach(refreshHeaders, function(header) {
            var href = headers(header);
            if (href) emitter.refresh(href, !isFirefox);
          });

          // http://tools.ietf.org/html/draft-nottingham-linked-cache-inv-03#section-3
          var invalidates = links.invalidates;
          invalidates = typeof invalidates === 'string' ? [invalidates] : invalidates;
          angular.forEach(invalidates || [], function(href) {
            emitter.refresh(href, !isFirefox);
          });
        })
        .error(function(err) {
          fn(err);
        });
    };

    return root;
  }
]);

pkg.factory('hyperHttpEmitter', [
  '$http',
  '$cacheFactory',
  function($http, $cache) {
    var subs = new Emitter();
    var external = new Emitter();
    var cache;

    function emitter(href, get) {
      if (href.indexOf('/') === 0) href = base + href;
      // Proxy the fn so it can be used more than once
      function handle(err, body, links) { get(err, body, links); }

      subs.on(href, handle);
      get();

      if (subs.listeners(href).length === 1) external.emit('subscribe', href);

      return function() {
        subs.off(href, handle);
        if (!subs.hasListeners(href)) external.emit('unsubscribe', href);
      };
    };

    emitter.refresh = function (href, shouldNotify) {
      if (!cache) cache = $cache.get('hyperHttpCache');
      // bust the cache for everyone
      cache.remove(href);
      var req = {
        headers: {
          'cache-control': 'no-cache, must-revalidate',
          'pragma': 'no-cache',
          'expires': '-1',
          'if-modified-since': '-1'
        },
        cache: cache
      };

      $http.get(href, req)
        .success(function(body, status, headers) {
          if (shouldNotify) subs.emit(href, body);
          else emitter.refresh(href, true);
        })
        .error(function(err) {
          console.error(err.stack || err);
          // TODO send error to angular
        });
    };

    emitter.subscribe = function(fn) {
      external.on('subscribe', fn);
    };

    emitter.unsubscribe = function(fn) {
      external.on('unsubscribe', fn);
    };

    return emitter;
  }
]);

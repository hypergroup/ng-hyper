;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("CamShaft-require-component/index.js", function(exports, require, module){
/**
 * Require a module with a fallback
 */
module.exports = function(parent) {
  function require(name, fallback) {
    try {
      return parent(name);
    }
    catch (e) {
      try {
        return parent(fallback || name+"-component");
      }
      catch(e2) {
        throw e;
      }
    }
  };

  // Merge the old properties
  for (var key in parent) {
    require[key] = parent[key];
  }

  return require;
};

});
require.register("CamShaft-superagent-defaults/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

require = require('require-component')(require);

var request = require('superagent');
var Emitter = require('emitter');
var methods = require('methods', './methods');

/**
 * Expose `Context`.
 */

module.exports = Context;

/**
 * Initialize a new `Context`.
 *
 * @api public
 */

function Context() {
  if (!(this instanceof Context)) return new Context();
  this.headers = [];
  this.authCredentials = {};
}

/**
 * Inherit from `Emitter`
 */

Emitter(Context.prototype);

/**
 * Set default auth credentials
 *
 * @api public
 */

Context.prototype.auth = function (user, pass) {
  this.authCredentials.user = user;
  this.authCredentials.pass = pass;
};

/**
 * Add a default header to the context
 *
 * @api public
 */

Context.prototype.set = function() {
  this.headers.push(arguments);
  return this;
};

/**
 * Set the default headers on the req
 *
 * @api private
 */

Context.prototype.applyHeaders = function(req) {
  each(this.headers, function(header) {
    req.set.apply(req, header);
  });
};

// generate HTTP verb methods

each(methods, function(method){
  var name = 'delete' == method ? 'del' : method;

  method = method.toUpperCase();
  Context.prototype[name] = function(url, fn){
    var req = request(method, url);
    var auth = this.authCredentials;

    // Do the attaching here
    this.applyHeaders(req);

    // Call superagent's auth method
    if(auth.hasOwnProperty('user') && auth.hasOwnProperty('pass')) {
      req.auth(auth.user, auth.pass);
    }

    // Tell the listeners we've created a new request
    this.emit('request', req);

    fn && req.end(fn);
    return req;
  };
});

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} arr
 * @param {Function} fn
 * @api private
 */

function each(arr, fn) {
  for (var i = 0; i < arr.length; ++i) {
    fn(arr[i], i);
  }
}

});
require.register("CamShaft-superagent-defaults/methods.js", function(exports, require, module){
module.exports = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
  'trace',
  'patch'
];
});
require.register("CamShaft-console/index.js", function(exports, require, module){
/**
 * `console` fix for ie
 */

function noop () {}

module.exports = this.console || window.console || {
  log: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  assert: noop,
  dir: noop,
  dirxml: noop,
  trace: noop,
  group: noop,
  groupEnd: noop,
  time: noop,
  timeEnd: noop,
  profile: noop,
  profileEnd: noop,
  count: noop
};

});
require.register("timshadel-simple-debug/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var console = require('console');

exports = module.exports = debug;


/**
 * Expose log function. Default to `console.log`.
 */

exports.log = function(a, b, c, d, e, f, g, h, i, j, k, l) {
  console.log(a, b, c, d, e, f, g, h, i, j, k, l);
};


/**
 * Enabled debuggers.
 */

var names = []
  , skips = []
  , config;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;

  function logger(msg) {
    msg = (msg instanceof Error) ? (msg.stack || msg.message) : msg;
    Function.prototype.apply.call(logger.log, this, arguments);
  }

  logger.log = exports.log;
  logger.enabled = true;

  return logger;
}

exports.enable = function(name) {
  name = name.replace('*', '.*?');
  names.push(new RegExp('^' + name + '$'));
};

exports.enable.all = function() {
  exports.clear();
  exports.enable("*");
}

exports.disable = function(name) {
  name = name.replace('*', '.*?');
  skips.push(new RegExp('^' + name + '$'));
}

exports.disable.all = function() {
  exports.clear();
  exports.disable("*");
}

exports.clear = function() {
  skips = [];
  names = [];
}

exports.configure = function(val) {
  try {
    localStorage.debug = val;
  } catch(e){}

  config = val;
  exports.reset();
}

exports.reset = function() {
  exports.clear();

  config
    .split(/[\s,]+/)
    .forEach(function(name){
      if (name.length === 0 || name === '-') return;
      if (name[0] === '-') {
        exports.disable(name.substr(1));
      } else {
        exports.enable(name);
      }
    });
}

if (this.window) {
  if (!window.localStorage) return;
  exports.configure(localStorage.debug || '');
} else {
  exports.configure(process.env.DEBUG || '');
}

});
require.register("stacktracejs-stacktrace.js/stacktrace.js", function(exports, require, module){
// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)
/*global module, exports, define, ActiveXObject*/
(function(global, factory) {
    if (typeof exports === 'object') {
        // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.printStackTrace = factory();
    }
}(this, function() {
    /**
     * Main function giving a function stack trace with a forced or passed in Error
     *
     * @cfg {Error} e The error to create a stacktrace from (optional)
     * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
     * @return {Array} of Strings with functions, lines, files, and arguments where possible
     */
    function printStackTrace(options) {
        options = options || {guess: true};
        var ex = options.e || null, guess = !!options.guess;
        var p = new printStackTrace.implementation(), result = p.run(ex);
        return (guess) ? p.guessAnonymousFunctions(result) : result;
    }

    printStackTrace.implementation = function() {
    };

    printStackTrace.implementation.prototype = {
        /**
         * @param {Error} ex The error to create a stacktrace from (optional)
         * @param {String} mode Forced mode (optional, mostly for unit tests)
         */
        run: function(ex, mode) {
            ex = ex || this.createException();
            // examine exception properties w/o debugger
            //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
            mode = mode || this.mode(ex);
            if (mode === 'other') {
                return this.other(arguments.callee);
            } else {
                return this[mode](ex);
            }
        },

        createException: function() {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        },

        /**
         * Mode could differ for different exception, e.g.
         * exceptions in Chrome may or may not have arguments or stack.
         *
         * @return {String} mode of operation for the exception
         */
        mode: function(e) {
            if (e['arguments'] && e.stack) {
                return 'chrome';
            } else if (e.stack && e.sourceURL) {
                return 'safari';
            } else if (e.stack && e.number) {
                return 'ie';
            } else if (e.stack && e.fileName) {
                return 'firefox';
            } else if (e.message && e['opera#sourceloc']) {
                // e.message.indexOf("Backtrace:") > -1 -> opera9
                // 'opera#sourceloc' in e -> opera9, opera10a
                // !e.stacktrace -> opera9
                if (!e.stacktrace) {
                    return 'opera9'; // use e.message
                }
                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    // e.message may have more stack entries than e.stacktrace
                    return 'opera9'; // use e.message
                }
                return 'opera10a'; // use e.stacktrace
            } else if (e.message && e.stack && e.stacktrace) {
                // e.stacktrace && e.stack -> opera10b
                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
                }
                // e.stacktrace && e.stack -> opera11
                return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
            } else if (e.stack && !e.fileName) {
                // Chrome 27 does not have e.arguments as earlier versions,
                // but still does not have e.fileName as Firefox
                return 'chrome';
            }
            return 'other';
        },

        /**
         * Given a context, function name, and callback function, overwrite it so that it calls
         * printStackTrace() first with a callback and then runs the rest of the body.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to instrument
         * @param {Function} callback function to call with a stack trace on invocation
         */
        instrumentFunction: function(context, functionName, callback) {
            context = context || window;
            var original = context[functionName];
            context[functionName] = function instrumented() {
                callback.call(this, printStackTrace().slice(4));
                return context[functionName]._instrumented.apply(this, arguments);
            };
            context[functionName]._instrumented = original;
        },

        /**
         * Given a context and function name of a function that has been
         * instrumented, revert the function to it's original (non-instrumented)
         * state.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to de-instrument
         */
        deinstrumentFunction: function(context, functionName) {
            if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
                context[functionName] = context[functionName]._instrumented;
            }
        },

        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function(e) {
            return (e.stack + '\n')
                .replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
                .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
                .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
                .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
                .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(0, -1);
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function(e) {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function(e) {
            return e.stack
                .replace(/^\s*at\s+(.*)$/gm, '$1')
                .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
                .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(1);
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
                .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
                .split('\n');
        },

        opera11: function(e) {
            var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        opera10b: function(e) {
            // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
            // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
            // "@file://localhost/G:/js/test/functional/testcase1.html:15"
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1] ? (match[1] + '()') : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function(e) {
            // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Opera 7.x-9.2x only!
        opera9: function(e) {
            // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Safari 5-, IE 9-, and others
        other: function(curr) {
            var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
            while (curr && curr['arguments'] && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                args = Array.prototype.slice.call(curr['arguments'] || []);
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                curr = curr.caller;
            }
            return stack;
        },

        /**
         * Given arguments array as a String, substituting type names for non-string types.
         *
         * @param {Arguments,Array} args
         * @return {String} stringified arguments
         */
        stringifyArguments: function(args) {
            var result = [];
            var slice = Array.prototype.slice;
            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = 'undefined';
                } else if (arg === null) {
                    result[i] = 'null';
                } else if (arg.constructor) {
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = '#object';
                    } else if (arg.constructor === Function) {
                        result[i] = '#function';
                    } else if (arg.constructor === String) {
                        result[i] = '"' + arg + '"';
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    }
                }
            }
            return result.join(',');
        },

        sourceCache: {},

        /**
         * @return the text from a given URL
         */
        ajax: function(url) {
            var req = this.createXMLHTTPObject();
            if (req) {
                try {
                    req.open('GET', url, false);
                    //req.overrideMimeType('text/plain');
                    //req.overrideMimeType('text/javascript');
                    req.send(null);
                    //return req.status == 200 ? req.responseText : '';
                    return req.responseText;
                } catch (e) {
                }
            }
            return '';
        },

        /**
         * Try XHR methods in order and store XHR factory.
         *
         * @return <Function> XHR function or equivalent
         */
        createXMLHTTPObject: function() {
            var xmlhttp, XMLHttpFactories = [
                function() {
                    return new XMLHttpRequest();
                }, function() {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Msxml3.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ];
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                    // Use memoization to cache the factory
                    this.createXMLHTTPObject = XMLHttpFactories[i];
                    return xmlhttp;
                } catch (e) {
                }
            }
        },

        /**
         * Given a URL, check if it is in the same domain (so we can get the source
         * via Ajax).
         *
         * @param url <String> source url
         * @return <Boolean> False if we need a cross-domain request
         */
        isSameDomain: function(url) {
            return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
        },

        /**
         * Get source code from given URL if in the same domain.
         *
         * @param url <String> JS source URL
         * @return <Array> Array of source code lines
         */
        getSource: function(url) {
            // TODO reuse source from script tags?
            if (!(url in this.sourceCache)) {
                this.sourceCache[url] = this.ajax(url).split('\n');
            }
            return this.sourceCache[url];
        },

        guessAnonymousFunctions: function(stack) {
            for (var i = 0; i < stack.length; ++i) {
                var reStack = /\{anonymous\}\(.*\)@(.*)/,
                    reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                    frame = stack[i], ref = reStack.exec(frame);

                if (ref) {
                    var m = reRef.exec(ref[1]);
                    if (m) { // If falsey, we did not get any file/line information
                        var file = m[1], lineno = m[2], charno = m[3] || 0;
                        if (file && this.isSameDomain(file) && lineno) {
                            var functionName = this.guessAnonymousFunction(file, lineno, charno);
                            stack[i] = frame.replace('{anonymous}', functionName);
                        }
                    }
                }
            }
            return stack;
        },

        guessAnonymousFunction: function(url, lineNo, charNo) {
            var ret;
            try {
                ret = this.findFunctionName(this.getSource(url), lineNo);
            } catch (e) {
                ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
            }
            return ret;
        },

        findFunctionName: function(source, lineNo) {
            // FIXME findFunctionName fails for compressed source
            // (more than one function on the same line)
            // function {name}({args}) m[1]=name m[2]=args
            var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
            // {name} = function ({args}) TODO args capture
            // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
            var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
            // {name} = eval()
            var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
            // Walk backwards in the source lines until we find
            // the line which matches one of the patterns above
            var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
            for (var i = 0; i < maxLines; ++i) {
                // lineNo is 1-based, source[] is 0-based
                line = source[lineNo - i - 1];
                commentPos = line.indexOf('//');
                if (commentPos >= 0) {
                    line = line.substr(0, commentPos);
                }
                // TODO check other types of comments? Commented code may lead to false positive
                if (line) {
                    code = line + code;
                    m = reFunctionExpression.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                    m = reFunctionDeclaration.exec(code);
                    if (m && m[1]) {
                        //return m[1] + "(" + (m[2] || "") + ")";
                        return m[1];
                    }
                    m = reFunctionEvaluation.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
            return '(?)';
        }
    };

    return printStackTrace;
}));

});
require.register("CamShaft-envs/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

require = require('require-component')(require);

var debug = require('simple-debug')('envs')
  , stacktrace = require('stacktrace.js', 'stacktrace-js');

/**
 * Track the env var usages
 */

var usages = {};

/**
 * Save some global defaults
 */

var defaults = {};

/**
 * Require an environment variable and track its usage
 *
 *     envs('MY_VAR', 'this is a default');
 *
 * @param {String} name
 * @param {Any} defaultVal
 * @return {String}
 */

exports = module.exports = function env(name, defaultVal) {
  // Get the value
  var val = typeof process !== 'undefined'
    ? (process.env[name] || defaultVal || defaults[name] || defaultVal)
    : (defaults[name] || defaultVal);

  // Parse the stack
  var lineno = stacktrace()[4].trim();

  // Log it
  debug(lineno, name+'='+val);

  // Track the usages
  var envUsages = usages[name];

  // Create it if we don't have it already
  if(!envUsages) envUsages = usages[name] = [];

  // Check to see if we've already added this line number
  for (var i = envUsages.length - 1; i >= 0; i--) {
    if (envUsages[i].lineno === lineno) return val;
  };

  envUsages.push({lineno: lineno, defaultVal: defaultVal, val: val});

  return val;
};

/**
 * Require a integer
 *
 * @param {String}
 * @param {Number}
 * @return {Number}
 */

exports.int = function(name, defaultVal) {
  var val = exports(name, defaultVal);
  if (typeof val === 'number') return val;
  try {
    return parseInt(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * Require a float
 *
 * @param {String}
 * @param {Number}
 * @return {Number}
 */

exports.float = function(name, defaultVal) {
  var val = exports(name, defaultVal);
  if (typeof val === 'number') return val;
  try {
    return parseFloat(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * Set defaults in the environment
 *
 * @param {String|Object} name
 * @param {String} val
 * @api public
 */

exports.set = function(name, val) {
  if (isObject(name)) {
    for (var key in name) {
      defaults[key] = name[key];
    }
    return exports;
  }
  defaults[name] = val;
  return exports;
};

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Expose the usages
 */

exports.usages = usages;

});
require.register("CamShaft-hyperagent/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var superagent = require('superagent');
var Request = superagent.Request;
var Response = superagent.Response;
var defaults = require('superagent-defaults');
var envs = require('envs');

/**
 * Create the client
 */

var client = defaults();

/**
 * Make a call to the api root
 *
 * @return {Request}
 * @api public
 */

module.exports = exports = function() {
  return client.get(exports.API_URL);
};

/**
 * Inherit from the client
 */

for (var method in client) {
  if (typeof client[method] === 'function') exports[method] = client[method].bind(client);
}

/**
 * Expose the API_URL
 */

exports.API_URL = envs('API_URL', '/api');

/**
 * Profile the request
 */

client.on('request', function(req) {
  // If they didn't give us a profile function don't do anything
  if (!exports.profile) return;

  // Start profiling the request
  var done = exports.profile('hyperagent.response_time');

  req.on('response', function(res) {
    var info = {
      url: req.url,
      request_id: res.headers['x-request-id']
    };

    info['count#hyperagent.method.' + req.method] = 1;
    info['count#hyperagent.status.' + res.status] = 1;
    info['count#hyperagent.status-type.' + res.statusType] = 1;

    // Log the request
    done(info);
  });
});

// TODO come up with a retry strategy
// TODO set a reasonable timeout

/**
 * Force request to ignore the local cache
 *
 * @return {Request}
 * @api public
 */

Request.prototype.forceLoad =
Request.prototype.ignoreCache = function() {
  this.set('cache-control', 'no-cache');
  return this;
};

/**
 * Patch the Request to emit errors when it's not 2xx
 *
 * @api public
 */

var end = Request.prototype.end;

Request.prototype.end = function(fn) {
  var self = this;
  end.call(this, function(res) {
    self.emit('response', res);
    if (!res.ok) return self.emit('error', res.body || new Error(res.text));
    fn(res);
  });
};

/**
 * Follow a link
 *
 * @return {Request}
 * @api public
 */

Response.prototype.follow = function(rel) {
  // TODO make sure the rel exists; if not emit an error

  var href = typeof this.body[rel] === 'object'
    ? this.body[rel].href
    : this.body[rel];

  return client.get(href);
};

/**
 * Submit a form
 *
 * @return {Request}
 * @api public
 */

Response.prototype.submit = function(rel) {
  // TODO make sure the rel exists; if not emit an error

  var form = this.body[rel];

  // TODO implement

  return client.post(form.action);
};

});
require.register("CamShaft-hyper-emitter/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var client = require('hyperagent');
var Emitter = require('emitter');
var each = require('each');

/**
 * Setup a singleton emitter
 */

var emitter = new Emitter();

/**
 * Mixin exports with an Emitter
 */

Emitter(exports);

/**
 * Get a resource and get called any time it changes
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Function}
 */

exports.get = function(url, fn) {
  // Proxy the fn so it can be used more than once
  function handle(err, body) { fn(err, body); }

  emitter.on(url, handle);
  exports.refresh(url, true);

  if (emitter.listeners(url).length === 1) exports.emit('subscribe', url);

  // Return a function to unsubscribe
  return function unsubscribe() {
    emitter.off(url, handle);
    if (!emitter.hasListeners(url)) exports.emit('unsubscribe', url);
  };
};

/**
 * Submit a form and update any subscribers
 *
 * @param {String} method
 * @param {String} action
 * @param {Object} data
 * @param {Function} fn
 */

exports.submit = function(method, action, data, fn) {
  var lowerMethod = (method || 'GET').toLowerCase();
  if (lowerMethod === 'delete') lowerMethod = 'del';

  var req = client[lowerMethod](action);

  if (lowerMethod === 'get') req.query(data);
  else if (data) req.send(data);

  req
    .on('error', fn)
    .end(function(res) {
      fn(null, res.body);

      if (lowerMethod === 'get') return;

      // Hard refresh any resources that may have been affected
      exports.refresh(action);
      each(exports.refreshHeaders, function(header) {
        var value = res.headers[header];
        if (value && value !== action) exports.refresh(value);
      });

      // TODO look for http://tools.ietf.org/html/draft-nottingham-linked-cache-inv-04
    });
};

/**
 * Use a plugin
 *
 * @param {Function} fn
 */

exports.use = function(fn) {
  fn(exports);
  return exports;
};

/**
 * Save any urls that are in flight
 */

var inflights = {};

/**
 * Refresh a url and notify the subscribers
 *
 * @param {String} url
 * @param {Boolean} useCache
 */

exports.refresh = function(url, useCache) {
  // If someone is already making a request wait for theirs
  if (inflights[url]) return;

  inflights[url] = true;

  var req = client.get(url);

  if (!useCache) req.ignoreCache();

  function handle(err, body, res) {
    delete inflights[url];
    emitter.emit(url, err, body);
  }

  req
    .on('error', handle)
    .end(function(res) {
      handle(null, res.body, res);
    });
};

/**
 * Expose the list of headers to refresh
 */

exports.refreshHeaders = [
  'location',
  'content-location'
];

});
require.register("component-to-function/index.js", function(exports, require, module){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');
var type;

try {
  type = require('type-component');
} catch (e) {
  type = require('type');
}

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  fn = toFunction(fn);
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}

});
require.register("CamShaft-hyper-path/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var each = require('each');

/**
 * Watch the path
 */

module.exports = Request;

function Request(str, client) {
  if (!(this instanceof Request)) return new Request(str, client);

  // init client
  if (client) this.client = client;
  else this.client = defaultClient();

  this.parse(str);

  this._listeners = {};
  this._scope = {};
}

Request.prototype.scope = function(scope) {
  this._scope = scope;
  if (this._fn) this.refresh();
  return this;
};

Request.prototype.on = function(fn) {
  this._fn = fn;
  this.refresh();
  return this;
};

Request.prototype.refresh = function() {
  var self = this;
  var scope = self._scope;
  var fn = self._fn;

  // Clear any previous listeners
  this.off();

  if (!self.isRoot) return self.traverse(scope, 0, fn);

  self.client(function(err, body) {
    if (err) return fn(err);
    self.traverse(body || scope, 1, fn);
  });
};

/**
 * Parse the string with the following syntax
 *
 *     path.to.my.name
 *
 *     .path.to.my.name
 *
 * @param {String} str
 * @api private
 */

Request.prototype.parse = function(str) {
  var path = this.path = str.split('.');
  this.index = path[0];
  this.isRoot = this.index === '';
  this.target = path[path.length - 1];
};

/**
 * Off
 *
 * unsubscribe from any emitters for a request
 */

Request.prototype.off = function() {
  each(this._listeners, function(href, listener) {
    listener();
  });
};

/**
 * Traverse properties in the api
 *
 * @param {Any} parent
 * @param {Integer} i
 * @param {Function} cb
 * @api private
 */

Request.prototype.traverse = function(parent, i, cb) {
  var request = this;

  // We're done searching
  if (i === request.path.length) return cb(null, parent);

  var key = request.path[i];
  var value = parent[key];

  // We couldn't find the property
  if (typeof value === 'undefined') return cb(null);

  // It's local
  if (!value.href || value[request.path[i + 1]]) return request.traverse(value, i + 1, cb);

  // We're just getting the link
  if (request.path[i + 1] === 'href') return cb(null, value);

  // It's a link
  var href = value.href;

  // Unsubscribe and resubscribe if it was previously requested
  if (request._listeners[href]) request._listeners[href]();

  request._listeners[href] = request.client.get(href, function(err, body) {
    if (err) return cb(err);
    if (!body) return cb(null);

    var next = request.path[i + 1];

    // Return the resource without getting the key inside of the body
    if (next === '') return cb(null, body);

    // It's the same name as what the link was
    if (body[key] && !body[next]) return request.traverse(body[key], i + 1, cb);
    // It's a collection
    if (body.data && !body[next]) {
      var data = body.data;
      data.href = body.href;
      return request.traverse(data, i + 1, cb);
    }

    // We're looking for another property
    request.traverse(body, i + 1, cb);
  });
}

/**
 * Deprecated client
 */

var agent = require('hyperagent');
var emitter = require('hyper-emitter');

function defaultClient() {
  console.warn('DEPRECATED', 'future implementations of hyper-path will not provide a client. Please see docs for details.', (new Error).stack);

  function c(fn) {
    return agent()
      .on('error', fn)
      .end(function(res) {
        fn(null, res.body);
      });
  }

  c.get = emitter.get.bind(emitter);

  return c;
}

});
require.register("yields-slug/index.js", function(exports, require, module){

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * options:
 *
 *    - `.replace` characters to replace, defaulted to `/[^a-z0-9]/g`
 *    - `.separator` separator to insert, defaulted to `-`
 *
 * @param {String} str
 * @param {Object} opts
 * @return {String}
 */

module.exports = function(str, opts){
  opts = opts || {};
  return str.toLowerCase()
    .replace(opts.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, opts.separator || '-')
};

});
require.register("component-map/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Map the given `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = [];
  fn = toFunction(fn);
  for (var i = 0; i < arr.length; ++i) {
    ret.push(fn(arr[i], i));
  }
  return ret;
};
});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

});
require.register("component-type/index.js", function(exports, require, module){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'NaN';
  if (val && val.nodeType === 1) return 'element';

  return typeof val.valueOf();
};

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("ForbesLindesay-utf8-encode/index.js", function(exports, require, module){
module.exports = encode;

function encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}
});
require.register("ForbesLindesay-base64-encode/index.js", function(exports, require, module){
var utf8Encode = require('utf8-encode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = encode;
function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

    }

    return output;
}
});
require.register("ForbesLindesay-utf8-decode/index.js", function(exports, require, module){
module.exports = decode;

function decode(utftext) {
    var string = "";
    var i = 0;
    var c, c1, c2, c3;
    c = c1 = c2 = 0;

    while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}
});
require.register("ForbesLindesay-base64-decode/index.js", function(exports, require, module){
var utf8Decode = require('utf8-decode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = decode;
function decode(input) {
    var output = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {

        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = utf8Decode(output);

    return output;

}
});
require.register("component-pad/index.js", function(exports, require, module){

/**
 * Expose `pad()`.
 */

exports = module.exports = pad;

/**
 * Pad `str` to `len` with optional `c` char,
 * favoring the left when unbalanced.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

function pad(str, len, c) {
  c = c || ' ';
  if (str.length >= len) return str;
  len = len - str.length;
  var left = Array(Math.ceil(len / 2) + 1).join(c);
  var right = Array(Math.floor(len / 2) + 1).join(c);
  return left + str + right;
}

/**
 * Pad `str` left to `len` with optional `c` char.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

exports.left = function(str, len, c){
  c = c || ' ';
  if (str.length >= len) return str;
  return Array(len - str.length + 1).join(c) + str;
};

/**
 * Pad `str` right to `len` with optional `c` char.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

exports.right = function(str, len, c){
  c = c || ' ';
  if (str.length >= len) return str;
  return str + Array(len - str.length + 1).join(c);
};
});
require.register("CamShaft-websafe-base64/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var base64decode = require('base64-decode');
var base64encode = require('base64-encode');
var pad = require('pad');

/**
 * url-safe encode a string
 *
 * @param {String} string
 * @return {String}
 * @api public
 */

exports.encode = function(string) {
  return string
    ? base64encode(string)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    : '';
};

/**
 * url-safe decode a string
 *
 * @param {String} string
 * @return {String}
 * @api public
 */

exports.decode = function(string) {
  return string
    ? base64decode(padString(string)
      .replace(/\-/, '+')
      .replace(/_/, '/'))
      .replace(/\0/g, '')
    : '';
};

/**
 * Pad a string to the nearest 4
 *
 * @param {String} string
 * @return {String}
 * @api private
 */

function padString(string) {
  var mod = string.length % 4;

  // We don't require any padding
  if(!mod) return string;

  // See how much padding we need
  var rem = 4-mod;

  return pad(string, rem, '=');
};

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("ng-hyper/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

exports = module.exports = require('./package');

/**
 * Expose the controller
 */

exports.controller = require('./controllers/hyper');

/**
 * Expose the directives
 */

exports.hyper = require('./directives/hyper');
exports.hyperBind = require('./directives/hyper-bind');
exports.hyperForm = require('./directives/hyper-form');
exports.hyperImg = require('./directives/hyper-img');
exports.hyperInput = require('./directives/hyper-input');
exports.hyperLink = require('./directives/hyper-link');
exports.hyperRedirect = require('./directives/hyper-redirect');

/**
 * Expose the services
 */

exports.hyperService = require('./services/hyper');
exports.hyperPathService = require('./services/hyper-path');
exports.hyperStatusService = require('./services/hyper-status');
exports.hyperLinkService = require('./services/hyper-link');
exports.hyperLinkFormatterService = require('./services/hyper-link-formatter');
exports.hyperBackendHTTPService = require('./services/hyper-backend-http');

/**
 * Tell other modules how to load us
 */

exports.name = 'ng-hyper';

});
require.register("ng-hyper/package.js", function(exports, require, module){
/**
 * Module dependencies
 */

var angular = window.angular || require('angular');

/**
 * Expose the package
 */

module.exports = angular.module('ng-hyper', []);

});
require.register("ng-hyper/controllers/hyper.js", function(exports, require, module){
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
  'hyperBackend',
  'hyperLinkFormatter',
  function HyperController($scope, $routeParams, hyper, hyperLinkFormatter) {
    // keep track of current the subscriptions
    var subscriptions = {};

    $scope.$watch(function() {
      return $routeParams;
    }, function(newVal, oldVal) {

      // clean up the old parameters/values
      each(oldVal, function(value, key) {
        // the param hasn't changed since last time
        if ($routeParams[key] == value) return;

        // unsubscribe from the old url and clean up the scope
        if (subscriptions[key]) subscriptions[key]();
        delete $scope[key];
        delete subscriptions[key];
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
        if (isCrossDomain(href)) return;

        // subscribe to the href
        subscriptions[key] = hyper
          .get(href, function(err, body) {
            // TODO handle error with angular
            if (err) return console.error(err.stack || err);

            $safeApply.call($scope, function() {
              $scope[key] = merge($scope[key], body);
            });
          });
      });
    }, true);

    $scope.$on('$destroy', function() {
      each(subscriptions, function(off) {
        off();
      });
    });
  }
]);

});
require.register("ng-hyper/directives/hyper-bind.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyperBind
 */

pkg.directive('hyperBind', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperBind, $scope, function(value, req) {
          // expose value to the scope
          $scope[req.target] = value;

          // set the element contents
          elem.text(format(value));

          if (status.isLoaded(value)) return status.loaded(elem);
          return status.loading(elem);
        });
      }
    };

    function format(value, def) {
      if (status.isLoaded(value)) return value;
      if (typeof def === 'undefined') return '';
      return def;
    };
  }
]);

});
require.register("ng-hyper/directives/hyper-form.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var utils = require('../lib/utils');
var $safeApply = utils.$safeApply;
var merge = utils.merge;
var shallowMerge = utils.shallowMerge;
var each = angular.forEach;
var qs = require('querystring');

/**
 * hyperForm
 */

pkg.directive('hyperForm', [
  '$location',
  'hyper',
  'hyperLink',
  'hyperStatus',
  function($location, hyper, hyperLink, status) {
    return {
      scope: true,
      require: 'form',
      link: function($scope, elem, attrs, form) {
        status.loading(elem);

        var handle = getHandleFunction($scope, attrs);

        elem.bind('submit', function() {
          if ($scope.submit) $scope.submit();
        });

        hyper.get(attrs.hyperForm, $scope, function(value) {
          if (value && value.action) return setup(value);
          return teardown(value);
        });

        function setup(config) {
          if (!canUpdate()) return;

          // TODO fix the unwatch the second time it loads
          // unwatch($scope.inputs);
          $scope.values = {};
          $scope.inputs = getInputs(config.input, $scope);

          $scope.set = initSet($scope.inputs);
          $scope.submit = initSubmit(config.method, config.action);
          $scope.reset = initReset();

          return status.loaded(elem);
        }

        function teardown() {
          unwatch($scope.inputs);
          delete $scope.values;
          delete $scope.inputs;

          delete $scope.set;
          delete $scope.submit;
          delete $scope.reset;

          return status.loading(elem);
        }

        function getInputs(inputs, $scope) {
          var ins = [];
          var old = $scope.inputs;
          var i = 0;

          var setValue = initSetValue(inputs);

          each(inputs, function(conf, name) {
            var value = conf.value;

            if (conf.type === 'hidden') return setValue(name, value);

            // We have to clone this object so hyper-path doesn't watch for changes on the model
            var input = shallowMerge({
              $model: value,
              $orig: value, // TODO do we need to clone this so it doesn't change on us?
              name: name
            }, conf);

            // Allow addressing the input from either the index or the name
            ins[i++] = input;
            ins[name] = input;

            input.$unwatch = $scope.$watch(function () {
              return input.$model;
            }, function() {
              setValue(name, input.$model);
            });
          });

          if (i === 0) return [];

          return merge(old, ins);
        }

        function initSetValue (inputs) {
          return function setValue(name, value) {
            $scope.values[name] = value;
            if (inputs[name].$orig !== value) form.$setDirty();
          };
        }

        function canUpdate() {
          // TODO allow dirty updating config via attr
          return !form.$dirty;
        }

        function initSet(inputs) {
          return function set(name, value) {
            if (inputs[name]) inputs[name].$model = value;
          };
        }

        function initSubmit(method, action) {
          method = (method || 'GET').toUpperCase();
          return function submit() {
            // TODO if the method is idempotent and the form is pristine don't submit
            // TODO verify the form is valid
            $scope.hyperFormLoading = true;
            attrs.hyperAction && method === 'GET'
              ? followLink(action, $scope.values, attrs.hyperAction)
              : hyper.submit(method, action, $scope.values, onfinish);
          };
        }

        function initReset() {
          return function reset() {
            // TODO
          };
        }

        function onfinish(err, res) {
          $safeApply.call($scope, function() {
            delete $scope.hyperFormLoading;
            handle(err, res);
            if (err) $scope.hyperFormError = err.error;
            // TODO what are other status that we want to expose?
            $setPristine(form, elem);
          });
        }

        function followLink(action, values, hyperAction) {
          // TODO check if action has a '?'
          var url = action + '?' + qs.stringify(values);
          var $tmp = $scope.$new();
          $tmp.query = {href: url};
          var res = hyperLink(hyperAction, $tmp);
          $tmp.$destroy();
          if (!res.loaded) return;
          $safeApply.call($scope, function() {
            $location.path(res.href);
          });
        }
      }
    };
  }
]);

function $setPristine(form, elem) {
  if (form.$setPristine) return form.$setPristine();
  form.$pristine = true;
  form.$dirty = false;
  elem.addClass('ng-pristine');
  elem.removeClass('ng-dirty');
  each(form, function(input, key) {
    if (!input || key.charAt(0) === '$') return;
    if (input.$pristine) input.$pristine = true;
    if (input.$dirty) input.$dirty = false;
  });
}

function getHandleFunction($scope, attrs) {
  return attrs.hyperHandle
    ? $scope.$eval(attrs.hyperHandle)
    : angular.noop;
}

function unwatch(inputs) {
  if (!inputs) return;
  each(inputs, function(input) {
    input.$unwatch();
  });
}

});
require.register("ng-hyper/directives/hyper-img.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var map = require('map');

/**
 * hyperImg
 */

pkg.directive('hyperImg', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperImg, $scope, function(value) {
          var isLoaded = status.isLoaded(value);

          var src = isLoaded
            ? (value.src || value.href || value)
            : '';
          var title = isLoaded
            ? (value.title || value.alt || '')
            : '';

          if (angular.isArray(src)) {
            var srcset = map(src, function(img) {
              return img.src + ' ' + (img.size || '');
            }).join(', ');
            elem.prop('srcset', srcset);
            src = src[0].src;
          }

          elem.prop('src', src);
          elem.prop('alt', title);

          if (isLoaded) return status.loaded(elem);
          return status.loading(elem);
        });
      }
    };
  }
]);

});
require.register("ng-hyper/directives/hyper-input.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var templates = {
  input: require('../templates/input.html'),
  select: require('../templates/select.html'),
  textarea: require('../templates/textarea.html')
};

/**
 * hyperInput
 */

pkg.directive('hyperInput', [
  '$compile',
  'hyperStatus',
  function($compile, status) {
    return {
      replace: true,
      template: templates.input,
      scope: true,
      link: function($scope, elem, attrs) {
        if (attrs.ngRepeat) throw new Error('hyper-input is incompatible with ng-repeat. Please wrap the input in a repeater element');

        status.loading(elem);

        $scope.$watch(attrs.hyperInput, function(value) {
          $scope.hyperInput = value;
        });

        var current = 'input';
        $scope.$watch('hyperInput.type', function(type) {
          if (!type) return;
          if (type === 'select') return replace(type);
          if (type === 'textarea') return replace(type);
          replace('input');
        });

        function replace(name) {
          if (name === current) return status.loaded(elem);
          current = name;
          var template = templates[name];
          var e = $compile(template)($scope);
          elem.replaceWith(e);
          status.loaded(e);
        }
      }
    };
  }
]);

});
require.register("ng-hyper/directives/hyper-link.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * Initialize our regular expression for url construction/deconstruction
 */

var regexp = /:([\w-\.]+)/g;

/**
 * Register it with angular
 */

pkg.directive('hyperLink', [
  '$location',
  'hyperLink',
  'hyperStatus',
  function($location, hyperLink, status) {
    return {
      link: function($scope, elem, attrs) {
        status.loading(elem);

        var href = attrs.hyperLink;

        // watch the location and add an active class
        $scope.$on('$locationChangeSuccess', updateActive);

        hyperLink.watch(href, $scope, function(formatted) {
          href = formatted;
          elem.attr('href', formatted);
          status.loaded(elem);
          updateActive();
        });

        var isActive = false;
        function updateActive() {
          if (href === ($location.url() || '/')) return setActive();
          if (isActive) return setInactive();
        }

        function setActive() {
          elem.addClass('active');
          isActive = true;
        }

        function setInactive() {
          elem.removeClass('active');
          isActive = false;
        }
      }
    };
  }
]);

});
require.register("ng-hyper/directives/hyper-redirect.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * Register it with angular
 */

pkg.directive('hyperRedirect', [
  '$location',
  'hyperLink',
  'hyperStatus',
  function($location, hyperLink, status) {
    return {
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyperLink.watch(attrs.hyperRedirect, $scope, function(href) {
          $location.path(href);
        });
      }
    };
  }
]);

});
require.register("ng-hyper/directives/hyper.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var merge = require('../lib/utils').merge;

/**
 * hyper scope directive
 *
 * The 'hyper' directive is an attribute that exposes a path property
 * of a 'hyper' api in the scope of the client. For example, if we know
 * we need the data at `.account.name` it would traverse our api and expose
 * `name` into our $scope.
 *
 * You may also specify a binding name: `.account.name as firstName` and the
 * value of `.account.name` will be assigned to `$scope.firstName`.
 */

pkg.directive('hyper', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        var exprs = attrs.hyper.split(',');

        angular.forEach(exprs, function(expr) {
          // split the command to allow binding to arbitrary names
          var parts = expr.trim().split(' as ');
          var path = parts[0];
          var target = parts[1];

          hyper.get(path, $scope, function(value, req) {
            var t = target || req.target;
            $scope[t] = merge($scope[t], value);

            if (status.isLoaded(value)) return status.loaded(elem);
            return status.loading(elem);
          });
        });
      }
    };
  }
]);

});
require.register("ng-hyper/services/hyper.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var $safeApply = require('../lib/utils').$safeApply;

/**
 * hyper service
 */

pkg.factory('hyper', [
  'hyperBackend',
  'hyperPath',
  function(backend, request) {
    function get(path, $scope, fn) {
      var req = request(path, backend);

      // we're not starting at the root of the api so we need to watch
      // the first property in the path, or `req.index`, as the root
      if (!req.isRoot) $scope.$watch(req.index, function(parent) {
        req._root = req.root || {};
        req._root[req.index] = parent;
        req.scope(req._root);
      }, true);

      // listen to any updates from the api
      req.on(function(err, value) {
        // TODO emit errors to angular here
        if (err) return console.error(err.stack || err);
        $safeApply.call($scope, function() {
          fn(value, req);
        });
      });

      return req;
    }

    function submit(method, action, data, fn) {
      backend.submit(method, action, data, fn);
    }

    return {
      get: get,
      submit: submit
    };
  }
]);

});
require.register("ng-hyper/services/hyper-path.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var request = require('hyper-path');

/**
 * hyper path service
 */

pkg.factory('hyperPath', [
  function() {
    return request;
  }
]);

});
require.register("ng-hyper/services/hyper-link.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var each = angular.forEach;
var map = require('map');

/**
 * setup the link regexp
 */

pkg.value('hyperLinkRegexp', /:([\w-\.]+)/g);

/**
 * hyper link service
 */

pkg.factory('hyperLink', [
  'hyper',
  'hyperLinkFormatter',
  'hyperLinkRegexp',
  function(hyper, formatter, regexp) {
    function create(href, values) {
      var res = {loaded: true};
      res.href = href.replace(regexp, function(full, path) {
        if (values[path] || values[path] === 0) return formatter.encode(values[path]);
        res.loaded = false;
        return '-';
      });
      return res;
    }

    create.watch = function(href, $scope, fn) {
      var paths = create.parse(href);
      if (!paths) return fn(href);

      var values = {};
      each(paths, function(path) {
        hyper.get(path, $scope, function(value) {
          values[path] = value;
          update(values);
        });
      });

      function update(values) {
        var res = create(href, values);
        if (res.loaded) fn(res.href);
      }
    };

    create.parse = function(link) {
      var matches = link.match(regexp);
      if (!matches) return;
      return map(matches, function(path) {
        return path.substr(1); // take off the ':'
      });
    };

    return create;
  }
]);

});
require.register("ng-hyper/services/hyper-link-formatter.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var websafe = require('websafe-base64');
var slug = require('slug');

/**
 * hyper link formatter service
 */

pkg.factory('hyperLinkFormatter', [
  function() {
    function encode(value) {
      if (value && value.href) return websafe.encode(value.href);
      if (angular.isString(value)) return slug(value);
      if (angular.isNumber(value)) return '' + value;
      return '-';
    }

    function decode(str) {
      try {
        return websafe.decode(str);
      } catch (e) {}
    }

    return {
      encode: encode,
      decode: decode
    };
  }
]);

});
require.register("ng-hyper/services/hyper-status.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');

/**
 * hyper status service
 */

pkg.factory('hyperStatus', [
  function() {
    return {
      loading: function(elem) {
        elem.removeClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loading');
      },
      loaded: function(elem) {
        elem.removeClass('ng-hyper-loading');
        elem.addClass('ng-hyper-loaded');
      },
      isLoaded: function(value) {
        return !!(value === 0 || value === false || value);
      }
    };
  }
]);

});
require.register("ng-hyper/services/hyper-backend-http.js", function(exports, require, module){
/**
 * Module dependencies
 */

var pkg = require('../package');
var Emitter = require('emitter');

// set the default api path to '/api'
pkg.value('hyperHttpRoot', '/api');

// list of headers to check for refreshes
pkg.value('hyperHttpRefreshHeaders', [
  'location',
  'content-location'
]);

pkg.factory('hyperHttpEmitter', [
  '$http',
  function($http) {
    var subs = new Emitter();
    var external = new Emitter();

    function emitter(href, get) {
      // Proxy the fn so it can be used more than once
      function handle(err, body) { get(err, body); }

      subs.on(href, handle);
      get();

      if (subs.listeners(href).length === 1) external.emit('subscribe', href);

      return function() {
        subs.off(href, handle);
        if (!subs.hasListeners(href)) external.emit('unsubscribe', href);
      };
    };

    emitter.refresh = function (href) {
      // bust the cache for everyone
      var req = {
        headers: {
          'cache-control': 'no-cache'
        },
        cache: false
      };

      $http.get(href, req)
        .success(function(body) {
          subs.emit(href, body);
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

/**
 * hyper backend http service
 */

pkg.factory('hyperBackend', [
  '$http',
  'hyperHttpRoot',
  'hyperHttpEmitter',
  'hyperHttpRefreshHeaders',
  function($http, rootHref, emitter, refreshHeaders) {
    function root(fn) {
      return root.get(rootHref, fn);
    }

    root.get = function(href, fn) {
      return emitter(href, function get(body) {
        // The emitter just sent us a new response
        // We want everyone to have thier own copies as well
        if (body) return fn(null, angular.copy(body));

        $http
          .get(href, {cache: true})
          .success(function(body) {
            fn(null, body);
          })
          .error(function(err, status) {
            // Just return an empty body if it's not found
            if (status === 404) return fn();
            fn(err);
          });
      });
    };

    root.submit = function(method, action, data, fn) {
      var method = method.toUpperCase();
      var req = {method: method, url: action};

      if (method === 'GET') req.params = data;
      else req.data = data;

      $http(req)
        .success(function(body, status, headers) {
          fn(null, body);

          if (method === 'GET') return;

          emitter.refresh(action);
          angular.forEach(refreshHeaders, function(header) {
            var href = headers[header];
            if (href) emitter.refresh(href);
          });
        })
        .error(function(err) {
          fn(err);
        });
    };

    return root;
  }
]);

});
require.register("ng-hyper/lib/utils.js", function(exports, require, module){
/**
 * Module dependencies
 */

var type = require('type');

/**
 * Safely call apply
 *
 * @param {Function} fn
 * @api private
 */

exports.$safeApply = $safeApply;
function $safeApply(fn) {
  var phase = this.$root.$$phase;
  if (phase === '$apply' || phase === '$digest') return fn();
  this.$apply(fn);
}

/**
 * Expose merge
 */

exports.merge = merge;

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

function merge (a, b) {
  var t = type(b);
  // set simple types
  if (t !== 'object' && t !== 'array') return b;

  // if they're different types just return b
  if (type(a) !== t) return b;

  // make the arrays the same length
  if (t === 'array') a.splice(b.length);

  // remove any old properties
  // TODO is there a way to improve the O(2N)?
  if (t === 'object') {
    for (var key in a) {
      // don't delete angular properties
      if (key.charAt && key.charAt(0) === '$') continue;
      if (!b[key]) delete a[key];
    }
  }

  for (var key in b) {
    a[key] = merge(a[key], b[key]);
  }
  return a;
}

exports.shallowMerge = shallowMerge;
function shallowMerge(a, b) {
  for (var k in b) {
    a[k] = b[k];
  }
  return a;
}

});






























require.register("ng-hyper/templates/input.html", function(exports, require, module){
module.exports = '<input data-ng-model="hyperInput.$model" name="{{hyperInput.name}}" type="{{hyperInput.type}}" placeholder="{{hyperInput.prompt || hyperInput.placeholder || hyperInput.title || hyperInput.name}}" data-ng-required="hyperInput.required" />\n';
});
require.register("ng-hyper/templates/select.html", function(exports, require, module){
module.exports = '<select data-ng-model="hyperInput.$model" name="{{hyperInput.name}}" data-ng-required="hyperInput.required" data-hyper="hyperInput.options" data-ng-options="option.value as (option.name || option.text) for option in options"></select>\n';
});
require.register("ng-hyper/templates/textarea.html", function(exports, require, module){
module.exports = '<textarea data-ng-model="hyperInput.$model" name="{{hyperInput.name}}" placeholder="{{hyperInput.prompt || hyperInput.placeholder || hyperInput.title || hyperInput.name}}" data-ng-required="hyperInput.required"></textarea>\n';
});
require.alias("CamShaft-hyper-path/index.js", "ng-hyper/deps/hyper-path/index.js");
require.alias("CamShaft-hyper-path/index.js", "ng-hyper/deps/hyper-path/index.js");
require.alias("CamShaft-hyper-path/index.js", "hyper-path/index.js");
require.alias("CamShaft-hyperagent/index.js", "CamShaft-hyper-path/deps/hyperagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-hyperagent/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-hyperagent/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("CamShaft-superagent-defaults/index.js", "CamShaft-hyperagent/deps/superagent-defaults/index.js");
require.alias("CamShaft-superagent-defaults/methods.js", "CamShaft-hyperagent/deps/superagent-defaults/methods.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-superagent-defaults/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-superagent-defaults/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-emitter/index.js", "CamShaft-superagent-defaults/deps/emitter/index.js");

require.alias("CamShaft-require-component/index.js", "CamShaft-superagent-defaults/deps/require-component/index.js");

require.alias("CamShaft-envs/index.js", "CamShaft-hyperagent/deps/envs/index.js");
require.alias("timshadel-simple-debug/index.js", "CamShaft-envs/deps/simple-debug/index.js");
require.alias("CamShaft-console/index.js", "timshadel-simple-debug/deps/console/index.js");

require.alias("stacktracejs-stacktrace.js/stacktrace.js", "CamShaft-envs/deps/stacktrace.js/stacktrace.js");
require.alias("stacktracejs-stacktrace.js/stacktrace.js", "CamShaft-envs/deps/stacktrace.js/index.js");
require.alias("stacktracejs-stacktrace.js/stacktrace.js", "stacktracejs-stacktrace.js/index.js");
require.alias("CamShaft-require-component/index.js", "CamShaft-envs/deps/require-component/index.js");

require.alias("CamShaft-hyper-emitter/index.js", "CamShaft-hyper-path/deps/hyper-emitter/index.js");
require.alias("CamShaft-hyper-emitter/index.js", "CamShaft-hyper-path/deps/hyper-emitter/index.js");
require.alias("CamShaft-hyperagent/index.js", "CamShaft-hyper-emitter/deps/hyperagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-hyperagent/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-hyperagent/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("CamShaft-superagent-defaults/index.js", "CamShaft-hyperagent/deps/superagent-defaults/index.js");
require.alias("CamShaft-superagent-defaults/methods.js", "CamShaft-hyperagent/deps/superagent-defaults/methods.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-superagent-defaults/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "CamShaft-superagent-defaults/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-emitter/index.js", "CamShaft-superagent-defaults/deps/emitter/index.js");

require.alias("CamShaft-require-component/index.js", "CamShaft-superagent-defaults/deps/require-component/index.js");

require.alias("CamShaft-envs/index.js", "CamShaft-hyperagent/deps/envs/index.js");
require.alias("timshadel-simple-debug/index.js", "CamShaft-envs/deps/simple-debug/index.js");
require.alias("CamShaft-console/index.js", "timshadel-simple-debug/deps/console/index.js");

require.alias("stacktracejs-stacktrace.js/stacktrace.js", "CamShaft-envs/deps/stacktrace.js/stacktrace.js");
require.alias("stacktracejs-stacktrace.js/stacktrace.js", "CamShaft-envs/deps/stacktrace.js/index.js");
require.alias("stacktracejs-stacktrace.js/stacktrace.js", "stacktracejs-stacktrace.js/index.js");
require.alias("CamShaft-require-component/index.js", "CamShaft-envs/deps/require-component/index.js");

require.alias("component-each/index.js", "CamShaft-hyper-emitter/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "CamShaft-hyper-emitter/deps/emitter/index.js");

require.alias("CamShaft-hyper-emitter/index.js", "CamShaft-hyper-emitter/index.js");
require.alias("component-each/index.js", "CamShaft-hyper-path/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("CamShaft-hyper-path/index.js", "CamShaft-hyper-path/index.js");
require.alias("yields-slug/index.js", "ng-hyper/deps/slug/index.js");
require.alias("yields-slug/index.js", "slug/index.js");

require.alias("component-map/index.js", "ng-hyper/deps/map/index.js");
require.alias("component-map/index.js", "map/index.js");
require.alias("component-to-function/index.js", "component-map/deps/to-function/index.js");

require.alias("component-url/index.js", "ng-hyper/deps/url/index.js");
require.alias("component-url/index.js", "url/index.js");

require.alias("component-type/index.js", "ng-hyper/deps/type/index.js");
require.alias("component-type/index.js", "type/index.js");

require.alias("component-querystring/index.js", "ng-hyper/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("CamShaft-websafe-base64/index.js", "ng-hyper/deps/websafe-base64/index.js");
require.alias("CamShaft-websafe-base64/index.js", "ng-hyper/deps/websafe-base64/index.js");
require.alias("CamShaft-websafe-base64/index.js", "websafe-base64/index.js");
require.alias("ForbesLindesay-base64-encode/index.js", "CamShaft-websafe-base64/deps/base64-encode/index.js");
require.alias("ForbesLindesay-utf8-encode/index.js", "ForbesLindesay-base64-encode/deps/utf8-encode/index.js");

require.alias("ForbesLindesay-base64-decode/index.js", "CamShaft-websafe-base64/deps/base64-decode/index.js");
require.alias("ForbesLindesay-utf8-decode/index.js", "ForbesLindesay-base64-decode/deps/utf8-decode/index.js");

require.alias("component-pad/index.js", "CamShaft-websafe-base64/deps/pad/index.js");

require.alias("CamShaft-websafe-base64/index.js", "CamShaft-websafe-base64/index.js");
require.alias("component-emitter/index.js", "ng-hyper/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("ng-hyper/index.js", "ng-hyper/index.js");if (typeof exports == "object") {
  module.exports = require("ng-hyper");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("ng-hyper"); });
} else {
  this["ng-hyper"] = require("ng-hyper");
}})();
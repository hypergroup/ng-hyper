
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("forbeslindesay~utf8-encode@1.0.0", function (exports, module) {
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

require.register("forbeslindesay~base64-encode@2.0.2", function (exports, module) {
var utf8Encode = require("forbeslindesay~utf8-encode@1.0.0");
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

require.register("forbeslindesay~utf8-decode@1.0.1", function (exports, module) {
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

require.register("forbeslindesay~base64-decode@1.0.2", function (exports, module) {
var utf8Decode = require("forbeslindesay~utf8-decode@1.0.1");
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

require.register("component~pad@master", function (exports, module) {

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

require.register("camshaft~websafe-base64@master", function (exports, module) {
/**
 * Module dependencies
 */

var base64decode = require("forbeslindesay~base64-decode@1.0.2");
var base64encode = require("forbeslindesay~base64-encode@2.0.2");
var pad = require("component~pad@master");

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

require.register("component~emitter@1.1.3", function (exports, module) {

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

require.register("component~props@1.1.2", function (exports, module) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});

require.register("component~to-function@2.0.5", function (exports, module) {

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require("component~props@1.1.2");
} catch(e) {
  expr = require("component~props@1.1.2");
}

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
  };
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
  };
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

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

});

require.register("component~map@0.0.1", function (exports, module) {

/**
 * Module dependencies.
 */

var toFunction = require("component~to-function@2.0.5");

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

require.register("component~trim@0.0.1", function (exports, module) {

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

require.register("component~type@1.0.0", function (exports, module) {

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
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});

require.register("component~querystring@1.3.1", function (exports, module) {

/**
 * Module dependencies.
 */

var encode = encodeURIComponent;
var decode = decodeURIComponent;
var trim = require("component~trim@0.0.1");
var type = require("component~type@1.0.0");

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
    var key = decode(parts[0]);
    var m;

    if (m = /(\w+)\[(\d+)\]/.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
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
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

});

require.register("component~url@0.2.0", function (exports, module) {

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
  var location = exports.parse(window.location.href);
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

require.register("hypergroup~hyper-path@1.0.9", function (exports, module) {
function noop() {}

/**
 * Expose the Request object
 */

module.exports = Request;

/**
 * Create a hyper-path request
 *
 * @param {String} path
 * @param {Client} client
 */

function Request(path, client, delim) {
  if (!(this instanceof Request)) return new Request(path, client);

  // init client
  this.client = client;
  if (!this.client) throw new Error('hyper-path requires a client to be passed as the second argument');

  this.delim = delim || '.';
  this.parse(path);

  this._listeners = {};
  this._scope = {};
  this._warnings = {};
}

/**
 * Set the root scope
 *
 * @param {Object} scope
 * @return {Request}
 */

Request.prototype.scope = function(scope) {
  this.trace('scope', arguments);
  this._scope = this.wrappedScope ? [scope] : scope;
  if (this._fn) this.get();
  return this;
};

/**
 * Call a function anytime the data changes in the request
 *
 * @param {Function} fn
 * @return {Request}
 */

Request.prototype.on = function(fn) {
  this.trace('on', arguments);
  this._fn = fn;
  this.get();
  return this;
};

/**
 * Refresh the data down the path
 *
 * @return {Request}
 */

Request.prototype.get =
Request.prototype.refresh = function(fn) {
  this.trace('get', arguments);
  var scope = this._scope;
  fn = fn || this._fn;

  // Clear any previous listeners
  this.off();

  return this.isRoot ?
    this.fetchRoot(scope, fn) :
    this.traverse(scope, {}, 0, this.path, {}, true, fn);
};

/**
 * Issue a warning once per request
 *
 * @param {String} str
 */

Request.prototype.warn = function(str) {
  if (this._warnings[str]) return;
  console.warn(str);
  this._warnings[str] = true;
  return this;
};

/**
 * Trace a request
 *
 * @param {String} method
 * @param {Array} args
 */

Request.prototype.trace = function(method, args) {};

/**
 * Parse the string with the following syntax
 *
 *   Start at this.scope['path']
 *
 *     path.to.my.name
 *
 *   Start at the client's root
 *
 *     .path.to.my.name
 *
 * @param {String} str
 * @api private
 */

Request.prototype.parse = function(str) {
  this.trace('parse', arguments);
  var path = this.path = Array.isArray(str) ? str.slice() : str.split(this.delim);
  this.index = path[0];
  if (path.length === 1) {
    this.wrappedScope = true;
    path.unshift(0);
  }
  this.isRoot = this.index === '';
  this.target = path[path.length - 1];
};

/**
 * unsubscribe from any emitters for a request
 *
 * @return {Request}
 */

Request.prototype.off = function() {
  this.trace('trace');

  for (var key in this._listeners) {
    this.replaceListener(key, null, this._fn);
  }

  return this;
};

/**
 * Traverse properties in the api
 *
 * @param {Any} parent
 * @param {Object} links
 * @param {Integer} i
 * @param {Array} path
 * @param {Object} parentDocument
 * @param {Boolean} normalize
 * @param {Function} cb
 * @api private
 */

Request.prototype.traverse = function(parent, links, i, path, parentDocument, normalize, cb) {
  var self = this;
  self.trace('traverse', arguments);

  // we're done searching
  if (i >= path.length) return cb(null, normalize ? self._normalizeTarget(parent) : parent, parentDocument);

  var key = path[i];
  var value = self._get(key, parent, links);

  // we couldn't find the property
  if (!isDefined(value)) return self.handleUndefined(key, parent, links, i, path, parentDocument, normalize, cb);

  var next = i + 1;
  var nextProp = path[next];
  var href = self._get('href', value);

  // we don't have a link to use or it's set locally on the object
  if (!href || value.hasOwnProperty(nextProp)) return self.traverse(value, links, next, path, parentDocument, normalize, cb);

  // fetch the resource
  return self.fetchResource(href, next, path, normalize, cb);
};

/**
 * Handle an undefined value
 *
 * @param {String} key
 * @param {Object|Array} parent
 * @param {Object} links
 * @param {Integer} i
 * @param {Array} path
 * @param {Object} parentDocument
 * @param {Boolean} normalize
 * @param {Function} cb
 */

Request.prototype.handleUndefined = function(key, parent, links, i, path, parentDocument, normalize, cb) {
  this.trace('handleUndefined', arguments);
  // check to make sure it's not on a "normalized" target
  var coll = this._normalizeTarget(parent);
  if (this._get(key, coll)) return this.traverse(coll, links, i, path, parentDocument, normalize, cb);

  // We have a single hop path so we're going to try going up the prototype.
  // This is necessary for frameworks like Angular where they use prototypal
  // inheritance. The risk is getting a value that is on the root Object.
  // We can at least check that we don't return a function though.
  var value = parent && parent[key];
  if (typeof value === 'function') value = void 0;
  return cb(null, value, parentDocument);
};

/**
 * Fetch the root resource through the client
 *
 * @param {Object} scope
 * @param {Function} cb
 */

Request.prototype.fetchRoot = function(scope, cb) {
  var self = this;
  self.trace('fetchRoot', arguments);

  var res = self.client.root(function handleRoot(err, body, links, href) {
    if (err) return cb(err);
    if (!body && !links) return cb(null);
    links = links || {};

    var bodyHref = self._get('href', body);
    href = href || bodyHref;

    if (!href) self.warn('root missing href: local JSON pointers will not function properly');
    else body = self._resolve(bodyHref, body);

    return self.traverse(body || scope, links, 1, self.path, body, true, cb);
  });

  return self.replaceListener('.', res, cb);
};

/**
 * Fetch a resource through the client
 *
 * @param {String} href
 * @param {Integer} i
 * @param {Array} path
 * @param {Boolean} normalize
 * @param {Function} cb
 */

Request.prototype.fetchResource = function(href, i, path, normalize, cb) {
  var self = this;
  self.trace('fetchResource', arguments);
  var orig = href;
  var parts = orig.split('#');
  href = parts[0];

  if (href === '') return cb(new Error('cannot request "' + orig + '" without parent document'));

  var res = self.client.get(href, function handleResource(err, body, links, hrefOverride) {
    if (err) return cb(err);
    if (!body && !links) return cb(null);
    links = links || {};

    // allow clients to override the href (usually because of a redirect)
    href = hrefOverride || href;

    // Be nice to APIs that don't set 'href'
    var bodyHref = self._get('href', body);
    if (!bodyHref) body = self._set('href', href, body);
    var resolved = self._resolve(bodyHref || href, body);

    if (parts.length === 1) return self.traverse(resolved, links, i, path, resolved, normalize, cb);
    return self.fetchJsonPath(resolved, links, parts[1], i, path, normalize, cb);
  });

  return self.replaceListener(orig, res, cb);
};

/**
 * Replace the listener for a key
 *
 * @param {String} key
 * @param {Any} res
 * @param {Function} cb
 * @return {Any}
 */

Request.prototype.replaceListener = function(key, res, cb) {
  this.trace('replaceListener', arguments);
  if (this._fn !== cb) return res;
  (this._listeners[key] || noop)();
  if (!res) delete this._listeners[key];
  else this._listeners[key] = typeof res === 'function' ? res : noop;
  return res;
};

/**
 * Traverse a JSON path
 *
 * @param {Object} parentDocument
 * @param {Object} links
 * @param {String} href
 * @param {Integer} i
 * @param {Array} path
 * @param {Boolean} normalize
 * @param {Function} cb
 */

Request.prototype.fetchJsonPath = function(parentDocument, links, href, i, path, normalize, cb) {
  var self = this;
  self.trace('fetchJsonPath', arguments);
  var pointer = href.split('/');
  var resolvedHref = parentDocument.href + '#' + href;

  if (pointer[0] === '') pointer.shift();

  return self.traverse(parentDocument, links, 0, pointer, parentDocument, false, function handleJsonPath(err, val) {
    if (err) return cb(err);
    if (!self._get('href', val)) val = self._set('href', resolvedHref, val);
    return self.traverse(val, links, i, path, parentDocument, normalize, cb);
  });
};

/**
 * Resolve any local JSON pointers
 *
 * @param {String} root
 * @param {Any} body
 * @return {Any}
 */

Request.prototype._resolve = function(root, body, type) {
  this.trace('_resolve', arguments);
  if (!body || (type || typeof body) !== 'object') return body;
  var obj = Array.isArray(body) ? [] : {};
  var value, childType;
  for (var key in body) {
    if (!body.hasOwnProperty(key)) continue;
    value = body[key];

    childType = typeof value;
    if (key === 'href' && childType === 'string' && value.charAt(0) === '#') {
      obj.href = root + value;
    } else {
      obj[key] = this._resolve(root, value, childType);
    }
  }
  return obj;
};

/**
 * Get a value given a key/object
 *
 * @api private
 */

Request.prototype._get = function(key, parent, fallback) {
  this.trace('_get', arguments);
  if (!parent) return undefined;
  if (parent.hasOwnProperty(key)) return parent[key];
  if (typeof parent.get === 'function') return parent.get(key);
  if (fallback && fallback.hasOwnProperty(key)) return {href: fallback[key]};
  return void 0;
}

/**
 * Set a value on an object
 *
 * @api private
 */

Request.prototype._set = function(key, value, obj) {
  this.trace('_set', arguments);
  if (!obj || typeof obj !== 'object') return obj;
  if (typeof obj.set === 'function') return obj.set(key, value);
  obj[key] = value;
  return obj;
}

/**
 * If the final object is an collection, pass that back
 *
 * @api private
 */

Request.prototype._normalizeTarget = function(target) {
  this.trace('_normalizeTarget', arguments);
  if (typeof target !== 'object' || !target) return target;
  var href = this._get('href', target);
  target = this._get('collection', target) || this._get('data', target) || target;
  return href ? this._set('href', href, target) : target;
}

/**
 * Check if a value is defined
 *
 * @api private
 */

function isDefined(value) {
  return typeof value !== 'undefined' && value !== null;
}

});

require.register("yields~slug@1.1.0", function (exports, module) {

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * @param {String} str
 * @param {Object} options
 * @config {String|RegExp} [replace] characters to replace, defaulted to `/[^a-z0-9]/g`
 * @config {String} [separator] separator to insert, defaulted to `-`
 * @return {String}
 */

module.exports = function (str, options) {
  options || (options = {});
  return str.toLowerCase()
    .replace(options.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, options.separator || '-')
};

});

require.register("component~reduce@1.0.1", function (exports, module) {

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

require.register("camshaft~links-parser@0.1.0", function (exports, module) {
/**
 * Module dependencies
 */

var reduce = require("component~reduce@1.0.1");

/**
 * Parse the 'links' header
 *
 * @param {String} links
 * @param {Boolean} returnConfig
 * @return {Object}
 */

module.exports = function(links, returnConfig) {
  return reduce(links.split(/ *, */), function(obj, str) {
    var parts = str.split(/ *; */);
    var uri = parts[0].slice(1, -1);
    var conf = parseParams(parts.slice(1), {uri: uri});
    var rel = conf.rel;
    if (!rel) return obj;

    var value = returnConfig ? conf : uri;

    return reduce(rel.split(/ +/), function(acc, subrel) {
      if (subrel === '') return acc;
      switch(typeof acc[subrel]) {
        case 'undefined':
          acc[subrel] = value;
          break;
        case 'string':
          acc[subrel] = [acc[subrel], value];
          break;
        default:
          acc[subrel].push(value);
      }
      return acc;
    }, obj);
  }, {});
}

/**
 * Parse key=value parameters
 * @param {Object} params
 * @param {Object} init
 * @return {Object}
 */

function parseParams(params, init) {
  return reduce(params, function(obj, param) {
    var parts = param.split(/ *= */);
    var key = removeQuote(parts[0]);
    obj[key] = removeQuote(parts[1]);
    return obj;
  }, init);
}

/**
 * Remove quotes around a string
 *
 * @param {String} str
 * @return {String}
 */

function removeQuote(str) {
  return str
    .replace(/^"/, '')
    .replace(/"$/, '');
}

});

require.register("ng-hyper", function (exports, module) {
/**
 * Module dependencies
 */

exports = module.exports = require("ng-hyper/package.js");

/**
 * Expose the controller
 */

exports.controller = require("ng-hyper/controllers/hyper.js");

/**
 * Expose the directives
 */

exports.hyper = require("ng-hyper/directives/hyper.js");
exports.hyperBind = require("ng-hyper/directives/hyper-bind.js");
exports.hyperForm = require("ng-hyper/directives/hyper-form.js");
exports.hyperImg = require("ng-hyper/directives/hyper-img.js");
exports.hyperImgBackground = require("ng-hyper/directives/hyper-img-background.js");
exports.hyperInput = require("ng-hyper/directives/hyper-input.js");
exports.hyperInputOptions = require("ng-hyper/directives/hyper-input-options.js");
exports.hyperLink = require("ng-hyper/directives/hyper-link.js");
exports.hyperRedirect = require("ng-hyper/directives/hyper-redirect.js");

/**
 * Expose the services
 */

exports.hyperService = require("ng-hyper/services/hyper.js");
exports.hyperPathService = require("ng-hyper/services/hyper-path.js");
exports.hyperStatusService = require("ng-hyper/services/hyper-status.js");
exports.hyperLinkService = require("ng-hyper/services/hyper-link.js");
exports.hyperLinkFormatterService = require("ng-hyper/services/hyper-link-formatter.js");
exports.hyperBackendHTTPService = require("ng-hyper/services/hyper-backend-http.js");

/**
 * Tell other modules how to load us
 */

exports.name = 'ng-hyper';

});

require.register("ng-hyper/package.js", function (exports, module) {
/**
 * Module dependencies
 */

var angular = window.angular || require("angular");

/**
 * Expose the package
 */

module.exports = angular.module('ng-hyper', []);

});

require.register("ng-hyper/controllers/hyper.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var each = angular.forEach;
var utils = require("ng-hyper/lib/utils.js");
var $safeApply = utils.$safeApply;
var merge = utils.merge;
var isCrossDomain = require("component~url@0.2.0").isCrossDomain;

/**
 * HyperController
 */

pkg.controller('HyperController', [
  '$scope',
  '$routeParams',
  'hyper',
  'hyperLinkFormatter',
  function HyperController($scope, $routeParams, hyper, hyperLinkFormatter) {
    // keep track of current the subscriptions
    var scopes = {};

    $scope.$watch(function() {
      return $routeParams;
    }, function(newVal, oldVal) {

      // clean up the old parameters/values
      each(oldVal, function(value, key) {
        // the param hasn't changed since last time
        if ($routeParams[key] == value) return;

        // unsubscribe from the old url and clean up the scope
        if (scopes[key]) scopes[key].$destroy();
        delete $scope[key];
        delete scopes[key];
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
        // if (isCrossDomain(href)) return;

        var requestScope = scopes[key] = $scope.$new(true);
        requestScope.value = {href: href};
        hyper.get('value', requestScope, function(body, req) {
          $scope[key] = merge($scope[key], body);
        });
      });
    }, true);
  }
]);

});

require.register("ng-hyper/directives/hyper-bind.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");

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
          return status.undef(elem);
        });
      }
    };

    function format(value) {
      if (typeof value === 'undefined') return '';
      return value;
    };
  }
]);

});

require.register("ng-hyper/directives/hyper-form.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var utils = require("ng-hyper/lib/utils.js");
var $safeApply = utils.$safeApply;
var merge = utils.merge;
var shallowMerge = utils.shallowMerge;
var each = angular.forEach;
var qs = require("component~querystring@1.3.1");

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

        var handle;
        $scope.$watch(attrs.hyperHandle, function(val) {
          handle = val || angular.noop;
        });

        elem.bind('submit', function() {
          if ($scope.submit) $scope.submit();
        });

        hyper.get(attrs.hyperForm, $scope, function(value) {
          if (value && value.action) return setup(value);
          return teardown(value);
        });

        function setup(config) {
          //if (!canUpdate()) return;

          // TODO fix the unwatch the second time it loads
          // unwatch($scope.inputs);
          $scope.values = {};
          $scope.inputs = getInputs(config.input, $scope);

          $scope.set = initSet($scope.inputs);
          $scope.submit = initSubmit(config.method, config.action);
          $scope.reset = initReset($scope.inputs);

          return status.loaded(elem);
        }

        function teardown() {
          unwatch($scope.inputs);
          delete $scope.values;
          delete $scope.inputs;

          delete $scope.set;
          delete $scope.submit;
          delete $scope.reset;

          return status.undef(elem);
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

            // don't submit if form is in progress
            if ($scope.hyperFormLoading || form.$invalid) return;

            $scope.hyperFormLoading = true;
            elem.addClass('ng-hyper-form-loading');
            attrs.hyperAction && method === 'GET'
              ? followLink(action, $scope.values, attrs.hyperAction)
              : hyper.submit(method, action, $scope.values, onfinish, !!attrs.hyperDisableRefresh);
          };
        }

        function initReset(inputs) {
          return function reset() {
            each(inputs, function(input) {
              input.$model = '';
            });
          };
        }

        function onfinish(err, res) {
          $safeApply.call($scope, function() {
            delete $scope.hyperFormLoading;
            $scope.hyperFormResponse = res;
            elem.removeClass('ng-hyper-form-loading');
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

require.register("ng-hyper/directives/hyper-img.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var map = require("component~map@0.0.1");

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
          return status.undef(elem);
        });
      }
    };
  }
]);

});

require.register("ng-hyper/directives/hyper-img-background.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var map = require("component~map@0.0.1");

/**
 * hyperImgBackground
 */

pkg.directive('hyperImgBackground', [
  'hyper',
  'hyperStatus',
  function(hyper, status) {
    return {
      scope: true,
      restrict: 'A',
      link: function($scope, elem, attrs) {
        status.loading(elem);

        hyper.get(attrs.hyperImgBackground, $scope, function(value) {
          var isLoaded = status.isLoaded(value);

          var src = isLoaded
            ? (value.src || value.href || value)
            : '';
          var title = isLoaded
            ? (value.title || value.alt || '')
            : '';

          if (src) elem.css('background-image', 'url(' + src + ')');
          else elem.css('background-image', null);

          if (isLoaded) return status.loaded(elem);
          return status.undef(elem);
        });
      }
    };
  }
]);

});

require.register("ng-hyper/directives/hyper-input.js", function (exports, module) {
/**
 * Module dependencies
 */

var inputs = require("ng-hyper/templates/inputs.html");
var pkg = require("ng-hyper/package.js");

/**
 * hyperInput
 */

pkg.directive('hyperInput', [
  'hyper',
  function(hyper) {
    return {
      template: inputs,
      replace: true,
      scope: {
        input: '=hyperInput'
      },
      compile: function compile(tElement, tAttrs) {
        var inputClass = tAttrs['class'];
        tElement.removeClass(tAttrs['class']);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
            scope.inputClass = inputClass;
          },
          post: function postLink($scope, el, attrs) {
            function watch(path, fn) {
              hyper.get('input.' + path, $scope, function(val) {
                $scope[path] = val;
                fn && fn(val);
              });
            }
            watch('placeholder');
            watch('prompt');
          }
        };
      }
    };
  }
]);

});

require.register("ng-hyper/directives/hyper-input-options.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");

/**
 * hyperInput
 */

pkg.directive('hyperInputOptions', [
  'hyper',
  function(hyper) {
    return {
      link: function ($scope, el, attrs) {
        hyper.get(attrs.hyperInputOptions, $scope, function(options) {
          $scope.options = options = options || [];
          angular.forEach(options, function(opt) {
            if (!opt) return;

            function set(key) {
              hyper.get(key, opt, function(val) {
                opt[key] = val;
                try {
                  $scope.$digest();
                } catch (e) {}
              });
            }

            set('text');
            set('value');
          });
        });
      }
    };
  }
]);

});

require.register("ng-hyper/directives/hyper-link.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");

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
        var isActive = false;

        // watch the location and add an active class
        $scope.$on('$locationChangeSuccess', updateActive);

        hyperLink.watch(href, $scope, function(formatted) {
          href = formatted;
          elem.attr('href', formatted);
          status.loaded(elem);
          updateActive();
        });

        function updateActive() {
          if (isActive) return setInactive();
          var location = $location.url() || '/';
          if (href === location || '/' + href === location) return setActive();
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

require.register("ng-hyper/directives/hyper-redirect.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");

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
          if (attrs.replace !== 'false') $location.replace();
          $location.path(href);
        });
      }
    };
  }
]);

});

require.register("ng-hyper/directives/hyper.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var merge = require("ng-hyper/lib/utils.js").merge;

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

        var exprs = attrs.hyper.trim().split(/ *, */);

        var exprVals = [];
        angular.forEach(exprs, function(expr, i) {
          // split the command to allow binding to arbitrary names
          var parts = expr.split(/ +as +/);
          var paths = parts[0].split(/ +or +/);
          var target = parts[1];

          var responses = [];
          angular.forEach(paths, function(path, j) {
            hyper.get(path, $scope, function(value, req) {
              responses[j] = {target: target || req.target, value: value};
              update();
            });
          });

          function update() {
            var res = select(responses);
            var t = res ? res.target : target;
            var value = exprVals[i] = res ? res.value : undefined;
            $scope[t] = merge($scope[t], value);
            updateStatus();
          }
        });

        function updateStatus() {
          for (var k = 0, l = exprVals.length; k < l; k++) {
            if (!status.isLoaded(exprVals[k])) return status.undef(elem);
          }
          status.loaded(elem);
        }
      }
    };
  }
]);

/**
 * Iterate through the available responses and pick first first defined response
 *
 * @param {Array} responses
 * @return {Object|Null}
 */

function select(responses) {
  for (var i = 0, l = responses.length; i < l; i++) {
    var res = responses[i];
    // bail because the higher precidence paths haven't finished
    if (!res) return null;
    if (!res.value && i !== l - 1) continue;
    return res;
  }
}

});

require.register("ng-hyper/services/hyper.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var $safeApply = require("ng-hyper/lib/utils.js").$safeApply;

/**
 * hyper service
 */

pkg.factory('hyper', [
  '$exceptionHandler',
  'hyperBackend',
  'hyperPath',
  function($exceptionHandler, backend, request) {
    function get(path, $scope, fn) {
      if (typeof $scope === 'function') {
        fn = $scope;
        $scope = null;
      };

      var req = request(path, backend);

      // we're not starting at the root of the api so we need to watch
      // the first property in the path, or `req.index`, as the root
      if (!req.isRoot && $scope && $scope.$watch) $scope.$watch(req.index, function(parent) {
        req._root = req.root || {};
        req._root[req.index] = parent;
        req.scope(req._root);
      }, true);

      if ($scope) req.scope($scope);

      // listen to any updates from the api
      req.on(function(err, value) {
        if (err) return $exceptionHandler(err);

        if ($scope && $scope.$apply) return $safeApply.call($scope, function() {
          fn(value, req);
        });

        fn(value, req);
      });

      if ($scope && $scope.$on) {
        $scope.$on('$destroy', function() {
          req.off();
        });
      } else {
        req.off();
      }

      return req;
    }

    function submit(method, action, data, fn, disableRefresh) {
      backend.submit(method, action, data, fn, disableRefresh);
    }

    return {
      get: get,
      submit: submit
    };
  }
]);

});

require.register("ng-hyper/services/hyper-path.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var request = require("hypergroup~hyper-path@1.0.9");

/**
 * hyper path service
 */

pkg.factory('hyperPath', [
  function() {
    return request;
  }
]);

});

require.register("ng-hyper/services/hyper-link.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var each = angular.forEach;
var map = require("component~map@0.0.1");

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
      if (res.href.charAt(0) === '/') res.href = res.href.substring(1);
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

require.register("ng-hyper/services/hyper-link-formatter.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var websafe = require("camshaft~websafe-base64@master");
var slug = require("yields~slug@1.1.0");

/**
 * hyper link formatter service
 */

pkg.factory('hyperLinkFormatter', [
  'hyperHttpRoot',
  function(root) {
    function encode(value) {
      if (value && value.href) return websafe.encode(value.href.replace(root, '~'));
      if (angular.isString(value)) return slug(value);
      if (angular.isNumber(value)) return '' + value;
      return '-';
    }

    function decode(str) {
      try {
        return websafe.decode(str).replace('~', root);
      } catch (e) {}
    }

    return {
      encode: encode,
      decode: decode
    };
  }
]);

});

require.register("ng-hyper/services/hyper-status.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");

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
        elem.removeClass('ng-hyper-loaded-undefined');
        elem.addClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loaded-defined');
      },
      undef: function(elem) {
        elem.removeClass('ng-hyper-loading');
        elem.removeClass('ng-hyper-loaded-defined');
        elem.addClass('ng-hyper-loaded');
        elem.addClass('ng-hyper-loaded-undefined');
      },
      isLoaded: function(value) {
        return typeof value !== 'undefined';
      }
    };
  }
]);

});

require.register("ng-hyper/services/hyper-backend-http.js", function (exports, module) {
/**
 * Module dependencies
 */

var pkg = require("ng-hyper/package.js");
var Emitter = require("component~emitter@1.1.3");
var parseLinks = require("camshaft~links-parser@0.1.0");

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

          if (!disableRefresh) emitter.refresh(action);
          angular.forEach(refreshHeaders, function(header) {
            var href = headers(header);
            if (href) emitter.refresh(href);
          });

          // http://tools.ietf.org/html/draft-nottingham-linked-cache-inv-03#section-3
          var invalidates = links.invalidates;
          invalidates = typeof invalidates === 'string' ? [invalidates] : invalidates;
          angular.forEach(invalidates || [], function(href) {
            emitter.refresh(href);
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

    emitter.refresh = function (href) {
      if (!cache) cache = $cache.get('hyperHttpCache');
      // bust the cache for everyone
      cache.remove(href);
      var req = {
        headers: {
          'cache-control': 'no-cache'
        },
        cache: false
      };

      $http.get(href, req)
        .success(function(body, status, headers) {
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

});

require.register("ng-hyper/lib/utils.js", function (exports, module) {
/**
 * Module dependencies
 */

var type = require("component~type@1.0.0");

/**
 * Safely call apply
 *
 * @param {Function} fn
 * @api private
 */

exports.$safeApply = $safeApply;
function $safeApply(fn) {
  var root = this.$root;
  if (!root) return this.$apply(fn);
  var phase = root.$$phase;
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

require.define("ng-hyper/templates/inputs.html", "<div data-ng-class=\"{'ng-hyper-loading': !input, 'ng-hyper-loaded': input}\" data-ng-switch=\"input.type\">\n  <select data-ng-switch-when=\"select\" name=\"{{input.name}}\" data-ng-model=\"input.$model\" data-ng-required=\"input.required\" data-ng-disabled=\"input.disabled\" data-hyper-input-options=\"input.options\" data-ng-options=\"option.value as (option.name || option.text || option.value) for option in options\" class=\"{{inputClass}}\"></select>\n  <textarea data-ng-switch-when=\"textarea\" name=\"{{input.name}}\" data-ng-model=\"input.$model\" placeholder=\"{{placeholder || input.prompt || input.title || input.name}}\" data-ng-required=\"input.required\" data-ng-disabled=\"input.disabled\" class=\"{{inputClass}}\"></textarea>\n  <input data-ng-switch-default name=\"{{input.name}}\" data-ng-model=\"input.$model\" type=\"{{input.type}}\" placeholder=\"{{placeholder || input.prompt || input.title || input.name}}\" data-ng-required=\"input.required\" data-ng-disabled=\"input.disabled\" class=\"{{inputClass}}\" />\n</div>\n");

if (typeof exports == "object") {
  module.exports = require("ng-hyper");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("ng-hyper"); });
} else {
  this["ng-hyper"] = require("ng-hyper");
}
})()

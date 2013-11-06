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
exports.hyperBind = require('./directives/hyper-form');
exports.hyperBind = require('./directives/hyper-input');
exports.hyperLink = require('./directives/hyper-link');

/**
 * Tell other modules how to load us
 */

exports.name = 'ng-hyper';

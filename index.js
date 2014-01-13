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

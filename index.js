'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = createMiddleware;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var decycle = function decycle(obj) {
  var cache = [];

  var stringified = JSON.stringify(obj, function (key, value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });
  cache = null;

  return stringified;
};

function createMiddleware(stateSanitizer) {
  if (!window.Rollbar) {
    console.error('[redux-rollbar-middleware] Rollbar is not available.');
  }

  return function (store) {
    return function (next) {
      return function (action) {
        try {
          return next(action);
        } catch (err) {
          console.error('Reporting error to Rollbar:', err);

          var stateToSend = store.getState();
          if (stateSanitizer && typeof stateSanitizer === 'function') {
            stateToSend = stateSanitizer(stateToSend);
          }

          var decycledAction = decycle(action);
          var decycledState = decycle(stateToSend);

          Rollbar.error(err, {
            action: decycledAction,
            state: decycledState
          });
        }
      };
    };
  };
}

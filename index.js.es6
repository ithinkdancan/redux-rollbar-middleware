import React from 'react';
import _ from 'lodash';

const decycle = (obj) => {
  let cache = [];

  const stringified = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });
  cache = null;

  return stringified;
}

export default function createMiddleware(stateSanitizer) {
  if (!window.Rollbar) {
    console.error('[redux-rollbar-middleware] Rollbar is not available.');
  }

  return store => next => action => {
    try {
      return next(action);
    } catch (err) {
      console.error('Reporting error to Rollbar:', err);

      let stateToSend = store.getState();
      if (stateSanitizer &&  typeof(stateSanitizer) === 'function') {
        stateToSend = stateSanitizer(stateToSend);
      }

      const decycledAction = decycle(action);
      const decycledState = decycle(stateToSend);

      Rollbar.error(err, {
        action: decycledAction,
        state: decycledState,
      });
    }
  }
}

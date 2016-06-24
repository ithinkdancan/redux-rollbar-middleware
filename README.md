# redux-rollbar-middleware

Redux middleware that integrates [Rollbar](https://rollbar.com/docs/notifier/rollbar.js/). If exception happens during the action, it will send information to Rollbar:

* about the error,
* about the action that caused it
* the whole redux store state

__It allows to easily override sent state for sanitization (e.g. if you store password or credit card number in your applicationt state).__

It demands basically no additional configuration except default Rollbar configuration options.

## Installation
Run `npm install --save redux-rollbar-middleware`.

[Add Rollbar.js initial configuration according to docs](https://rollbar.com/docs/notifier/rollbar.js/#quick-start). Copy into your <HEAD> section:
```
<script>
  var _rollbarConfig = {
      accessToken: __YOUR_ACCESS_TOKEN__,
      captureUncaught: false,
      captureUnhandledRejections: false,
      payload: {
          environment: "production"
      }
  };
  // <!-- HERE SHOULD BE ROLLBAR SNIPPET, YOU WILL FIND IT ON ROLLBAR JS WEBSITE -->
</script>
```

## Usage
Import `rollbarMiddleware` function from package:
```
import rollbarMiddleware from 'redux-rollbar-middleware';
```

Create middleware in your store creator:
```
export default function configureStore(initialState) {
  const rollbar = rollbarMiddleware(stateSanitizer);

  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(rollbar)
  );
}
```

## State sanitization
If you want to sanitize state before sending to Rollbar, pass the sanitization function to `rollbarMiddleware` function. It accepts current application state and should return a state that will be send to Rollbar.

For example, assume that you store credit card number in your `billing` object inside your application state:
```
{
  billing: {
    number: '1234 1234 1234 1234',
    (...)
  },
  (...)
}
```
To sanitize it, you should provide following function:

```
const stateSanitizer = function(state) {
  // make sure you don't change state tree
  const stateCopy = Object.assign({}, state);
  // make sure you don't change billing object (by reference)
  const billingCopy = Object.assign({}, stateCopy.billing);
  // override number in billing copy
  billingCopy.number = '######';
  // pass billing copy to state copy
  stateCopy.billing = billingCopy;
  // return sanitized state
  return stateCopy;
}

export default function configureStore(initialState) {
  const rollbar = rollbarMiddleware(stateSanitizer);

  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(rollbar)
  );
}
```

## Maintainers
* [Kuba Niechciał](https://github.com/jniechcial)

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

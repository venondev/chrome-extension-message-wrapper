export const isFunction = x => typeof x === "function";
export const isObject = x => typeof x === "object";
export const isPromise = x => isObject(x) && isFunction(x.then);

// Logger
/* eslint-disable no-console */
export const Logger = options => ({
  log: options.verbose ? console.log : () => undefined,
  logRequest: req =>
    console.log(
      (options.logRequest && options.logRequest(req)) ||
        `Got request to call a function: ${req}`
    )
});

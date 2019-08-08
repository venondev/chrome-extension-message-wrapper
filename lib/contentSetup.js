import {
  CHROME_EXT_TOOLKIT,
  INVOKE_FUNCTION,
  GET_FUNCTION_NAMES
} from "./constants";

/**
 *
 * @param {Object} chrome
 * @returns {Function} sendMessage(msg) -> chrome.runtime.sendMessage
 */
export const makeSendMessage = chrome => msg =>
  new Promise((res, rej) => {
    chrome.runtime.sendMessage(msg, response => {
      if (response.error) {
        rej(response.error);
      } else {
        res(response.result);
      }
    });
  });

/**
 *
 * @param {Function} sendMessage
 * @returns {Function} createFunction(path) -> sendMessage(...)
 */
export const makeCreateFunction = sendMessage => path => (...args) =>
  sendMessage({
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path,
      args
    }
  });

/**
 * Maps over the background function names and creates a function which will send the arguments and path to the background script.
 *
 * @param {Function} createFunction
 * @param {Object} obj Object of background function names
 * @param {Array} path
 * @returns {Object} obj Object of functions
 */
export const addEntry = (createFunction, obj, path = []) =>
  Object.keys(obj).reduce((acc, key) => {
    let ret;
    if (typeof obj[key] === "object") {
      ret = addEntry(createFunction, obj[key], [...path, key]);
    } else {
      ret = createFunction([...path, key]);
    }
    return { ...acc, [key]: ret };
  }, {});

/**
 * Initialize the functions from the background script
 *
 * @param {Object} chrome
 * @returns {Promise} Promise with the background functions as an object with the same structure and names which were defined in setupMessageListener
 */
export const setupBackgroundFunctions = chrome => {
  const sendMessage = makeSendMessage(chrome);
  const createFunction = makeCreateFunction(sendMessage);
  return sendMessage({
    handler: CHROME_EXT_TOOLKIT,
    type: GET_FUNCTION_NAMES
  }).then(bgFuncs => {
    return {
      send: sendMessage,
      ...addEntry(createFunction, bgFuncs)
    };
  });
};

export default setupBackgroundFunctions;

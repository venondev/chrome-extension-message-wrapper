import {
  CHROME_EXT_TOOLKIT,
  INVOKE_FUNCTION,
  GET_FUNCTION_NAMES
} from "./constants";

export const find = (object, path) => {
  if (path.length > 0) {
    let ret = object[path[0]];
    if (typeof ret === "object") {
      ret = find(ret, path.slice(1));
    } else if (path.slice(1).length > 0) {
      return undefined;
    }
    return ret;
  }

  return object;
};

export const invokedFunctionListener = (req, sender, sendRes, bgFuncs) => {
  if (find(bgFuncs, req.payload.path)) {
    let ret = find(bgFuncs, req.payload.path);
    if (typeof ret === "function") {
      ret = ret(...req.payload.args, {
        req,
        sender
      });
      if (typeof ret === "object" && ret.then) {
        ret.then(res => sendRes(res));
        // Keep the msg channel open for the async response
        return true;
      }
    }
    sendRes(ret);
    return false;
  }
  return false;
};

export const mapNames = obj =>
  Object.keys(obj).reduce((acc, key) => {
    let ret = key;
    if (typeof obj[key] === "object") {
      ret = mapNames(obj[key]);
    }
    return { ...acc, [key]: ret };
  }, {});

/**
 * Function which creates the message listener.
 * This should be passend in chrome.runtime.onMessage.addListener
 * 
 * @param {Function} customHandler Message handler which gets called with Request, Sender, SendResponse
 * @param {Object} bgFuncs Functions which should be available to the content/popup scripts
 * @param {Object} options Options to configure logging
 * @returns {Function} listener which takes Request, Sender and SendResponse
 */
const setupMessageListener = (customHandler, bgFuncs = {}, options = {}) => (
  req,
  sender,
  sendRes
) => {
  if (req.handler === CHROME_EXT_TOOLKIT) {
    switch (req.type) {
      case GET_FUNCTION_NAMES:
        sendRes(mapNames(bgFuncs));
        return false;
      case INVOKE_FUNCTION:
        options.verbose && console.log(options.onFunctionCallMsg || "Got request to call a function: ", req);
        return invokedFunctionListener(req, sender, sendRes, bgFuncs);
      default:
        return false;
    }
  } else {
    customHandler(req, sender, sendRes);
    return true;
  }
};

export default setupMessageListener;

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
        return true;
      }
    }
    sendRes(ret);
    return false;
  }
  return false;
};

const mapNames = obj =>
  Object.keys(obj).reduce((acc, key) => {
    let ret = key;
    if (typeof obj[key] === "object") {
      ret = mapNames(obj[key]);
    }
    return { ...acc, [key]: ret };
  }, {});

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

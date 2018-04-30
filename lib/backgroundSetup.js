import { CHROME_EXT_TOOLKIT, INVOKE_FUNCTION, GET_FUNCTION_NAMES } from './constants';

export const invokedFunctionListener = (req, sendRes, bgFuncs) => {
  if (bgFuncs[req.payload.functionName]) {
    const ret = bgFuncs[req.payload.functionName](...req.payload.args);
    if (typeof ret === 'object' && ret.then) {
      ret.then(res => sendRes(res));
      return true;
    }
    sendRes(ret);
    return false;
  }
};

export default (chrome, customHandler, bgFuncs) => {
  console.log('Setup Message listener');

  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    console.log("Got Request", req.type);
    if (req.handler === CHROME_EXT_TOOLKIT) {
      switch (req.type) {
        case GET_FUNCTION_NAMES:
          sendRes(Object.keys(bgFuncs));
          return false;
        case INVOKE_FUNCTION:
          return invokedFunctionListener(req, sendRes, bgFuncs);
        default:
          break;
      }
    } else {
      customHandler(req, sender, sendRes);
      return true;
    }
  });
};

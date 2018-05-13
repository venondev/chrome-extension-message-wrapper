import {
  CHROME_EXT_TOOLKIT,
  INVOKE_FUNCTION,
  GET_FUNCTION_NAMES
} from "./constants";

export const makeSendMessage = chrome => msg =>
  new Promise(res => {
    chrome.runtime.sendMessage(msg, response => res(response));
  });

export const makeCreateFunction = sendMessage => path => (...args) =>
  sendMessage({
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path,
      args
    }
  })

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
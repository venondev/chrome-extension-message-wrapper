import {
  CHROME_EXT_TOOLKIT,
  INVOKE_FUNCTION,
  GET_FUNCTION_NAMES
} from "./constants";

const makeSendMessage = chrome => msg =>
  new Promise(res => {
    chrome.runtime.sendMessage(msg, response => res(response));
  });

const makeInvokeFunction = sendMessage => functionName => (...args) =>
  sendMessage({
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      functionName,
      args
    }
  }).then(response => {
    if (response.error) {
      console.error("An error occured: ", response.msg);
      return response.msg;
    }
    return response;
  });

export default function(chrome) {
  const sendMessage = makeSendMessage(chrome);
  return sendMessage({
    handler: CHROME_EXT_TOOLKIT,
    type: GET_FUNCTION_NAMES
  }).then((functionNames = []) => {
    const invokeFunction = makeInvokeFunction(sendMessage);
    return {
      send: sendMessage,
      ...functionNames.reduce(
        (acc, funcName) => ({
          ...acc,
          [funcName]: invokeFunction(funcName)
        }),
        {}
      )
    };
  });
}

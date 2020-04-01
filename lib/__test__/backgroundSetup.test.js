import setupMessageListener, * as backgroundSetup from "../backgroundSetup";
import {
  CHROME_EXT_TOOLKIT,
  INVOKE_FUNCTION,
  GET_FUNCTION_NAMES
} from "../constants";

describe("Background Setup", () => {
  const bgFuncsMock = {
    test: () => "test",
    testAsync: () =>
      new Promise(res => {
        setTimeout(() => {
          res("async_test");
        }, 200);
      }),
    testError: () => {
      throw new Error("test_error");
    },
    testErrorAsync: () =>
      new Promise((res, rej) => {
        setTimeout(() => {
          rej("async_test_error");
        }, 200);
      })
  };

  const sender = {
    tab: {
      id: 123
    }
  };

  const req = {
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path: ["test"],
      args: []
    }
  };

  const req2 = {
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path: ["testAsync"],
      args: []
    }
  };

  const req3 = {
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path: ["testError"],
      args: []
    }
  };

  const req4 = {
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      path: ["testErrorAsync"],
      args: []
    }
  };

  it("can create function listeners", done => {
    const sendRes = jest.fn();
    const ret = backgroundSetup.invokeFunction(
      req,
      sender,
      sendRes,
      bgFuncsMock
    );
    expect(ret).toBe(false);
    expect(sendRes.mock.calls.length).toBe(1);
    expect(sendRes.mock.calls[0][0]).toEqual({ result: "test" });

    const sendRes2 = res => {
      expect(res).toEqual({ result: "async_test" });
      done();
    };
    const ret2 = backgroundSetup.invokeFunction(
      req2,
      sender,
      sendRes2,
      bgFuncsMock
    );
    expect(ret2).toBe(true);

    const sendRes3 = jest.fn();
    const ret3 = backgroundSetup.invokeFunction(
      req3,
      sender,
      sendRes3,
      bgFuncsMock
    );
    expect(ret3).toBe(false);
    expect(sendRes3.mock.calls.length).toBe(1);
    expect(sendRes3.mock.calls[0][0]).toEqual({ error: "test_error" });

    const sendRes4 = res => {
      expect(res).toEqual({ error: "async_test_error" });
      done();
    };
    const ret4 = backgroundSetup.invokeFunction(
      req4,
      sender,
      sendRes4,
      bgFuncsMock
    );
    expect(ret4).toBe(true);

    const ret5 = backgroundSetup.invokeFunction(
      {
        payload: {
          path: ["unknown function"]
        }
      },
      sender,
      () => {},
      bgFuncsMock
    );
    expect(ret5).toBe(false);
  });

  it("can setup a message listener", () => {
    const customHandler = (req, sender, sendRes) => {
      sendRes("Handelt in custom handler");
    };

    const options = {
      customHandler
    };

    const handler = setupMessageListener(bgFuncsMock, options);

    let sendResMock = jest.fn();
    let ret = handler({}, {}, sendResMock);
    expect(ret).toBe(true);
    expect(sendResMock.mock.calls.length).toBe(1);
    expect(sendResMock.mock.calls[0][0]).toBe("Handelt in custom handler");

    sendResMock = jest.fn();
    ret = handler(
      {
        handler: CHROME_EXT_TOOLKIT,
        type: GET_FUNCTION_NAMES
      },
      {},
      sendResMock
    );
    expect(ret).toBe(false);
    expect(sendResMock.mock.calls.length).toBe(1);
    expect(sendResMock.mock.calls[0][0]).toEqual({
      result: {
        test: "test",
        testAsync: "testAsync",
        testError: "testError",
        testErrorAsync: "testErrorAsync"
      }
    });

    ret = handler(req, {}, () => {});
    expect(ret).toBe(false);

    ret = handler(req2, {}, () => {});
    expect(ret).toBe(true);

    ret = handler({ handler: CHROME_EXT_TOOLKIT }, {}, () => {});
    expect(ret).toBe(false);
  });
});

import setupMessageListener, * as backgroundSetup from '../backgroundSetup';
import { CHROME_EXT_TOOLKIT, INVOKE_FUNCTION, GET_FUNCTION_NAMES } from '../constants';



describe('Background Setup', () => {

  const bgFuncsMock = {
    test: () => {
      return "test";
    },
    testAsync: () => {
      return new Promise(res => {
        setTimeout(() => {
          res('async_test');
        }, 200);
      })
    }
  };

  const req = { 
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      functionName: 'test',
      args: []
    }
  }

  const req2 = { 
    handler: CHROME_EXT_TOOLKIT,
    type: INVOKE_FUNCTION,
    payload: {
      functionName: 'testAsync',
      args: []
    }
  }
  
  it('can create function listeners', done => {
    const sendRes = jest.fn();
    const ret = backgroundSetup.invokedFunctionListener(req, sendRes, bgFuncsMock);
    expect(ret).toBe(false);
    expect(sendRes.mock.calls.length).toBe(1);
    expect(sendRes.mock.calls[0][0]).toBe('test');

    const sendRes2 = (res) => {
      expect(res).toBe('async_test');
      done();
    }
    const ret2 = backgroundSetup.invokedFunctionListener(req2, sendRes2, bgFuncsMock);
    expect(ret2).toBe(true);

    const ret3 = backgroundSetup.invokedFunctionListener({
      payload: {
        functionName: 'unknown function'
      }
    }, () => {}, bgFuncsMock)
    expect(ret3).toBe(false);

  });

  it('can setup a message listener', () => {
    const customHandler = (req, sender, sendRes) => {
      sendRes('Handelt in custom handler');
    };

    const handler = setupMessageListener(customHandler, bgFuncsMock);

    let sendResMock = jest.fn();
    let ret = handler({}, {}, sendResMock)
    expect(ret).toBe(true);
    expect(sendResMock.mock.calls.length).toBe(1);
    expect(sendResMock.mock.calls[0][0]).toBe('Handelt in custom handler');

    sendResMock = jest.fn();
    ret = handler({
      handler: CHROME_EXT_TOOLKIT,
      type: GET_FUNCTION_NAMES
    }, {}, sendResMock);
    expect(ret).toBe(false);
    expect(sendResMock.mock.calls.length).toBe(1);
    expect(sendResMock.mock.calls[0][0]).toEqual(['test', 'testAsync'])

    ret = handler(req, {}, () => {});
    expect(ret).toBe(false);

    ret = handler(req2, {}, () => {});
    expect(ret).toBe(true);

    ret = handler({handler: CHROME_EXT_TOOLKIT}, {}, () => {});
    expect(ret).toBe(false);
  });
});

import * as backgroundSetup from '../backgroundSetup';

describe('Background Setup', () => {
  
  it('correctly creates sync function listeners', () => {
    const bgFuncsMock = {
      test: () => {
        return "test";
      }
    };

    const req = { payload: {
      functionName: 'test',
      args: []
    }}

    const sendRes = jest.fn();

    backgroundSetup.invokedFunctionListener(req, sendRes, bgFuncsMock);

    expect(sendRes.mock.calls.length).toBe(1);
    expect(sendRes.mock.calls[0][0]).toBe('test');
  });
});

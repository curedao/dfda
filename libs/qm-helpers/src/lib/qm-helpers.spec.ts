import { default as qm } from '../index';

describe('qmHelpers', () => {
  it('should know we are testing', () => {
    expect(qm.appMode.isTesting()).toBeTruthy();
  });
});

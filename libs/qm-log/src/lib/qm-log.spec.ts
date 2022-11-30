import * as qmLog from './qm-log';

describe('qmLog', () => {
  it('should get server context', () => {
    expect(qmLog.getCurrentServerContext().length).toBeGreaterThan(2);
  });
});

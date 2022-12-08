import * as envHelper from './env-helper';

describe('envHelper', () => {
  it('should return QM_API_ORIGIN', () => {
    expect(envHelper.getenv('QM_API_ORIGIN')).toEqual(expect.stringContaining('http'));
  });
});

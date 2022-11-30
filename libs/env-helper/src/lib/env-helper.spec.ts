import * as envHelper from './env-helper';

describe('envHelper', () => {
  it('should return API_ORIGIN', () => {
    expect(envHelper.getenv('API_ORIGIN')).toEqual(expect.stringContaining('http'));
  });
});

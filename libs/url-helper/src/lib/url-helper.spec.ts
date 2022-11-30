import * as urlHelper from './url-helper';

describe('urlHelper', () => {
  it('should work', () => {
    expect(urlHelper.values.API_ORIGIN).toEqual(expect.stringContaining('http'));
  });
});

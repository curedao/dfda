import * as urlHelper from './url-helper';

describe('urlHelper', () => {
  it('should work', () => {
    expect(urlHelper.values.QM_API_ORIGIN).toEqual(expect.stringContaining('http'));
  });
});

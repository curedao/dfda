import * as fileHelper from './file-helper';

describe('fileHelper', () => {
  it('assert file exists', () => {
    fileHelper.assertExists('.env')
    expect(true).toBeTruthy();
  });
});

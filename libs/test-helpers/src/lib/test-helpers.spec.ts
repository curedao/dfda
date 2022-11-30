import { getCurrentGitCommitSha } from './test-helpers';

describe('testHelpers', () => {
  it('should work', () => {
    expect(getCurrentGitCommitSha()).toHaveLength(40);
  });
});

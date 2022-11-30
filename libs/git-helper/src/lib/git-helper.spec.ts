import { getCurrentGitCommitSha } from './git-helper';

describe('gitHelper', () => {
  it('should get Current Git Commit SHA', () => {
    expect(getCurrentGitCommitSha()).toHaveLength(40);
  });
});

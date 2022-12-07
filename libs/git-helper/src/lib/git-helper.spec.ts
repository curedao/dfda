import {
  findReposContaining,
  getCurrentGitCommitSha,
  getGithubPagesForUser,
  listAllReposForUser
} from "./git-helper";

describe('gitHelper', () => {
  it('should get Current Git Commit SHA', () => {
    expect(getCurrentGitCommitSha()).toHaveLength(40);
  });
  it('should get a list of Github repos for a user', () => {
    jest.useRealTimers();
    jest.setTimeout(30000)
    return listAllReposForUser().then((repos) => {
      const length = repos.length;
      expect(length).toBeGreaterThan(100)
    });
  });
  it('should get a list of Github pages for a user', () => {
    return getGithubPagesForUser().then((pages) => {
      expect(pages).toHaveLength(1);
    });
  });
  it('should find repo containing a string', () => {
    return findReposContaining('assets').then((repos) => {
      expect(repos).toHaveLength(1);
    });
  });
});

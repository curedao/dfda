import { fdaiAuth } from './fdai-auth';

describe('fdaiAuth', () => {
  it('should work', () => {
    expect(fdaiAuth()).toEqual('fdai-auth');
  });
});

import { getUserId } from './getUserId';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next');

describe('getUserId', () => {
  test('returns user ID from session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user789' },
    });

    const userId = await getUserId();

    expect(userId).toBe('user789');
  });

  test('returns anonymous ID if no session user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({});

    const userId = await getUserId();

    expect(userId).toMatch(/^anon-/);  
  });
});
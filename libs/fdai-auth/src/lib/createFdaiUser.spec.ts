import { createFdaiUser } from './createFdaiUser';

describe('createFdaiUser', () => {
  it('should create an FDAi user and return the user ID', async () => {
    // Mock environment variables
    process.env['FDAI_API_ORIGIN'] = 'https://safe.fdai.earth';
    process.env['FDAI_CLIENT_ID'] = 'test_client_id';
    process.env['FDAI_CLIENT_SECRET'] = 'test_client_secret';

    // Mock clientUserId
    const clientUserId = 'testUser123';

    // Call the createFdaiUser function
    const userId = await createFdaiUser(clientUserId);

    // Assertions
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
  });
});

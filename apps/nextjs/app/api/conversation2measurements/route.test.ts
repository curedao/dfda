import { POST, GET } from './route';
import { createMocks } from 'node-mocks-http';
import { conversation2measurements } from '@/lib/conversation2measurements';
import { postMeasurements } from '@/lib/dfda';
import { getUserId } from '@/lib/getUserId';

jest.mock('@/lib/conversation2measurements');
jest.mock('@/lib/dfda');
jest.mock('@/lib/getUserId');

describe('POST /api/conversation2measurements', () => {
  test('responds with measurements for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST', 
      body: {
        statement: 'I ate an apple',
        localDateTime: '2023-06-08T10:00:00.000Z',
        previousStatements: 'What did you eat today?',
      },
    });

    const mockMeasurements = [
      // Mock measurements array
    ];
    (conversation2measurements as jest.Mock).mockResolvedValue(mockMeasurements);
    (getUserId as jest.Mock).mockResolvedValue('user123');

    await POST(req, res);

    expect(conversation2measurements).toHaveBeenCalledWith(
      'I ate an apple',
      '2023-06-08T10:00:00.000Z',
      'What did you eat today?'
    );
    expect(getUserId).toHaveBeenCalled();
    expect(postMeasurements).toHaveBeenCalledWith(
      mockMeasurements,
      'user123'  
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      measurements: mockMeasurements,
    });
  });

  // Add more test cases for POST, handling errors etc.
});

describe('GET /api/conversation2measurements', () => {
  // Add test cases for GET handler
});
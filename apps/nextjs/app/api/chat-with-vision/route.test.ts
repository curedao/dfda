import { POST } from './route';
import { createMocks } from 'node-mocks-http';
import OpenAI from 'openai';

jest.mock('openai');

describe('POST /api/chat-with-vision', () => {
  test('responds with streaming text response for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        messages: [/* valid messages array */],
        data: { imageUrl: 'https://example.com/image.png' }
      }
    });
    
    const mockResponse = {
      // Mock OpenAI chat completion response
    };
    OpenAI.prototype.chat.completions.create.mockResolvedValue(mockResponse);

    await POST(req, res);

    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4-vision-preview',
        stream: true,
        // Other expected parameters
      })
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['content-type']).toEqual(
      'text/event-stream; charset=utf-8'
    );
    // Add more assertions for the response body
  });

  test('responds with error for invalid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // Invalid or missing fields
      }
    });

    await POST(req, res);

    expect(OpenAI.prototype.chat.completions.create).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    // Add more assertions for the error response
  });
});
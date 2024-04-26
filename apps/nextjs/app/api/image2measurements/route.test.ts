import { createMocks } from 'node-mocks-http';
import { mockDeep } from 'jest-mock-extended';
import { NextApiRequest, NextApiResponse } from 'next';
import { POST } from './route';

jest.mock('openai', () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn(() => ({
    createCompletion: jest.fn(),
  })),
}));

describe('Image to Measurements API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a successful response for a valid request', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        file: 'validBase64Image',
        prompt: 'Test prompt',
      },
    });

    const mockOpenAIResponse = {
      data: {
        choices: [
          {
            text: 'Mock analysis result',
          },
        ],
      },
    };
    jest.spyOn(require('openai'), 'OpenAIApi').mockImplementation(() => ({
      createCompletion: jest.fn().mockResolvedValueOnce(mockOpenAIResponse),
    }));

    await POST(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      analysis: 'Mock analysis result',
    });
  });

  it('should return an error response for an invalid request', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        file: 'invalidBase64Image',
        prompt: 'Test prompt',
      },
    });

    const mockOpenAIError = new Error('Mock OpenAI error');
    jest.spyOn(require('openai'), 'OpenAIApi').mockImplementation(() => ({
      createCompletion: jest.fn().mockRejectedValueOnce(mockOpenAIError),
    }));

    await POST(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'An error occurred while processing the image.',
    });
  });
});
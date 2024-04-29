import { textCompletion } from './llm';
import OpenAI from 'openai';

describe('llm', () => {
  it('should return text completion', async () => {
    const promptText = 'What is the capital of France?';
    const mockResponse = {
      choices: [{ message: { content: 'Paris' } }]  
    };

    jest.spyOn(OpenAI.prototype, 'chat').mockResolvedValue({
      completions: {
        create: jest.fn().mockResolvedValue(mockResponse)
      }
    });

    const completion = await textCompletion(promptText, 'text');

    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4-turbo',
      stream: false,
      messages: [
        {"role": "system", "content": "You are a helpful assistant that translates user requests into JSON objects"},
        {role: "user", "content": promptText},
      ],
      response_format: { type: 'text' },
    });
    expect(completion).toBe('Paris');
  });

  it('should return JSON object completion', async () => {
    const promptText = 'Generate a JSON object with a "message" property';
    const mockResponse = {
      choices: [{ message: { content: '{"message":"Hello, world!"}' } }]
    };

    jest.spyOn(OpenAI.prototype, 'chat').mockResolvedValue({
      completions: {
        create: jest.fn().mockResolvedValue(mockResponse)
      }
    });

    const completion = await textCompletion(promptText, 'json_object');

    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4-turbo', 
      stream: false,
      messages: [
        {"role": "system", "content": "You are a helpful assistant that translates user requests into JSON objects"},
        {role: "user", "content": promptText},
      ],
      response_format: { type: 'json_object' },
    });
    expect(completion).toBe('{"message":"Hello, world!"}');
  });

  it('should throw an error if no content is returned', async () => {
    const promptText = 'What is the capital of France?';
    const mockResponse = {
      choices: [{ message: { content: undefined } }]
    };

    jest.spyOn(OpenAI.prototype, 'chat').mockResolvedValue({
      completions: {
        create: jest.fn().mockResolvedValue(mockResponse)
      }
    });

    await expect(textCompletion(promptText, 'text')).rejects.toThrow('No content in response');
  });
});
import { text2measurements } from './text2measurements';
import { Measurement } from '../types/models/Measurement';
import { MeasurementSet } from '../../../libs/text-2-measurements/src/lib/measurementSchema';

// Mock the OpenAI API
jest.mock('openai', () => ({
  ChatCompletionRequestMessage: () => {},
  ChatCompletionRequestMessageRoleEnum: {},
  Configuration: () => {},
  OpenAIApi: () => ({
    createChatCompletion: jest.fn().mockResolvedValue({
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              measurements: [
                {
                  variableName: 'Mocked Measurement',
                  // ... rest of mocked measurement properties
                }  
              ]
            })
          }
        }]
      }
    })
  })
}));

describe('text2measurements', () => {
  it('should convert text to an array of Measurement objects', async () => {
    const statement = 'I took 5 mg of NMN';
    const localDateTime = '2023-06-08T10:00:00';
    
    const measurements = await text2measurements(statement, localDateTime);
    
    expect(Array.isArray(measurements)).toBe(true);
    expect(measurements.length).toBeGreaterThan(0);
    expect(measurements[0]).toMatchObject({
      variableName: expect.any(String),
      value: expect.any(Number),
      unitName: expect.any(String),
      // ... assert other expected Measurement properties
    } as Partial<Measurement>);
  });
  
  // Add more test cases:
  // - Test edge cases like empty input, invalid input, etc.
  // - Test handling of different OpenAI API response types
  // - Test accuracy of text to Measurement conversions
});
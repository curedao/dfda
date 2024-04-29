import { conversation2MeasurementsPrompt, conversation2measurements } from './conversation2measurements';
import { textCompletion } from './llm';
import { Measurement } from '@/types/models/Measurement';

describe('conversation2measurements', () => {
  it('should generate the correct prompt', () => {
    const statement = 'I ate an apple';
    const localDateTime = '2023-06-01T10:00:00';
    const previousStatements = 'I had coffee for breakfast';
    
    const prompt = conversation2MeasurementsPrompt(statement, localDateTime, previousStatements);

    expect(prompt).toContain(statement);
    expect(prompt).toContain(localDateTime);
    expect(prompt).toContain(previousStatements);
  });

  it('should convert conversation to measurements', async () => {
    const statement = 'I ate an apple';
    const localDateTime = '2023-06-01T10:00:00';
    const previousStatements = 'I had coffee for breakfast';

    jest.mock('./llm', () => ({
      textCompletion: jest.fn().mockResolvedValue(JSON.stringify({ 
        measurements: [
          {
            variableName: 'Apple',
            value: 1,
            unitName: 'Count',
            startAt: localDateTime,
            combinationOperation: 'SUM',
            variableCategoryName: 'Foods'
          }
        ]
      }))
    }));

    const measurements = await conversation2measurements(statement, localDateTime, previousStatements);

    expect(textCompletion).toHaveBeenCalledWith(expect.any(String), 'json_object');
    expect(measurements).toHaveLength(1);
    expect(measurements[0]).toMatchObject({
      variableName: 'Apple',
      value: 1,
      unitName: 'Count',
      startAt: localDateTime,
      combinationOperation: 'SUM',
      variableCategoryName: 'Foods'
    });
  });
});
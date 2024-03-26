const fs = require('fs');
const path = require('path');
const { processStatement } = require('./statement-2-measurements');

const examples = [
  {
    "statement": "I have been feeling very tired and fatigued today. I have been having trouble concentrating and I have been feeling very down.\nI took a cold shower for 5 minutes and I took a 20 minute nap. I also took magnesium 200mg, Omega3 one capsule 500mg",
    "localDateTime": "2021-01-01T20:00:00",
    "measurements": [
      {
        "combinationOperation": "MEAN",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I have been feeling very tired and fatigued today.",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "1 to 5 Rating",
        "value": 5,
        "variableCategoryName": "Symptoms",
        "variableName": "Tiredness"
      },
      {
        "combinationOperation": "MEAN",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I have been feeling very tired and fatigued today.",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "1 to 5 Rating",
        "value": 5,
        "variableCategoryName": "Symptoms",
        "variableName": "Fatigue"
      },
      {
        "combinationOperation": "MEAN",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I have been having trouble concentrating",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "1 to 5 Rating",
        "value": 1,
        "variableCategoryName": "Symptoms",
        "variableName": "Concentration"
      },
      {
        "combinationOperation": "MEAN",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I have been feeling very down.",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "1 to 5 Rating",
        "value": 1,
        "variableCategoryName": "Emotions",
        "variableName": "Mood"
      },
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I took a cold shower for 5 minutes",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "Minutes",
        "value": 5,
        "variableCategoryName": "Activities",
        "variableName": "Cold Shower"
      },
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I took a 20 minute nap",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "Minutes",
        "value": 20,
        "variableCategoryName": "Sleep",
        "variableName": "Nap"
      },
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I also took magnesium 200mg",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "Milligrams",
        "value": 200,
        "variableCategoryName": "Treatments",
        "variableName": "Magnesium"
      },
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I also took Omega3 one capsule 500mg",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": null,
        "unitName": "Milligrams",
        "value": 500,
        "variableCategoryName": "Treatments",
        "variableName": "Omega3"
      }
    ]
  },
  {
    "statement": "I ate a bowl of oatmeal for breakfast",
    "localDateTime": "2021-01-01T00:00:00",
    "measurements": [
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "I ate a bowl of oatmeal for breakfast",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": "08:00:00",
        "unitName": "Serving",
        "value": 1,
        "variableCategoryName": "Foods",
        "variableName": "Oatmeal"
      }
    ]
  },
  {
    "statement": "Took 500mg of Paracetamol at 10 AM",
    "localDateTime": "2021-01-01T00:00:00",
    "measurements": [
      {
        "combinationOperation": "SUM",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "Took 500mg of Paracetamol at 10 AM",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": "10:00:00",
        "unitName": "Milligrams",
        "value": 500,
        "variableCategoryName": "Treatments",
        "variableName": "Paracetamol"
      }
    ]
  },
  {
    "statement": "Experienced a headache around midday, severity was 3 out of 5",
    "localDateTime": "2021-01-01T00:00:00",
    "measurements": [
      {
        "combinationOperation": "MEAN",
        "endDateLocal": null,
        "endTimeLocal": null,
        "itemType": "measurement",
        "originalText": "Experienced a headache around midday, severity was 3 out of 5",
        "startDateLocal": "2021-01-01",
        "startTimeLocal": "12:00:00",
        "unitName": "1 to 5 Rating",
        "value": 3,
        "variableCategoryName": "Symptoms",
        "variableName": "Headache"
      }
    ]
  }
]


function standardizeForFlakiness(arr) {
  // Remove originalText from result and test measurements for comparison
  // because it's kind of variable and not predictable
  arr.measurements = arr.measurements.map(({ originalText, ...rest }) => rest);
  // API sometimes returns 'Sleep' category instead of 'Activities' for naps
  arr.measurements = arr.measurements.map(item => {
    if (item.variableCategoryName === 'Sleep') {
      return { ...item, variableCategoryName: 'Activities' };
    }
    return item;
  });
}

function test(test) {
  it(`${test.statement}`, async () => {
    console.log('testing statement:', test.statement);
    const result = await processStatement(test.statement, test.localDateTime);
    standardizeForFlakiness(result);
    standardizeForFlakiness(test);
    expect(result.measurements).toEqual(test.measurements);
  }, 120000); // Increase timeout to 10000 ms
}

describe('Test Statements', () => {
  //const fixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'statement-2-measurements.json'), 'utf-8'));
  test(examples[0]);
  test(examples[1]);
  test(examples[2]);
  test(examples[3]);
});


const axios = require('axios');
let unitsArray = [
  "per Minute",
  "Yes/No",
  "Units",
  "Torr",
  "Tablets",
  "Sprays",
  "Serving",
  "Seconds",
  "Quarts",
  "Puffs",
  "Pounds",
  "Pills",
  "Pieces",
  "Percent",
  "Pascal",
  "Parts per Million",
  "Ounces",
  "Minutes",
  "Milliseconds",
  "Millimeters Merc",
  "Millimeters",
  "Milliliters",
  "Milligrams",
  "Millibar",
  "Miles per Hour",
  "Miles",
  "Micrograms per decilitre",
  "Micrograms",
  "Meters per Second",
  "Meters",
  "Liters",
  "Kilometers",
  "Kilograms",
  "Kilocalories",
  "International Units",
  "Index",
  "Inches",
  "Hours",
  "Hectopascal",
  "Grams",
  "Gigabecquerel",
  "Feet",
  "Event",
  "Drops",
  "Doses",
  "Dollars",
  "Degrees North",
  "Degrees Fahrenheit",
  "Degrees East",
  "Degrees Celsius",
  "Decibels",
  "Count",
  "Centimeters",
  "Capsules",
  "Calories",
  "Beats per Minute",
  "Applications",
  "1 to 5 Rating",
  "1 to 3 Rating",
  "1 to 10 Rating",
  "0 to 5 Rating",
  "0 to 1 Rating",
  "-4 to 4 Rating",
  "% Recommended Daily Allowance"
];
let defaultUnits = unitsArray.join(', ');

let categoriesArray = [
  "Emotions",
  "Physique",
  "Physical Activity",
  "Locations",
  "Miscellaneous",
  "Sleep",
  "Social Interactions",
  "Vital Signs",
  "Cognitive Performance",
  "Symptoms",
  "Nutrients",
  "Goals",
  "Treatments",
  "Activities",
  "Foods",
  "Conditions",
  "Environment",
  "Causes of Illness",
  "Books",
  "Software",
  "Payments",
  "Movies and TV",
  "Music",
  "Electronics",
  "IT Metrics",
  "Economic Indicators",
  "Investment Strategies"
];
let defaultCategories = categoriesArray.join(', ');

const basePrompt = `# Text to Measurements
 Transform the above conversation into a JSON array containing objects with the following keys: 
1. combinationOperation - SUM or MEAN. If the answer is \"I took 5 mg of NMN\", then this value is \"SUM\". If the answer is a rating, then this value is \"MEAN\".
2. startAt - Current time in UTC.  For example, \"2021-01-01T00:00:00Z\".
3. unitName - Can be one of the following: ${defaultUnits}.
4. value - Numerical value.  
5. variableCategoryName - Can be one of the following: ${defaultCategories}.
6. variableName - The name of the food, symptom, or treatment.  For example, if the answer is \"I took 5 mg of NMN\", then this value is \"NMN\".
7. note - Should be the original question and answer. 

`

console.log(basePrompt)
function extractJsonObjectsFromString(string) {
  const regex = /{[^}]*}/g;
  const matches = string.match(regex);
  if (!matches || matches.length === 0) {
    throw new Error("No JSON objects found in the string");
  }
  const jsonObjects = matches.map(match => JSON.parse(match));
  return jsonObjects;
}

const ChatGPT = {
  async completion(prompt) {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: prompt,
      // other parameters like max_tokens, temperature, etc.
    }, {
                                        headers: {
                                          'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                                          'Content-Type': 'application/json'
                                        }
                                      });

    // the completion text is in the 'choices[0].text' field of the response
    return response.data.choices[0].text;
  }
}

function createPrompt(question, answer, categories, units) {
  units = units || defaultUnits;
  categories = categories || defaultCategories;
  let prompt = `
  Question: "${question}"
   Answer: "${answer}" 
 
 Transform the above conversation into a JSON array containing objects with the following keys: 
1. combinationOperation - SUM or MEAN. If the answer is \"I took 5 mg of NMN\", then this value is \"SUM\". If the answer is a rating, then this value is \"MEAN\".
2. startDateLocal - Current time in UTC.  For example, \"2021-01-01\".
3. startTimeLocal - Current time in UTC.  For example, \"00:00:00\".
3. unitName - Can be one of the following: ${units}.
4. value - Numerical value.  
5. variableCategoryName - Can be one of the following: ${categories}.
6. variableName - The name of the food, symptom, or treatment.  For example, if the answer is \"I took 5 mg of NMN\", then this value is \"NMN\".
7. note - Should be the original question and answer. 

`;

  return prompt;
}

function textToMeasurements(question, answer, categories, units) {
  if (!question || question.length < 5 || !answer || answer.length < 5) {
    throw new Error('Invalid input');
  }

  let prompt = createPrompt(question, answer, categories, units);

  let complete = ChatGPT.completion(prompt);
  let arr = extractJsonObjectsFromString(complete);

  return arr;
}

module.exports = {
  textToMeasurements
};


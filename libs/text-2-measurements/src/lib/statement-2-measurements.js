const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");
const { createLanguageModel, createJsonTranslator } = require("typechat");

function findEnvFile(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    const envPath = path.join(currentPath, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

const envPath = findEnvFile(__dirname);
if (envPath) {
  config({ path: envPath });
} else {
  throw Error('.env file not found');
}

const model = createLanguageModel(process.env);
let viewSchema = fs.readFileSync(
  path.join(__dirname, "measurementSchema.ts"),
  "utf8"
);

async function processStatement(statement, localDateTime) {
  if (localDateTime) {
    viewSchema += "\n// Use the current local datetime " + localDateTime +
      " to determine startDateLocal. If specified, also determine startTimeLocal, endDateLocal, and endTimeLocal or just leave them null.";
  }
  const translator = createJsonTranslator(model, viewSchema, "MeasurementSet");
  const response = await translator.translate(statement);
  if (!response.success) {
    console.error(response);
    throw new Error("Translation failed");
  }
  const measurementSet = response.data;
  if (measurementSet.measurements.some((item) => item.itemType === "unknown")) {
    console.log("I didn't understand the following:");
    for (const item of measurementSet.measurements) {
      if (item.itemType === "unknown") console.log(item.text);
    }
  }
  printMeasurementSet(measurementSet);
  return measurementSet;
}

async function processStatements(statements) {
  const measurementSets = [];
  for (const statement of statements) {
    const measurementSet = await processStatement(statement);
    if (measurementSet) {
      measurementSets.push(measurementSet);
    }
  }
  return measurementSets;
}

function printMeasurementSet(measurementSet) {
  function isMeasurement(object) {
    return 'items' in object;
  }
  if (measurementSet.measurements && measurementSet.measurements.length > 0) {
    for (const measurement of measurementSet.measurements) {
      if (isMeasurement(measurement)) {
        const s = `${measurement.value} ${measurement.unitName} ${measurement.variableName} ${measurement.startTimeLocal} ${measurement.variableCategoryName}`;
        console.log(s);
        continue;
      }
      console.log(measurement);
    }
  }
}

module.exports = {
  processStatement,
  processStatements,
};

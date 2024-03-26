const { processStatement } = require('./src/lib/statement-2-measurements');

async function parseStatement() {
  const statement = "I have been feeling very tired and fatigued today. I have been having trouble concentrating and I have been feeling very down. I took a cold shower for 5 minutes and I took a 20 minute nap. I also took magnesium 200mg, Omega3 one capsule 500mg";
  const localDateTime = "2021-01-01T20:00:00"; // Example date and time
  const result = await processStatement(statement, localDateTime);
  console.log(result);
}

parseStatement();

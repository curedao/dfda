const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const { processStatement } = require('./src/lib/statement-2-measurements');
const session = require('express-session');
const app = express();
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = require('path');

// ...

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Route to render the form
app.get('/settings', (req, res) => {
  res.send(`
    <form action="/settings" method="POST">
      <label for="api_key">OpenAI API Key:</label><br>
      <input type="text" id="api_key" name="api_key"><br>
      <label for="model">OpenAI Model:</label><br>
      <select id="model" name="model">
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
        <option value="gpt-4">gpt-4</option>
        <option value="gpt-4-0125-preview">gpt-4-0125-preview</option>
      </select><br>
      <input type="submit" value="Submit">
    </form>
  `);
});

// Form submission handler
app.post('/settings', (req, res) => {
  // Store user's input in the session
  req.session.OPENAI_API_KEY = req.body.api_key;
  req.session.OPENAI_MODEL = req.body.model;
  res.redirect('/');
});

// Use OPENAI_API_KEY and OPENAI_MODEL in your OpenAI API calls

app.post('/parse', async (req, res) => {
  const statement = req.body.statement;
  // Before calling the OpenAI API
  const OPENAI_API_KEY = req.session.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = req.session.OPENAI_MODEL || process.env.OPENAI_MODEL;
  const apiKey = req.headers['t2m-api-key']; // Assuming the API key is sent in the headers

  // Check if T2M_API_KEY is set and matches the one in the request
  if (process.env.T2M_API_KEY && process.env.T2M_API_KEY !== apiKey) {
    return res.status(400).send('Invalid T2M_API_KEY');
  }
  const result = await processStatement(statement);
  res.send(result); // Pretty print the response
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at http://${os.hostname()}:${process.env.PORT || 3000}`);
});

app.use((req, res, next) => {
  console.log(`Request URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
});

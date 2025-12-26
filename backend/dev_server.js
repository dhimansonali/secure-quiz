#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Dynamic import of the SQL-only handler (no Firebase required)
async function getHandler() {
  const modPath = path.join(__dirname, 'api', 'sql_route.js');
  const mod = await import(modPath);
  return mod.default;
}

app.use('/api', async (req, res, next) => {
  try {
    const handler = await getHandler();
    await handler(req, res);
  } catch (err) {
    console.error('Dev server handler error:', err);
    res.status(500).json({ error: 'Dev server internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Dev server listening on http://localhost:${port}`);
});

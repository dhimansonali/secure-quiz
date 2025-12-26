import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import handler from './api/[[...route]].js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'Secure Quiz API running locally' }));

// Mount serverless handler for all /api/* requests
app.use('/api', async (req, res) => {
  try {
    // Prepend /api to the path for handler routing
    req.url = '/api' + req.path;
    await handler(req, res);
  } catch (err) {
    console.error('Handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// 404 for non-API routes
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`✓ Local API running at http://localhost:${PORT}`);
  console.log(`✓ Test at http://localhost:${PORT}/api/quiz/submit`);
});

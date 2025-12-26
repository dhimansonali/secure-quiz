// Simple test script to POST a sample quiz submission to the local API
// Requires Node 18+ (global fetch). Usage:
// node backend/test_submit.js

const url = process.env.API_URL || 'http://localhost:3000/api/quiz/submit';

async function sendTestSubmission() {
  const timestamp = Date.now();
  const email = `test.user+${timestamp}@example.com`;
  const payload = {
    email,
    name: 'Test User',
    answers: {
      '1': 'Leader',
      '2': 'Scholar',
      '3': 'Leader',
      '4': 'Achiever',
      '5': 'Leader',
      '6': 'Leader',
      '7': 'Scholar',
      '8': 'Achiever',
      '9': 'Leader',
      '10': 'Achiever'
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    console.log('Status:', res.status);
    console.log('Response:', data || '(no json)');
  } catch (err) {
    console.error('Request failed:', err.message || err);
  }
}

sendTestSubmission();

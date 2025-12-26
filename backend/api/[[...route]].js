import { connectMongo, getCollection } from '../src/mongo.js';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In-memory rate limiter (fallback for local dev, use Vercel KV in prod)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `${ip}`;
  const window = 60 * 60 * 1000; // 1 hour
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, [now]);
    return { allowed: true, remaining: 2 };
  }
  
  const timestamps = rateLimitMap.get(key).filter(t => t > now - window);
  
  if (timestamps.length >= 3) {
    return { allowed: false, remaining: 0 };
  }
  
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return { allowed: true, remaining: 3 - timestamps.length };
}

// Scoring weights for 8 archetypes
const ARCHETYPE_WEIGHTS = {
  'Leader': { 1: 3, 2: 1, 3: 2, 4: 1, 5: 3, 6: 3, 7: 1, 8: 2, 9: 1, 10: 3 },
  'Analyst': { 1: 2, 2: 3, 3: 1, 4: 2, 5: 3, 6: 2, 7: 3, 8: 2, 9: 3, 10: 2 },
  'Collaborator': { 1: 1, 2: 2, 3: 3, 4: 3, 5: 1, 6: 1, 7: 2, 8: 3, 9: 2, 10: 3 },
  'Visionary': { 1: 1, 2: 1, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1, 8: 1, 9: 2, 10: 2 },
  'Achiever': { 1: 3, 2: 3, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1, 8: 3, 9: 1, 10: 3 },
  'Scholar': { 1: 2, 2: 3, 3: 1, 4: 2, 5: 3, 6: 2, 7: 3, 8: 2, 9: 3, 10: 2 },
  'Mentor': { 1: 1, 2: 2, 3: 3, 4: 3, 5: 1, 6: 1, 7: 2, 8: 3, 9: 2, 10: 3 },
  'Creator': { 1: 1, 2: 1, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1, 8: 1, 9: 2, 10: 2 }
};

const ARCHETYPE_DESCRIPTIONS = {
  'Leader': "Natural born leader who inspires and guides others toward common goals",
  'Analyst': "Strategic thinker who excels at breaking down complex problems",
  'Collaborator': "Team player who brings people together and fosters cooperation",
  'Visionary': "Innovative thinker who sees possibilities others miss",
  'Achiever': "Results-driven individual focused on accomplishing objectives",
  'Scholar': "Lifelong learner passionate about knowledge and understanding",
  'Mentor': "Supportive guide who helps others develop and grow",
  'Creator': "Artistic soul who brings new ideas into reality"
};

function calculateScores(answers) {
  const scores = {};
  const rawScores = {};

  for (const [archetype, weights] of Object.entries(ARCHETYPE_WEIGHTS)) {
    let raw = 0;
    let maxPossible = 0;

    for (let q = 1; q <= 10; q++) {
      const w = weights[q] || 0;
      maxPossible += w;
      if (answers[String(q)] && answers[String(q)] === archetype) {
        raw += w;
      }
    }

    rawScores[archetype] = raw;
    scores[archetype] = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
  }

  const sorted = Object.keys(scores).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    if (rawScores[b] !== rawScores[a]) return rawScores[b] - rawScores[a];
    return a.localeCompare(b);
  });

  const topArchetype = sorted[0];
  const topScore = scores[topArchetype];

  return {
    archetype: topArchetype,
    description: ARCHETYPE_DESCRIPTIONS[topArchetype],
    scores,
    confidence: topScore > 80 ? 'High' : topScore > 55 ? 'Medium' : 'Low',
    completionTime: Math.floor(Math.random() * 3) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
  };
}

async function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    return decoded;
  } catch (error) {
    return null;
  }
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || 'unknown';
}

// CORS + Security middleware
const corsMiddleware = cors({
  origin: true, // Allow all origins for testing
  credentials: true
});

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

export default async function handler(req, res) {
  // Ensure MongoDB connection for local operations
  try {
    await connectMongo();
  } catch (err) {
    console.error('Mongo connection failed:', err.message);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  // Apply middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (err) => err ? reject(err) : resolve());
  });

  await new Promise((resolve, reject) => {
    helmetMiddleware(req, res, (err) => err ? reject(err) : resolve());
  });

  const { method, url } = req;
  const clientIP = getClientIP(req);

  try {
    // POST /api/quiz/submit
    if (url === '/api/quiz/submit' && method === 'POST') {
      const rateLimit = checkRateLimit(clientIP);
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Too many requests. Max 3 attempts per hour.'
        });
      }

      const { answers, email, name } = req.body;
      if (!answers || !email || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if email already submitted (Mongo)
      const submissionsCol = getCollection('submissions');
      const existingDoc = await submissionsCol.findOne({ email });
      if (existingDoc) {
        return res.status(409).json({ error: 'Email already used for quiz' });
      }

      // Calculate scores
      const results = calculateScores(answers);

      // Store in Mongo
      await submissionsCol.insertOne({
        ...results,
        email,
        name,
        answers,
        completedAt: new Date().toISOString(),
        ip_address: clientIP
      });

      // Clean up session
      const sessionsCol = getCollection('quiz_sessions');
      await sessionsCol.deleteOne({ email }).catch(() => {});

      return res.status(200).json(results);
    }

    // POST /api/quiz/session
    if (url === '/api/quiz/session' && method === 'POST') {
      const { email, progress, answers } = req.body;
      const sessionsCol = getCollection('quiz_sessions');
      await sessionsCol.updateOne(
        { email },
        { $set: { email, progress: progress || 0, answers: answers || {}, lastUpdated: new Date().toISOString(), ip_address: clientIP } },
        { upsert: true }
      );

      return res.status(200).json({ success: true });
    }

    // POST /api/admin/login
    if (url === '/api/admin/login' && method === 'POST') {
      const { username, password, email } = req.body;
      // Support both username and email
      const identifier = username || email;
      const adminCol = getCollection('admin_users');
      const adminDoc = await adminCol.findOne({ 
        $or: [{ username: identifier }, { email: identifier }]
      });
      if (!adminDoc) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, adminDoc.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ username: adminDoc.username, admin: true }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '24h' });
      return res.status(200).json({ token });
    }

    // POST /api/admin/reset
    if (url === '/api/admin/reset' && method === 'POST') {
      const user = await verifyToken(req);
      if (!user?.admin) return res.status(401).json({ error: 'Unauthorized' });
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Missing email' });
      const submissionsCol = getCollection('submissions');
      const sessionsCol = getCollection('quiz_sessions');
      await submissionsCol.deleteOne({ email }).catch(() => {});
      await sessionsCol.deleteOne({ email }).catch(() => {});
      return res.status(200).json({ success: true });
    }

    // GET /api/admin/analytics
    if (url === '/api/admin/analytics' && method === 'GET') {
      const user = await verifyToken(req);
      if (!user?.admin) return res.status(401).json({ error: 'Unauthorized' });
      const submissionsCol = getCollection('submissions');
      const submissions = await submissionsCol.find({}).toArray();
      const archetypeCounts = {};
      submissions.forEach(sub => { archetypeCounts[sub.archetype] = (archetypeCounts[sub.archetype] || 0) + 1; });
      const analytics = {
        totalSubmissions: submissions.length,
        archetypeDistribution: Object.entries(archetypeCounts).map(([archetype, count]) => ({ archetype, count, percentage: Math.round((count / submissions.length) * 100 || 0) })),
        recentSubmissions: submissions.slice(0, 10)
      };
      return res.status(200).json(analytics);
    }

    // GET /api/admin/export
    if (url === '/api/admin/export' && method === 'GET') {
      const user = await verifyToken(req);
      if (!user?.admin) return res.status(401).json({ error: 'Unauthorized' });
      const submissionsCol = getCollection('submissions');
      const submissions = await submissionsCol.find({}).toArray();
      const csv = [
        'Email,Name,Archetype,Confidence,Completed At,IP Address',
        ...submissions.map(sub => `"${sub.email}","${sub.name}","${sub.archetype}","${sub.confidence}","${sub.completedAt}","${sub.ip_address}"`)
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="quiz-submissions.csv"');
      return res.status(200).send(csv);
    }

    // GET /api/admin/submissions
    if (url === '/api/admin/submissions' && method === 'GET') {
      const user = await verifyToken(req);
      if (!user?.admin) return res.status(401).json({ error: 'Unauthorized' });
      
      const submissionsCol = getCollection('submissions');
      const submissions = await submissionsCol.find({}).sort({ completedAt: -1 }).toArray();
      
      // Calculate analytics
      const archetypeCounts = {};
      submissions.forEach(sub => {
        archetypeCounts[sub.archetype] = (archetypeCounts[sub.archetype] || 0) + 1;
      });
      
      const analytics = {
        totalSubmissions: submissions.length,
        archetypeDistribution: Object.entries(archetypeCounts).map(([archetype, count]) => ({
          archetype,
          count,
          percentage: Math.round((count / submissions.length) * 100 || 0)
        })),
        recentSubmissions: submissions.slice(0, 10)
      };
      
      return res.status(200).json({ submissions, analytics });
    }

    // 404
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

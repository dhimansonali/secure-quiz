// SQL-only API route (no Firebase required)
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.SQL_HOST || 'localhost',
  port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
  user: process.env.SQL_USER || 'root',
  password: process.env.SQL_PASSWORD || 'redhat',
  database: process.env.SQL_DATABASE || 'db_secureQuiz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Security middleware
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
];

// Scoring matrix for 8 archetypes
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    return decoded;
  } catch (error) {
    return null;
  }
}

async function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  // Apply security middleware
  for (const middleware of securityMiddleware) {
    await new Promise((resolve, reject) => {
      middleware(req, res, (err) => err ? reject(err) : resolve());
    });
  }

  const { method, url } = req;
  const clientIP = await getClientIP(req);

  try {
    if (url === '/api/quiz/submit' && method === 'POST') {
      const { answers, email, name } = req.body;
      
      if (!answers || !email || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const conn = await pool.getConnection();
      try {
        // Check if email already exists
        const [existing] = await conn.query('SELECT * FROM submissions WHERE email = ?', [email]);
        if (existing.length > 0) {
          return res.status(409).json({ error: 'Email already used for quiz' });
        }

        // Calculate results
        const results = calculateScores(answers);

        // Store in database
        await conn.query(
          'INSERT INTO submissions (email, name, archetype, answers, scores, completedAt, ip_address) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
          [
            email,
            name,
            results.archetype,
            JSON.stringify(answers),
            JSON.stringify(results.scores),
            clientIP
          ]
        );

        res.status(200).json(results);
      } finally {
        conn.release();
      }
    }

    else if (url === '/api/quiz/session' && method === 'POST') {
      const { email, progress, answers } = req.body;
      
      const conn = await pool.getConnection();
      try {
        await conn.query(
          'REPLACE INTO quiz_sessions (email, progress, answers, ip_address) VALUES (?, ?, ?, ?)',
          [email, progress || 0, JSON.stringify(answers || {}), clientIP]
        );

        res.status(200).json({ success: true });
      } finally {
        conn.release();
      }
    }

    else if (url === '/api/admin/login' && method === 'POST') {
      const { username, password } = req.body;
      
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query('SELECT * FROM admin_users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, rows[0].password);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { username, admin: true }, 
          process.env.JWT_SECRET || 'default-secret', 
          { expiresIn: '24h' }
        );

        res.status(200).json({ token });
      } finally {
        conn.release();
      }
    }

    else if (url.startsWith('/api/admin/reset') && method === 'POST') {
      const user = await verifyToken(req);
      if (!user || !user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Missing email' });

      const conn = await pool.getConnection();
      try {
        await conn.query('DELETE FROM submissions WHERE email = ?', [email]);
        await conn.query('DELETE FROM quiz_sessions WHERE email = ?', [email]);

        return res.status(200).json({ success: true });
      } finally {
        conn.release();
      }
    }

    else if (url.startsWith('/api/admin') && method === 'GET') {
      const user = await verifyToken(req);
      if (!user || !user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const conn = await pool.getConnection();
      try {
        if (url === '/api/admin/submissions') {
          const [submissions] = await conn.query(
            'SELECT * FROM submissions ORDER BY completedAt DESC'
          );

          res.status(200).json(submissions);
        }

        else if (url === '/api/admin/analytics') {
          const [submissions] = await conn.query('SELECT * FROM submissions');
          
          const archetypeCounts = {};
          const totalSubmissions = submissions.length;
          
          submissions.forEach(sub => {
            archetypeCounts[sub.archetype] = (archetypeCounts[sub.archetype] || 0) + 1;
          });

          const analytics = {
            totalSubmissions,
            archetypeDistribution: Object.entries(archetypeCounts).map(([archetype, count]) => ({
              archetype,
              count,
              percentage: Math.round((count / totalSubmissions) * 100)
            })),
            recentSubmissions: submissions.slice(0, 10)
          };

          res.status(200).json(analytics);
        }

        else if (url.startsWith('/api/admin/export')) {
          const [submissions] = await conn.query('SELECT * FROM submissions');

          const csv = [
            'Email,Name,Archetype,Confidence,Completed At,IP Address',
            ...submissions.map(sub => 
              `"${sub.email}","${sub.name}","${sub.archetype}","${sub.confidence}","${sub.completedAt}","${sub.ip_address}"`
            )
          ].join('\n');

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="quiz-submissions.csv"');
          res.status(200).send(csv);
        }
      } finally {
        conn.release();
      }
    }

    else {
      res.status(404).json({ error: 'Endpoint not found' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

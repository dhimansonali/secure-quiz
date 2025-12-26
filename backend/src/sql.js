import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.SQL_HOST || 'localhost',
  port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
  user: process.env.SQL_USER || 'root',
  password: process.env.SQL_PASSWORD || '',
  database: process.env.SQL_DATABASE || 'db_secureQuiz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function insertSubmission(submission) {
  const { email, name, archetype, answers, scores, completedAt, ip_address } = submission;
  const sql = `REPLACE INTO submissions (email, name, archetype, answers, scores, completedAt, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    email,
    name || null,
    archetype || null,
    JSON.stringify(answers || {}),
    JSON.stringify(scores || {}),
    completedAt ? new Date(completedAt) : null,
    ip_address || null
  ];

  const conn = await pool.getConnection();
  try {
    await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

export default pool;

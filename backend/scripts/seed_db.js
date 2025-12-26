import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectMongo, getCollection, closeMongo } from '../src/mongo.js';

dotenv.config();

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password123';

async function main() {
  try {
    await connectMongo();
    const adminCol = getCollection('admin_users');
    const submissionsCol = getCollection('submissions');
    const sessionsCol = getCollection('quiz_sessions');

    console.log('Creating indexes...');
    await adminCol.createIndex({ username: 1 }, { unique: true }).catch(() => {});
    await submissionsCol.createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await sessionsCol.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    console.log(`Upserting admin user: ${ADMIN_USER}`);
    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    await adminCol.updateOne(
      { username: ADMIN_USER },
      { $set: { username: ADMIN_USER, password: hashed, createdAt: new Date().toISOString() } },
      { upsert: true }
    );

    console.log('Seed complete. Admin credentials:');
    console.log(`  username: ${ADMIN_USER}`);
    console.log(`  password: ${ADMIN_PASS}`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await closeMongo().catch(() => {});
  }
}

main();

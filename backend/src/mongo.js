import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB || 'secure_quiz';

let client;
let db;

export async function connectMongo() {
  if (db) return { client, db };
  client = new MongoClient(MONGO_URI, { connectTimeoutMS: 10000 });
  await client.connect();
  db = client.db(DB_NAME);
  return { client, db };
}

export function getDb() {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
  return db;
}

export function getCollection(name) {
  return getDb().collection(name);
}

export async function closeMongo() {
  if (client) await client.close();
  client = null;
  db = null;
}

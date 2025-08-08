import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const uri = process.env.MONGODB_URI;
const dbName = 'deineDatenbankName'; // Passe das an

if (!uri) {
  throw new Error('MONGODB_URI ist nicht definiert. Bitte in Vercel Settings als Environment Variable setzen.');
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Nur GET erlaubt' });
    return;
  }

  try {
    const { db } = await connectToDatabase();

    // Beispiel: Alle Einträge aus Collection "leaderboard" holen, sortiert nach "score" absteigend
    const leaderboard = await db
      .collection('leaderboard')
      .find({})
      .sort({ score: -1 })
      .toArray();

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

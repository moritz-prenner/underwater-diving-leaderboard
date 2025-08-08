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
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const leaderboard = await db
        .collection('leaderboard')
        .find({})
        .sort({ score: -1 }) // Oder sortiere nach "time" je nach Schema
        .toArray();

      res.status(200).json({ leaderboard });
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();

      const { username, time } = req.body;

      if (!username || !time) {
        res.status(400).json({ error: 'username und time werden benötigt' });
        return;
      }

      // Beispiel: Speichere Score als Zahl, passe an dein Schema an
      const score = Number(time); 

      await db.collection('leaderboard').insertOne({
        username,
        time: score,
        createdAt: new Date()
      });

      res.status(201).json({ message: 'Score gespeichert' });
    } catch (error) {
      console.error('Fehler beim Speichern des Scores:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  } 
  else {
    res.status(405).json({ error: 'Nur GET und POST erlaubt' });
  }
}


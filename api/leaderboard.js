import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const uri = process.env.MONGODB_URI;
const dbName = 'deineDatenbankName'; // Passe den Namen deiner Datenbank an

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
  console.log('Methode:', req.method);

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const leaderboard = await db
        .collection('leaderboard')
        .find({})
        .sort({ time: 1 }) // Sortiere nach Zeit aufsteigend (schnellste zuerst)
        .toArray();

      console.log('GET Leaderboard:', leaderboard);

      res.status(200).json({ leaderboard });
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const { username, time } = req.body;

      if (!username || !time) {
        res.status(400).json({ error: 'username und time werden benötigt' });
        return;
      }

      const score = Number(time);

      const { db } = await connectToDatabase();
      await db.collection('leaderboard').insertOne({
        username,
        time: score,
        createdAt: new Date()
      });

      res.status(201).json({ message: 'Score gespeichert' });
    } catch (err) {
      console.error('Fehler beim Parsen oder Speichern:', err);
      res.status(500).json({ error: 'Fehler beim Parsen oder Speichern' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Methode ${req.method} nicht erlaubt` });
  }
}

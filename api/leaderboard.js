import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const uri = process.env.MONGODB_URI;
const dbName = 'underwater_diving_stats'; // Passe den Namen deiner DB an

if (!uri) {
  throw new Error('MONGODB_URI ist nicht definiert. Bitte in Vercel Settings als Environment Variable setzen.');
}

function parseTimeToMs(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const min = Number(parts[0]);
    const sec = Number(parts[1]);
    return Math.round(min * 60000 + sec * 1000);
  } else {
    return Math.round(Number(timeStr) * 1000);
  }
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
        .sort({ time: 1 }) // aufsteigend nach Zeit
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

      const score = parseTimeToMs(time);

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

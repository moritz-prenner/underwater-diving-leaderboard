import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await client.connect();
  cachedDb = client.db('leaderboardDB');
  return cachedDb;
}

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const scores = db.collection('scores');

  if (req.method === 'GET') {
    const leaderboard = await scores.find().sort({ time: 1 }).limit(10).toArray();
    res.status(200).json(leaderboard);
  } else if (req.method === 'POST') {
    const { username, time } = req.body;
    if (!username || time === undefined) {
      return res.status(400).json({ error: 'Username und Zeit erforderlich' });
    }
    await scores.insertOne({ username, time: Number(time) });
    res.status(201).json({ message: 'Score gespeichert' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Methode ${req.method} nicht erlaubt`);
  }
}

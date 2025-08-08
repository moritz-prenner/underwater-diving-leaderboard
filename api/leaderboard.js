import mongoose from 'mongoose';

// MongoDB-Verbindung zwischenspeichern (Vercel optimiert so)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Schema und Modell
const ScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  time: { type: String, required: true }, // z. B. "01:23.456"
  submittedAt: { type: Date, default: Date.now }
});

const Score = mongoose.models.Score || mongoose.model('Score', ScoreSchema);

// API-Handler
export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { username, time } = req.body;

    if (!username || !time) {
      return res.status(400).json({ message: 'Fehlende Daten: username oder time' });
    }

    try {
      const newScore = await Score.create({ username, time });
      return res.status(201).json({ message: 'Score gespeichert', data: newScore });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return res.status(500).json({ message: 'Serverfehler beim Speichern' });
    }
  }

  if (req.method === 'GET') {
    try {
      const scores = await Score.find().sort({ submittedAt: -1 }).lean();
      return res.status(200).json(scores);
    } catch (error) {
      console.error('Fehler beim Abrufen:', error);
      return res.status(500).json({ message: 'Serverfehler beim Abrufen' });
    }
  }

  // Wenn weder POST noch GET
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Methode ${req.method} nicht erlaubt`);
}

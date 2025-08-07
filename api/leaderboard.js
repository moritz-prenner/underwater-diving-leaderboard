let leaderboard = [
  { username: "Moritz", time: 92.4 },
  { username: "Max", time: 105.2 }
];

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(leaderboard);
  } else if (req.method === "POST") {
    const { username, time } = req.body;
    if (!username || !time) {
      return res.status(400).json({ error: "Username und Zeit erforderlich" });
    }
    leaderboard.push({ username, time: Number(time) });
    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);
    res.status(201).json({ message: "Erfolgreich hinzugefügt", leaderboard });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Methode ${req.method} nicht erlaubt`);
  }
}

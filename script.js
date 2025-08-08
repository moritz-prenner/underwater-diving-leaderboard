const API_URL = '/api/leaderboard';
const leaderboardBody = document.getElementById('mainRows');

async function fetchLeaderboard() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Fehler: ' + response.status);

    const data = await response.json();

    // Test: Wenn keine Daten, Dummy einfügen
    if (!data.leaderboard || data.leaderboard.length === 0) {
      renderLeaderboard([{ username: 'Keine Daten', time: 0 }]);
      return;
    }

    // Sortieren nach Zeit (Zeit ist Zahl in Sekunden)
    const sorted = data.leaderboard.sort((a, b) => a.time - b.time);

    renderLeaderboard(sorted);
  } catch (err) {
    console.error(err);
  }
}

function renderLeaderboard(entries) {
  leaderboardBody.innerHTML = '';

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.username}</td>
      <td>${formatTime(entry.time)}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

function formatTime(ms) {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '00:00.000';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return (
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + '.' +
    String(milliseconds).padStart(3, '0')
  );
}

document.addEventListener('DOMContentLoaded', fetchLeaderboard);

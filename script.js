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

function formatTime(seconds) {
    return seconds
}

document.addEventListener('DOMContentLoaded', fetchLeaderboard);

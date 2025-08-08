// API-Endpunkt (anpassen falls du lokal entwickelst)
const API_URL = '/api/leaderboard'; // Vercel erkennt diesen Pfad korrekt

// Tabellelemente aus dem DOM holen
const leaderboardBody = document.getElementById('mainRows');

async function fetchLeaderboard() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Daten: ${response.status}`);
        }

        const data = await response.json();

        // Sortieren: schnellste Zeit = oben
        const sorted = data.sort((a, b) => {
            // Zeit-Strings wie "01:23.456" müssen in Millisekunden umgerechnet werden
            return parseTimeToMs(a.time) - parseTimeToMs(b.time);
        });

        renderLeaderboard(sorted);

    } catch (error) {
        console.error('Fehler:', error);
    }
}

function parseTimeToMs(timeStr) {
    // Format: "mm:ss.mmm" oder "m:ss.mmm"
    const match = timeStr.match(/(\d+):(\d{2})\.(\d{1,3})/);
    if (!match) return Number.MAX_SAFE_INTEGER;

    const [, min, sec, ms] = match.map(Number);
    return (min * 60 * 1000) + (sec * 1000) + ms;
}

function renderLeaderboard(entries) {
    leaderboardBody.innerHTML = ''; // Bestehende Zeilen löschen

    entries.forEach((entry, index) => {
        const row = document.createElement('tr');

        const placeCell = document.createElement('td');
        placeCell.textContent = index + 1;

        const userCell = document.createElement('td');
        userCell.textContent = entry.username;

        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;

        row.appendChild(placeCell);
        row.appendChild(userCell);
        row.appendChild(timeCell);

        leaderboardBody.appendChild(row);
    });
}

// Beim Laden der Seite sofort abrufen
document.addEventListener('DOMContentLoaded', fetchLeaderboard);

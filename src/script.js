async function loadLeaderboard() {
  const res = await fetch("/api/leaderboard.js");
  const data = await res.json();

  const tbody = document.getElementById("leaderboard").querySelector("tbody");
  tbody.innerHTML = ""; 

  data.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${entry.username}</td><td>${entry.time.toFixed(2)}</td>`;
    tbody.appendChild(row);
  });
}

window.onload = loadLeaderboard;

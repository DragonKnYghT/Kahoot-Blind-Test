// js/host.js — Logique hôte avec Firebase temps réel

let roomRef, roomCode;
let currentSongIndex = -1;
let timerInterval = null;
let players = {};

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
  roomCode = generateCode();
  roomRef = db.ref("rooms/" + roomCode);

  // Initialiser la room
  roomRef.set({
    phase: "lobby",
    currentSong: -1,
    createdAt: Date.now()
  });

  // Supprimer la room quand l'hôte ferme la page
  roomRef.onDisconnect().remove();

  // Afficher le code + QR
  document.getElementById("room-code-display").textContent = roomCode;
  const playerUrl = window.location.origin + window.location.pathname.replace("host.html", "player.html");
  const joinUrl = playerUrl + "?code=" + roomCode;
  document.getElementById("join-url-display").textContent = joinUrl.replace("https://", "");

  new QRCode(document.getElementById("qr-container"), {
    text: joinUrl, width: 160, height: 160,
    colorDark: "#000000", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  // Écouter les joueurs en temps réel
  roomRef.child("players").on("value", snap => {
    players = snap.val() || {};
    renderPlayersLobby();
    renderLiveScores();
    renderAnswersLive();
  });

  drawIdleVisualizer();
});

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ---- RENDER LOBBY ----
function renderPlayersLobby() {
  const count = Object.keys(players).length;
  document.getElementById("player-count").textContent = count;
  document.getElementById("start-btn").disabled = count === 0;

  const grid = document.getElementById("players-grid");
  grid.innerHTML = "";
  Object.values(players).forEach(p => {
    const div = document.createElement("div");
    div.className = "player-card";
    div.innerHTML = `
      <div class="online-dot"></div>
      <div class="player-avatar-display">${p.avatar}</div>
      <div class="player-name-display">${p.name}</div>
      <div class="player-score-display">${p.score || 0} pts</div>`;
    grid.appendChild(div);
  });
}

// ---- RENDER LIVE SCORES (pendant jeu) ----
function renderLiveScores() {
  const container = document.getElementById("live-scores");
  if (!container) return;
  container.innerHTML = "";
  Object.values(players)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .forEach(p => {
      const pill = document.createElement("div");
      pill.className = "score-pill";
      pill.innerHTML = `<span>${p.avatar}</span><span>${p.name}</span><span class="s-pts">${p.score || 0}</span>`;
      container.appendChild(pill);
    });
}

// ---- RENDER ANSWERS LIVE ----
function renderAnswersLive() {
  const container = document.getElementById("answers-live");
  if (!container) return;
  container.innerHTML = "";
  Object.values(players).forEach(p => {
    const ans = p.answers && p.answers["s" + currentSongIndex];
    const chip = document.createElement("div");
    chip.className = "answer-chip" + (ans ? " answered" : "");
    chip.innerHTML = `<span>${p.avatar}</span><span>${p.name}</span>`;
    container.appendChild(chip);
  });
}

// ---- DÉMARRER ----
function hostStartGame() {
  currentSongIndex = 0;
  roomRef.update({ phase: "playing", currentSong: 0 });
  showScreen("s-game");
  loadSong();
  startTimer();
}

function loadSong() {
  const song = SONGS[currentSongIndex];
  document.getElementById("song-number").textContent =
    `Musique ${currentSongIndex + 1} / ${SONGS.length}`;

  if (song.file) {
    loadAudio(song.file)
      .then(() => playAudio(song.previewDuration || 30))
      .catch(() => {
        document.getElementById("audio-status-text").textContent = "⚠ Fichier audio introuvable";
        drawIdleVisualizer();
      });
  } else {
    drawIdleVisualizer();
  }
  renderAnswersLive();
}

function startTimer() {
  clearInterval(timerInterval);
  let t = GAME_CONFIG.answerTimeSeconds;
  const bar = document.getElementById("timer-bar");
  const display = document.getElementById("timer-display");
  bar.style.width = "100%";
  bar.style.background = "var(--accent)";
  display.textContent = t;

  timerInterval = setInterval(() => {
    t--;
    display.textContent = t;
    const pct = (t / GAME_CONFIG.answerTimeSeconds) * 100;
    bar.style.width = pct + "%";
    if (pct < 30) bar.style.background = "var(--red)";
    else if (pct < 60) bar.style.background = "var(--yellow)";
    if (t <= 0) { clearInterval(timerInterval); hostReveal(); }
  }, 1000);
}

// ---- RÉVÉLER ----
function hostReveal() {
  clearInterval(timerInterval);
  stopAudio();

  const song = SONGS[currentSongIndex];

  // Calculer et sauvegarder les scores de chaque joueur
  const updates = {};
  Object.values(players).forEach(p => {
    const ans = p.answers && p.answers["s" + currentSongIndex];
    if (ans) {
      const { points } = calcPoints(ans.artist || "", ans.title || "", song);
      const newScore = (p.score || 0) + points;
      updates[`players/${p.id}/score`] = newScore;
      updates[`players/${p.id}/answers/s${currentSongIndex}/points`] = points;
    }
  });
  updates["phase"] = "reveal";
  updates["currentSong"] = currentSongIndex;
  roomRef.update(updates);

  // Afficher la révélation
  showScreen("s-reveal");
  document.getElementById("reveal-title").textContent = song.title;
  document.getElementById("reveal-artist").textContent = song.artist;

  // Attendre que Firebase update les scores puis afficher
  setTimeout(() => {
    roomRef.child("players").once("value", snap => {
      const updatedPlayers = snap.val() || {};
      renderRevealAnswers(updatedPlayers, song);
      renderLiveScores();
    });
  }, 500);

  const isLast = currentSongIndex >= SONGS.length - 1;
  document.getElementById("next-btn").textContent = isLast ? "Voir le classement 🏆" : "Musique suivante →";
}

function renderRevealAnswers(updatedPlayers, song) {
  const container = document.getElementById("reveal-answers");
  container.innerHTML = "";
  Object.values(updatedPlayers)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .forEach(p => {
      const ans = p.answers && p.answers["s" + currentSongIndex];
      const pts = (ans && ans.points) || 0;
      const row = document.createElement("div");
      row.className = "reveal-row";
      row.innerHTML = `
        <span class="reveal-avatar">${p.avatar}</span>
        <span class="reveal-name">${p.name}</span>
        <span class="reveal-answer-text">
          ${ans ? `🎤 ${ans.artist || '—'} · 🎵 ${ans.title || '—'}` : '<em>Pas de réponse</em>'}
        </span>
        <span class="reveal-pts ${pts >= GAME_CONFIG.pointsBothCorrect ? 'pts-full' : pts >= 1 ? 'pts-half' : 'pts-none'}">
          +${pts}
        </span>`;
      container.appendChild(row);
    });
}

// ---- CHANSON SUIVANTE ----
function hostNextSong() {
  currentSongIndex++;
  if (currentSongIndex >= SONGS.length) {
    showFinal();
    return;
  }
  roomRef.update({ phase: "playing", currentSong: currentSongIndex });
  showScreen("s-game");
  loadSong();
  startTimer();
}

// ---- FINAL ----
function showFinal() {
  roomRef.update({ phase: "final" });
  showScreen("s-final");

  roomRef.child("players").once("value", snap => {
    const lb = Object.values(snap.val() || {})
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    roomRef.update({ leaderboard: lb });

    // Podium
    const podium = document.getElementById("podium");
    podium.innerHTML = "";
    const order = [1, 0, 2];
    const classes = ["p2", "p1", "p3"];
    const medals = ["🥈", "🥇", "🥉"];
    order.forEach((idx, pos) => {
      const p = lb[idx];
      if (!p) return;
      const div = document.createElement("div");
      div.className = "podium-place";
      div.innerHTML = `
        <div class="podium-av">${p.avatar}</div>
        <div class="podium-nm">${p.name}</div>
        <div class="podium-block ${classes[pos]}">
          <div class="podium-rank">${medals[pos]}</div>
          <div class="podium-score">${p.score || 0} pts</div>
        </div>`;
      podium.appendChild(div);
    });

    // Reste du classement
    const full = document.getElementById("full-leaderboard");
    full.innerHTML = "";
    lb.slice(3).forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.innerHTML = `
        <span class="lb-rank">${i + 4}</span>
        <span class="lb-av">${p.avatar}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">${p.score || 0} pts</span>`;
      full.appendChild(row);
    });
  });
}

function hostRestart() {
  roomRef.remove();
  location.reload();
}

// ---- UTILS ----
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

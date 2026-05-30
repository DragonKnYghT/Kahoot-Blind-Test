// js/host.js — Logique de l'hôte (celui qui présente)

const game = new BlindTestGame();
let timerInterval = null;

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
  clearState();
  setState("roomCode", game.roomCode);
  setState("phase", "lobby");
  setState("players", {});

  document.getElementById("room-code-display").textContent = game.roomCode;

  const playerUrl = window.location.origin + window.location.pathname.replace("host.html", "player.html");
  const joinUrl = playerUrl + "?code=" + game.roomCode;
  document.getElementById("join-url-display").textContent = playerUrl.replace("https://","");

  // QR Code
  new QRCode(document.getElementById("qr-container"), {
    text: joinUrl,
    width: 160,
    height: 160,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  // Écouter les joueurs qui rejoignent
  on("player_join", (player) => {
    game.addPlayer(player.id, player.name, player.avatar);
    updateLobbyUI();
    setState("players", game.players);
    emit("lobby_update", { players: game.players });
  });

  on("player_answer", ({ playerId, artist, title, songIndex }) => {
    if (songIndex !== game.currentSong) return;
    const pts = game.submitAnswer(playerId, artist, title);
    updateAnswersLive();
    setState("players", game.players);
  });

  drawIdleVisualizer();
});

function updateLobbyUI() {
  const count = Object.keys(game.players).length;
  document.getElementById("player-count").textContent = count;
  document.getElementById("start-btn").disabled = count === 0;

  const grid = document.getElementById("players-grid");
  grid.innerHTML = "";
  Object.values(game.players).forEach(p => {
    const div = document.createElement("div");
    div.className = "player-card";
    div.innerHTML = `<div class="player-avatar-display">${p.avatar}</div>
                     <div class="player-name-display">${p.name}</div>`;
    grid.appendChild(div);
  });
}

// ---- DÉMARRER LA PARTIE ----
function hostStartGame() {
  const song = game.startNextSong();
  if (!song) return;

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  setState("phase", "playing");
  setState("currentSong", game.currentSong);
  emit("game_start", { songIndex: game.currentSong });

  loadSong(song);
  startTimer();
}

function loadSong(song) {
  const num = game.currentSong + 1;
  document.getElementById("song-number").textContent = `Musique ${num} / ${SONGS.length}`;
  document.getElementById("audio-status-text").textContent = "Lecture en cours…";

  // Charger et jouer l'audio
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

  updateAnswersLive();
}

function startTimer() {
  clearInterval(timerInterval);
  let t = GAME_CONFIG.answerTimeSeconds;
  const bar = document.getElementById("timer-bar");
  const display = document.getElementById("timer-display");

  bar.style.width = "100%";
  bar.style.background = "var(--accent)";
  display.textContent = t;

  setState("timerStart", Date.now());
  setState("timerDuration", t);

  timerInterval = setInterval(() => {
    t--;
    display.textContent = t;
    const pct = (t / GAME_CONFIG.answerTimeSeconds) * 100;
    bar.style.width = pct + "%";
    if (pct < 30) bar.style.background = "var(--red)";
    else if (pct < 60) bar.style.background = "var(--yellow)";
    if (t <= 0) {
      clearInterval(timerInterval);
      hostReveal();
    }
  }, 1000);
}

function updateAnswersLive() {
  const container = document.getElementById("answers-live");
  container.innerHTML = "";
  Object.values(game.players).forEach(p => {
    const answered = p.answers[game.currentSong] !== undefined && p.answers[game.currentSong] !== null;
    const chip = document.createElement("div");
    chip.className = "answer-chip" + (answered ? " answered" : "");
    chip.innerHTML = `<span class="chip-avatar">${p.avatar}</span><span>${p.name}</span>`;
    container.appendChild(chip);
  });
}

// ---- RÉVÉLATION ----
function hostReveal() {
  clearInterval(timerInterval);
  stopAudio();

  const song = SONGS[game.currentSong];
  game.phase = "reveal";
  setState("phase", "reveal");
  setState("players", game.players);
  emit("song_reveal", { song, players: game.players, songIndex: game.currentSong });

  document.getElementById("game-screen").style.display = "none";
  document.getElementById("reveal-screen").style.display = "flex";
  document.getElementById("reveal-title").textContent = song.title;
  document.getElementById("reveal-artist").textContent = song.artist;

  // Afficher les résultats par joueur
  const container = document.getElementById("reveal-answers");
  container.innerHTML = "";
  const lb = game.getLeaderboard();
  lb.forEach(p => {
    const ans = p.answers[game.currentSong];
    const pts = ans ? ans.points : 0;
    const row = document.createElement("div");
    row.className = "reveal-row";
    row.innerHTML = `
      <span class="reveal-avatar">${p.avatar}</span>
      <span class="reveal-name">${p.name}</span>
      <span class="reveal-answer-text">
        ${ans ? `🎤 ${ans.artist || '—'} · 🎵 ${ans.title || '—'}` : 'Pas de réponse'}
      </span>
      <span class="reveal-pts ${pts >= 4 ? 'pts-full' : pts >= 1 ? 'pts-half' : 'pts-none'}">
        +${pts}
      </span>`;
    container.appendChild(row);
  });

  const isLast = game.currentSong >= SONGS.length - 1;
  document.getElementById("next-btn").textContent = isLast ? "Voir le classement final 🏆" : "Musique suivante →";
}

// ---- CHANSON SUIVANTE ----
function hostNextSong() {
  const song = game.startNextSong();
  if (!song) {
    showFinal();
    return;
  }

  document.getElementById("reveal-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  setState("phase", "playing");
  setState("currentSong", game.currentSong);
  emit("next_song", { songIndex: game.currentSong });

  loadSong(song);
  startTimer();
}

// ---- CLASSEMENT FINAL ----
function showFinal() {
  document.getElementById("reveal-screen").style.display = "none";
  document.getElementById("final-screen").style.display = "flex";

  const lb = game.getLeaderboard();
  setState("phase", "final");
  setState("leaderboard", lb);
  emit("game_final", { leaderboard: lb });

  // Podium (top 3)
  const podium = document.getElementById("podium");
  podium.innerHTML = "";
  const order = [1, 0, 2]; // 2e, 1er, 3e (visuel podium)
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
        <div class="podium-score">${p.score} pts</div>
      </div>`;
    podium.appendChild(div);
  });

  // Classement complet (à partir du 4e)
  const full = document.getElementById("full-leaderboard");
  full.innerHTML = "";
  lb.slice(3).forEach(p => {
    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `
      <span class="lb-rank">${p.rank}</span>
      <span class="lb-av">${p.avatar}</span>
      <span class="lb-name">${p.name}</span>
      <span class="lb-score">${p.score} pts</span>`;
    full.appendChild(row);
  });
}

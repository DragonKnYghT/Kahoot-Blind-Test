// js/player.js — Logique côté joueur (téléphone)

const PLAYER_ID = "p_" + Math.random().toString(36).substr(2, 8);
let myName = "";
let myAvatar = "";
let myScore = 0;
let selectedAvatar = AVATARS[0];
let currentSongIndex = -1;
let timerInterval = null;

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
  // Pré-remplir le code depuis l'URL
  const params = new URLSearchParams(window.location.search);
  if (params.get("code")) {
    document.getElementById("code-input").value = params.get("code").toUpperCase();
  }

  // Construire la grille d'avatars
  const grid = document.getElementById("avatar-grid");
  AVATARS.forEach((av, i) => {
    const btn = document.createElement("button");
    btn.className = "avatar-btn" + (i === 0 ? " selected" : "");
    btn.textContent = av;
    btn.onclick = () => {
      document.querySelectorAll(".avatar-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAvatar = av;
    };
    grid.appendChild(btn);
  });

  // Écouter les événements de jeu
  on("lobby_update", ({ players }) => {
    updateOtherPlayers(players);
  });

  on("game_start", ({ songIndex }) => {
    currentSongIndex = songIndex;
    showScreen("player-game");
    startPlayerTimer();
    updateSongDisplay();
  });

  on("next_song", ({ songIndex }) => {
    currentSongIndex = songIndex;
    document.getElementById("p-sent").style.display = "none";
    document.getElementById("answer-form").style.display = "flex";
    document.getElementById("p-artist").value = "";
    document.getElementById("p-title").value = "";
    showScreen("player-game");
    startPlayerTimer();
    updateSongDisplay();
  });

  on("song_reveal", ({ song, players, songIndex }) => {
    clearInterval(timerInterval);
    const me = players[PLAYER_ID];
    if (!me) return;
    const ans = me.answers ? me.answers[songIndex] : null;
    const pts = ans ? ans.points : 0;
    myScore = me.score;

    document.getElementById("p-reveal-title").textContent = song.title;
    document.getElementById("p-reveal-artist").textContent = song.artist;

    const badge = document.getElementById("p-result-badge");
    const ptsEl = document.getElementById("p-pts-earned");
    document.getElementById("p-total-score").textContent = myScore;

    if (pts >= GAME_CONFIG.pointsBothCorrect) {
      badge.innerHTML = '<span class="sent-badge" style="background:var(--green)">🎯 Parfait !</span>';
    } else if (pts >= GAME_CONFIG.pointsOneCorrect) {
      badge.innerHTML = '<span class="sent-badge" style="background:var(--yellow);color:#000">👏 Bien !</span>';
    } else if (pts >= 1) {
      badge.innerHTML = '<span class="sent-badge" style="background:var(--accent)">👍 Proche !</span>';
    } else {
      badge.innerHTML = '<span class="sent-badge" style="background:var(--red)">😬 Raté</span>';
    }
    ptsEl.textContent = "+" + pts + " pts";
    ptsEl.style.color = pts > 0 ? "var(--green)" : "var(--red)";

    showScreen("player-reveal");
  });

  on("game_final", ({ leaderboard }) => {
    const me = leaderboard.find(p => p.id === PLAYER_ID);
    if (!me) { showScreen("player-final"); return; }

    const medals = ["🥇","🥈","🥉"];
    document.getElementById("p-final-rank").textContent =
      (me.rank <= 3 ? medals[me.rank - 1] + " " : "") + `${me.rank}e place`;
    document.getElementById("p-final-score").textContent = me.score;

    const lb = document.getElementById("p-leaderboard");
    lb.innerHTML = "";
    leaderboard.forEach(p => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.style.border = p.id === PLAYER_ID ? "1px solid var(--accent2)" : "";
      row.innerHTML = `
        <span class="lb-rank">${p.rank}</span>
        <span class="lb-av">${p.avatar}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">${p.score} pts</span>`;
      lb.appendChild(row);
    });

    showScreen("player-final");
  });
});

// ---- REJOINDRE ----
function joinGame() {
  const code = document.getElementById("code-input").value.trim().toUpperCase();
  const name = document.getElementById("name-input").value.trim();
  const errEl = document.getElementById("join-error");

  if (!code || code.length < 4) { errEl.textContent = "Entre un code valide."; return; }
  if (!name) { errEl.textContent = "Entre ton prénom."; return; }

  const roomCode = getState("roomCode");
  if (roomCode && code !== roomCode) {
    errEl.textContent = "Code incorrect. Vérifie avec l'hôte.";
    return;
  }

  myName = name;
  myAvatar = selectedAvatar;

  emit("player_join", { id: PLAYER_ID, name: myName, avatar: myAvatar });

  document.getElementById("my-avatar-big").textContent = myAvatar;
  document.getElementById("my-name-display").textContent = myName;

  // Afficher les joueurs déjà présents
  const existing = getState("players", {});
  updateOtherPlayers(existing);

  showScreen("player-lobby");
}

function updateOtherPlayers(players) {
  const container = document.getElementById("other-players");
  if (!container) return;
  container.innerHTML = "";
  Object.values(players).filter(p => p.id !== PLAYER_ID).forEach(p => {
    const span = document.createElement("span");
    span.style.cssText = "font-size:1.3rem;background:var(--card);padding:4px 10px;border-radius:999px;";
    span.textContent = p.avatar + " " + p.name;
    container.appendChild(span);
  });
}

// ---- RÉPONDRE ----
function playerSubmit() {
  const artist = document.getElementById("p-artist").value.trim();
  const title = document.getElementById("p-title").value.trim();
  if (!artist && !title) return;

  emit("player_answer", {
    playerId: PLAYER_ID,
    artist, title,
    songIndex: currentSongIndex
  });

  document.getElementById("answer-form").style.display = "none";
  document.getElementById("p-sent").style.display = "block";
  clearInterval(timerInterval);
}

// ---- TIMER ----
function startPlayerTimer() {
  clearInterval(timerInterval);
  let t = GAME_CONFIG.answerTimeSeconds;
  const bar = document.getElementById("p-timer-bar");
  const display = document.getElementById("p-timer");
  bar.style.width = "100%";
  display.textContent = t;

  timerInterval = setInterval(() => {
    t--;
    display.textContent = t;
    bar.style.width = (t / GAME_CONFIG.answerTimeSeconds * 100) + "%";
    if (t <= 0) {
      clearInterval(timerInterval);
      // Auto-submit vide si pas encore répondu
      if (document.getElementById("answer-form").style.display !== "none") {
        playerSubmit();
      }
    }
  }, 1000);
}

function updateSongDisplay() {
  document.getElementById("p-song-number").textContent =
    `Musique ${currentSongIndex + 1} / ${SONGS.length}`;
}

// ---- UTILITAIRE ----
function showScreen(id) {
  ["join-screen","player-lobby","player-game","player-reveal","player-final"].forEach(s => {
    document.getElementById(s).style.display = "none";
  });
  document.getElementById(id).style.display = "flex";
}

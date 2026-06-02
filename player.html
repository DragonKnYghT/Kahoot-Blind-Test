// js/host.js — Logique hôte avec Firebase temps réel

let roomRef, roomCode;
let currentSongIndex = -1;
let timerInterval = null;
let players = {};

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
  roomCode = generateCode();
  roomRef = db.ref("rooms/" + roomCode);

  roomRef.set({ phase: "lobby", currentSong: -1, createdAt: Date.now() });
  roomRef.onDisconnect().remove();

  document.getElementById("room-code-display").textContent = roomCode;
  const playerUrl = window.location.origin + window.location.pathname.replace("host.html", "player.html");
  const joinUrl = playerUrl + "?code=" + roomCode;
  document.getElementById("join-url-display").textContent = "";

  new QRCode(document.getElementById("qr-container"), {
    text: joinUrl, width: 160, height: 160,
    colorDark: "#000000", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

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

  // Afficher la catégorie en cours
  const cat = CATEGORIES.find(c => c.id === song.category);
  const catLabel = cat ? `<span style="color:${cat.color};font-size:0.8rem;font-weight:700;">${cat.label}</span>` : "";
  document.getElementById("song-number").innerHTML =
    `Musique ${currentSongIndex + 1} / ${SONGS.length} &nbsp;·&nbsp; ${catLabel}`;

  if (song.file) {
    loadAudio(song.file)
      .then(() => playAudio(song.previewDuration || GAME_CONFIG.answerTimeSeconds))
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
  const updates = {};
  Object.values(players).forEach(p => {
    const ans = p.answers && p.answers["s" + currentSongIndex];
    if (ans) {
      const { points } = calcPoints(ans.artist || "", ans.title || "", song);
      updates[`players/${p.id}/score`] = (p.score || 0) + points;
      updates[`players/${p.id}/answers/s${currentSongIndex}/points`] = points;
    }
  });
  updates["phase"] = "reveal";
  updates["currentSong"] = currentSongIndex;
  roomRef.update(updates);

  showScreen("s-reveal");

  // Label selon la catégorie
  const cat = CATEGORIES.find(c => c.id === song.category);
  const isCartoon = song.category === "cartoons";
  document.getElementById("reveal-title").textContent = song.title;
  document.getElementById("reveal-artist").textContent = isCartoon
    ? `🎬 ${song.artist}`
    : `🎤 ${song.artist}`;
  if (cat) document.getElementById("reveal-artist").style.color = cat.color;

  setTimeout(() => {
    roomRef.child("players").once("value", snap => {
      renderRevealAnswers(snap.val() || {}, song);
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
  const prevCategory = SONGS[currentSongIndex] ? SONGS[currentSongIndex].category : null;
  currentSongIndex++;

  if (currentSongIndex >= SONGS.length) {
    showFinal();
    return;
  }

  const nextCategory = SONGS[currentSongIndex].category;

  if (prevCategory && nextCategory !== prevCategory) {
    showCategoryTransition(nextCategory, () => {
      roomRef.update({ phase: "playing", currentSong: currentSongIndex });
      showScreen("s-game");
      loadSong();
      startTimer();
    });
  } else {
    roomRef.update({ phase: "playing", currentSong: currentSongIndex });
    showScreen("s-game");
    loadSong();
    startTimer();
  }
}

function showCategoryTransition(categoryId, callback) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) { callback(); return; }

  roomRef.update({ phase: "category_transition", categoryLabel: cat.label, categoryColor: cat.color });

  let overlay = document.getElementById("category-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "category-overlay";
    overlay.style.cssText = `
      position:fixed;inset:0;background:var(--bg);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      z-index:999;text-align:center;padding:2rem;
      animation:fadeIn 0.4s ease;
    `;
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="font-size:0.9rem;color:var(--text-muted);letter-spacing:.15em;text-transform:uppercase;margin-bottom:1rem;">
      Nouvelle catégorie
    </div>
    <div style="font-size:3.5rem;font-weight:900;color:${cat.color};margin-bottom:0.5rem;">
      ${cat.label}
    </div>
    <div style="font-size:1rem;color:var(--text-muted);margin-top:1rem;">Préparez-vous…</div>
    <button class="btn btn-lg" style="margin-top:2rem;background:${cat.color};color:#000;font-weight:800;"
      onclick="document.getElementById('category-overlay').remove(); startAfterTransition()">
      C'est parti ! ▶
    </button>
  `;
  overlay.style.display = "flex";

  window._transitionCallback = callback;
}

function startAfterTransition() {
  if (window._transitionCallback) {
    window._transitionCallback();
    window._transitionCallback = null;
  }
}

// ---- FINAL ----
function showFinal() {
  roomRef.update({ phase: "final" });
  showScreen("s-final");

  roomRef.child("players").once("value", snap => {
    const lb = Object.values(snap.val() || {})
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    roomRef.update({ leaderboard: lb });

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

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

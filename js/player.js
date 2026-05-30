// js/player.js — Logique joueur avec Firebase temps réel

const PLAYER_ID = "p_" + Math.random().toString(36).substr(2, 9);
let myName = "", myAvatar = "", myScore = 0;
let selectedAvatar = AVATARS[0];
let roomRef = null;
let currentSongIndex = -1;
let timerInterval = null;
let hasAnswered = false;

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
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
});

// ---- REJOINDRE ----
function joinGame() {
  const code = document.getElementById("code-input").value.trim().toUpperCase();
  const name = document.getElementById("name-input").value.trim();
  const errEl = document.getElementById("join-error");
  errEl.textContent = "";

  if (!code || code.length < 4) { errEl.textContent = "Entre un code valide."; return; }
  if (!name) { errEl.textContent = "Entre ton prénom."; return; }

  // Vérifier que la room existe
  db.ref("rooms/" + code).once("value", snap => {
    if (!snap.exists()) {
      errEl.textContent = "Code incorrect ou partie terminée.";
      return;
    }

    myName = name;
    myAvatar = selectedAvatar;
    roomRef = db.ref("rooms/" + code);

    // S'enregistrer dans Firebase
    const playerRef = roomRef.child("players/" + PLAYER_ID);
    playerRef.set({
      id: PLAYER_ID,
      name: myName,
      avatar: myAvatar,
      score: 0,
      joinedAt: Date.now()
    });

    // Se retirer quand on ferme la page
    playerRef.onDisconnect().remove();

    // Afficher l'avatar et le nom
    document.getElementById("my-avatar-big").textContent = myAvatar;
    document.getElementById("my-name-display").textContent = myName;

    showScreen("s-lobby");
    listenToRoom();
  });
}

// ---- ÉCOUTER LA ROOM ----
function listenToRoom() {
  // Écouter les autres joueurs
  roomRef.child("players").on("value", snap => {
    const players = snap.val() || {};
    renderOtherPlayers(players);
    document.getElementById("p-player-count").textContent = Object.keys(players).length;

    // Mettre à jour mon score local
    if (players[PLAYER_ID]) myScore = players[PLAYER_ID].score || 0;
  });

  // Écouter les changements de phase
  roomRef.child("phase").on("value", snap => {
    const phase = snap.val();
    if (phase === "playing") {
      roomRef.child("currentSong").once("value", s => {
        const newSong = s.val();
        if (newSong !== currentSongIndex) {
          currentSongIndex = newSong;
          hasAnswered = false;
          resetAnswerForm();
          showScreen("s-game");
          document.getElementById("p-song-number").textContent =
            `Musique ${currentSongIndex + 1} / ${SONGS.length}`;
          startPlayerTimer();
        }
      });
    } else if (phase === "reveal") {
      clearInterval(timerInterval);
      roomRef.child("currentSong").once("value", s => {
        currentSongIndex = s.val();
        showReveal();
      });
    } else if (phase === "final") {
      clearInterval(timerInterval);
      showFinal();
    }
  });
}

// ---- AFFICHER LES AUTRES JOUEURS ----
function renderOtherPlayers(players) {
  const grid = document.getElementById("other-players-grid");
  if (!grid) return;
  grid.innerHTML = "";
  Object.values(players).forEach(p => {
    const div = document.createElement("div");
    div.className = "mini-player-card";
    div.style.border = p.id === PLAYER_ID ? "1px solid var(--accent2)" : "";
    div.innerHTML = `
      <div class="mini-av">${p.avatar}</div>
      <div class="mini-nm">${p.name}${p.id === PLAYER_ID ? ' (toi)' : ''}</div>`;
    grid.appendChild(div);
  });
}

// ---- RÉPONDRE ----
function playerSubmit() {
  if (hasAnswered) return;
  const artist = document.getElementById("p-artist").value.trim();
  const title = document.getElementById("p-title").value.trim();

  hasAnswered = true;
  clearInterval(timerInterval);

  // Sauvegarder la réponse dans Firebase
  roomRef.child(`players/${PLAYER_ID}/answers/s${currentSongIndex}`).set({
    artist: artist || "",
    title: title || "",
    submittedAt: Date.now()
  });

  document.getElementById("answer-form").style.display = "none";
  document.getElementById("p-sent").style.display = "flex";
}

function resetAnswerForm() {
  document.getElementById("p-artist").value = "";
  document.getElementById("p-title").value = "";
  document.getElementById("answer-form").style.display = "flex";
  document.getElementById("p-sent").style.display = "none";
}

// ---- TIMER ----
function startPlayerTimer() {
  clearInterval(timerInterval);
  let t = GAME_CONFIG.answerTimeSeconds;
  const bar = document.getElementById("p-timer-bar");
  const display = document.getElementById("p-timer");
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
    if (t <= 0) {
      clearInterval(timerInterval);
      if (!hasAnswered) playerSubmit();
    }
  }, 1000);
}

// ---- RÉVÉLATION ----
function showReveal() {
  const song = SONGS[currentSongIndex];
  document.getElementById("p-reveal-title").textContent = song.title;
  document.getElementById("p-reveal-artist").textContent = song.artist;

  roomRef.child("players").once("value", snap => {
    const players = snap.val() || {};
    const me = players[PLAYER_ID];
    const ans = me && me.answers && me.answers["s" + currentSongIndex];
    const pts = (ans && ans.points) || 0;
    myScore = (me && me.score) || 0;

    document.getElementById("p-total-score").textContent = myScore;
    document.getElementById("p-pts-earned").textContent = "+" + pts + " pts";
    document.getElementById("p-pts-earned").style.color = pts > 0 ? "var(--green)" : "var(--red)";

    const badge = document.getElementById("p-result-badge");
    if (pts >= GAME_CONFIG.pointsBothCorrect) {
      badge.innerHTML = '<span class="badge badge-green">🎯 Parfait !</span>';
    } else if (pts >= GAME_CONFIG.pointsOneCorrect) {
      badge.innerHTML = '<span class="badge badge-yellow">👏 Bien !</span>';
    } else if (pts >= 1) {
      badge.innerHTML = '<span class="badge badge-purple">👍 Proche !</span>';
    } else {
      badge.innerHTML = '<span class="badge badge-red">😬 Raté</span>';
    }

    // Mini classement
    const lb = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));
    const miniLb = document.getElementById("p-mini-lb");
    miniLb.innerHTML = "";
    lb.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.style.border = p.id === PLAYER_ID ? "1px solid var(--accent2)" : "";
      row.innerHTML = `
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-av">${p.avatar}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">${p.score || 0} pts</span>`;
      miniLb.appendChild(row);
    });

    showScreen("s-reveal");
  });
}

// ---- FINAL ----
function showFinal() {
  roomRef.child("players").once("value", snap => {
    const lb = Object.values(snap.val() || {})
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    const me = lb.find(p => p.id === PLAYER_ID);
    const rank = lb.findIndex(p => p.id === PLAYER_ID) + 1;
    const medals = ["🥇", "🥈", "🥉"];

    document.getElementById("p-final-rank").textContent =
      (rank <= 3 ? medals[rank - 1] + " " : "") + `${rank}e place`;
    document.getElementById("p-final-score").textContent = me ? me.score || 0 : 0;

    const lbEl = document.getElementById("p-leaderboard");
    lbEl.innerHTML = "";
    lb.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.style.border = p.id === PLAYER_ID ? "1px solid var(--accent2)" : "";
      row.innerHTML = `
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-av">${p.avatar}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">${p.score || 0} pts</span>`;
      lbEl.appendChild(row);
    });

    showScreen("s-final");
  });
}

// ---- UTILS ----
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

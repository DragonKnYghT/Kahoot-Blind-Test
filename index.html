// js/player.js — Logique joueur avec Firebase temps réel

const PLAYER_ID = "p_" + Math.random().toString(36).substr(2, 9);
let myName = "", myAvatar = "", myScore = 0;
let selectedAvatar = AVATARS[0];
let roomRef = null;
let currentSongIndex = -1;
let timerInterval = null;
let hasAnswered = false;

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("code")) {
    document.getElementById("code-input").value = params.get("code").toUpperCase();
  }

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

function joinGame() {
  const code = document.getElementById("code-input").value.trim().toUpperCase();
  const name = document.getElementById("name-input").value.trim();
  const errEl = document.getElementById("join-error");
  errEl.textContent = "";

  if (!code || code.length < 4) { errEl.textContent = "Entre un code valide."; return; }
  if (!name) { errEl.textContent = "Entre ton prénom."; return; }

  db.ref("rooms/" + code).once("value", snap => {
    if (!snap.exists()) { errEl.textContent = "Code incorrect ou partie terminée."; return; }

    myName = name;
    myAvatar = selectedAvatar;
    roomRef = db.ref("rooms/" + code);

    const playerRef = roomRef.child("players/" + PLAYER_ID);
    playerRef.set({ id: PLAYER_ID, name: myName, avatar: myAvatar, score: 0, joinedAt: Date.now() });
    playerRef.onDisconnect().remove();

    document.getElementById("my-avatar-big").textContent = myAvatar;
    document.getElementById("my-name-display").textContent = myName;

    showScreen("s-lobby");
    listenToRoom();
  });
}

function listenToRoom() {
  roomRef.child("players").on("value", snap => {
    const players = snap.val() || {};
    renderOtherPlayers(players);
    document.getElementById("p-player-count").textContent = Object.keys(players).length;
    if (players[PLAYER_ID]) myScore = players[PLAYER_ID].score || 0;
  });

  roomRef.child("phase").on("value", snap => {
    const phase = snap.val();

    if (phase === "playing") {
      // Retirer l'overlay de transition si présent
      const overlay = document.getElementById("p-cat-overlay");
      if (overlay) overlay.remove();

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

    } else if (phase === "category_transition") {
      clearInterval(timerInterval);
      roomRef.child("categoryLabel").once("value", s => {
        const label = s.val();
        roomRef.child("categoryColor").once("value", sc => {
          const color = sc.val() || "var(--accent2)";
          let overlay = document.getElementById("p-cat-overlay");
          if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "p-cat-overlay";
            overlay.style.cssText = `
              position:fixed;inset:0;background:var(--bg);
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              z-index:999;text-align:center;padding:2rem;animation:fadeIn 0.4s ease;
            `;
            document.body.appendChild(overlay);
          }
          overlay.innerHTML = `
            <div style="font-size:0.85rem;color:var(--text-muted);letter-spacing:.15em;text-transform:uppercase;margin-bottom:1rem;">Nouvelle catégorie</div>
            <div style="font-size:2.5rem;font-weight:900;color:${color};">${label}</div>
            <div style="color:var(--text-muted);margin-top:1rem;font-size:0.9rem;">⏳ En attente de l'hôte…</div>
          `;
        });
      });

    } else if (phase === "final") {
      clearInterval(timerInterval);
      showFinal();
    }
  });
}

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

function playerSubmit() {
  if (hasAnswered) return;
  const artist = document.getElementById("p-artist").value.trim();
  const title = document.getElementById("p-title").value.trim();
  hasAnswered = true;
  clearInterval(timerInterval);

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
    if (t <= 0) { clearInterval(timerInterval); if (!hasAnswered) playerSubmit(); }
  }, 1000);
}

function showReveal() {
  const song = SONGS[currentSongIndex];
  const isCartoon = song.category === "cartoons";
  const cat = CATEGORIES.find(c => c.id === song.category);

  document.getElementById("p-reveal-title").textContent = song.title;
  const artistEl = document.getElementById("p-reveal-artist");
  artistEl.textContent = isCartoon ? `🎬 ${song.artist}` : `🎤 ${song.artist}`;
  if (cat) artistEl.style.color = cat.color;

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
    if (pts >= GAME_CONFIG.pointsBothCorrect)      badge.innerHTML = '<span class="badge badge-green">🎯 Parfait !</span>';
    else if (pts >= GAME_CONFIG.pointsOneCorrect)  badge.innerHTML = '<span class="badge badge-yellow">👏 Bien !</span>';
    else if (pts >= 1)                             badge.innerHTML = '<span class="badge badge-purple">👍 Proche !</span>';
    else                                           badge.innerHTML = '<span class="badge badge-red">😬 Raté</span>';

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

function showFinal() {
  roomRef.child("players").once("value", snap => {
    const lb = Object.values(snap.val() || {}).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = lb.findIndex(p => p.id === PLAYER_ID) + 1;
    const me = lb.find(p => p.id === PLAYER_ID);
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

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

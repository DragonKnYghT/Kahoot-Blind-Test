// js/sync.js — Synchronisation entre hôte et joueurs
// Utilise localStorage + BroadcastChannel pour fonctionner sans serveur
// Les deux onglets/appareils doivent partager le même domaine (GitHub Pages)

const AVATARS = [
  "🐱","🐶","🦊","🐻","🐼","🐨","🐯","🦁","🐸","🐙",
  "🦋","🐠","🦄","🐧","🦉","🐺","🐝","🦖","👾","🤖",
  "🎸","🎺","🎹","🎻","🥁","🎤"
];

// Canal de communication (fonctionne sur la même origine = même GitHub Pages)
let _bc = null;
function getBroadcast() {
  if (!_bc) _bc = new BroadcastChannel("blindtest");
  return _bc;
}

// Émet un événement
function emit(type, data) {
  const msg = { type, data, ts: Date.now() };
  getBroadcast().postMessage(msg);
  // Aussi via localStorage pour compatibilité maximale
  localStorage.setItem("bt_event", JSON.stringify(msg));
}

// Écoute les événements
function on(type, callback) {
  getBroadcast().addEventListener("message", e => {
    if (e.data.type === type) callback(e.data.data);
  });
  // Fallback localStorage
  window.addEventListener("storage", e => {
    if (e.key === "bt_event") {
      try {
        const msg = JSON.parse(e.newValue);
        if (msg.type === type) callback(msg.data);
      } catch {}
    }
  });
}

// ---- ÉTAT PARTAGÉ (localStorage) ----
function setState(key, value) {
  localStorage.setItem("bt_" + key, JSON.stringify(value));
}

function getState(key, fallback = null) {
  try {
    const v = localStorage.getItem("bt_" + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function clearState() {
  Object.keys(localStorage).filter(k => k.startsWith("bt_")).forEach(k => localStorage.removeItem(k));
}

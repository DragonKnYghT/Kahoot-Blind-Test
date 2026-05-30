// js/firebase-config.js — Configuration Firebase

const firebaseConfig = {
  apiKey: "AIzaSyBtlskcLOLAZSbZHO5GviL7pnM7CKsj0RM",
  authDomain: "kahoot-blind-test.firebaseapp.com",
  databaseURL: "https://kahoot-blind-test-default-rtdb.firebaseio.com",
  projectId: "kahoot-blind-test",
  storageBucket: "kahoot-blind-test.firebasestorage.app",
  messagingSenderId: "258198360327",
  appId: "1:258198360327:web:4e1805c741ef23dfb175a2",
  measurementId: "G-1EVY1S4N10"
};

const AVATARS = [
  "🐱","🐶","🦊","🐻","🐼","🐨","🐯","🦁","🐸","🐙",
  "🦋","🐠","🦄","🐧","🦉","🐺","🐝","🦖","👾","🤖",
  "🎸","🎺","🎹","🎻","🥁","🎤"
];

// Init Firebase (CDN compat mode)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

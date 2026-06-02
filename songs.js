// songs.js — Modifie ce fichier pour ajouter tes musiques

const CATEGORIES = [
  { id: "80s",      label: "🎸 Années 1980–1999", color: "#f59e0b" },
  { id: "2000s",    label: "💿 Années 2000–2009", color: "#10b981" },
  { id: "cartoons", label: "🎬 Dessins animés",   color: "#a855f7" },
];

const SONGS = [
  // ---- 🎸 ANNÉES 1980-1999 ----
  { id: 1,  category: "80s", file: "assets/song1.mp3",  artist: "Michael Jackson", title: "Billie Jean" },
  { id: 2,  category: "80s", file: "assets/song2.mp3",  artist: "a-ha",            title: "Take On Me" },
  { id: 3,  category: "80s", file: "assets/song3.mp3",  artist: "Oasis",           title: "Wonderwall" },
  { id: 4,  category: "80s", file: "assets/song4.mp3",  artist: "Nirvana",         title: "Smells Like Teen Spirit" },
  { id: 5,  category: "80s", file: "assets/song5.mp3",  artist: "Tears for Fears", title: "Everybody Wants to Rule the World" },
  { id: 6,  category: "80s", file: "assets/song6.mp3",  artist: "Fools Garden",    title: "Lemon Tree" },
  { id: 7,  category: "80s", file: "assets/song7.mp3",  artist: "AC/DC",           title: "Back In Black" },

  // ---- 💿 ANNÉES 2000-2009 ----
  { id: 8,  category: "2000s", file: "assets/song8.mp3",  artist: "OutKast",             title: "Ms. Jackson" },
  { id: 9,  category: "2000s", file: "assets/song9.mp3",  artist: "Dr. Dre",             title: "What's the Difference" },
  { id: 10, category: "2000s", file: "assets/song10.mp3", artist: "Daft Punk",           title: "Veridis Quo" },
  { id: 11, category: "2000s", file: "assets/song11.mp3", artist: "Gorillaz",            title: "Feel Good Inc." },
  { id: 12, category: "2000s", file: "assets/song12.mp3", artist: "Linkin Park",         title: "In the End" },
  { id: 13, category: "2000s", file: "assets/song13.mp3", artist: "Lady Gaga",           title: "Poker Face" },
  { id: 14, category: "2000s", file: "assets/song14.mp3", artist: "The Black Eyed Peas", title: "I Gotta Feeling" },

  // ---- 🎬 DESSINS ANIMÉS ----
  { id: 15, category: "cartoons", file: "assets/song15.mp3", artist: "Les Daltons",             title: "Générique" },
  { id: 16, category: "cartoons", file: "assets/song16.mp3", artist: "Shrek",                   title: "All Star" },
  { id: 17, category: "cartoons", file: "assets/song17.mp3", artist: "Ninjago",                 title: "Weekend Whip" },
  { id: 18, category: "cartoons", file: "assets/song18.mp3", artist: "Cars",                    title: "Life Is a Highway" },
  { id: 19, category: "cartoons", file: "assets/song19.mp3", artist: "Kung Fu Panda",           title: "Kung Fu Fighting" },
  { id: 20, category: "cartoons", file: "assets/song20.mp3", artist: "Toy Story",               title: "You've Got a Friend in Me" },
  { id: 21, category: "cartoons", file: "assets/song21.mp3", artist: "Zootopie",                title: "Try Everything" },
  { id: 22, category: "cartoons", file: "assets/song22.mp3", artist: "La Grande Aventure Lego", title: "Everything Is Awesome" },
  { id: 23, category: "cartoons", file: "assets/song23.mp3", artist: "Moi, Moche et Méchant 2", title: "Happy" },
];

const GAME_CONFIG = {
  pointsBothCorrect: 4,
  pointsOneCorrect: 2,
  maxTypoForFull: 3,
  maxTypoForHalf: 5,
  answerTimeSeconds: 15,
};

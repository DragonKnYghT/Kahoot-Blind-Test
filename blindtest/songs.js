// ============================================
// FICHIER DE CONFIGURATION DES MUSIQUES
// Modifie ce fichier pour ajouter/changer les musiques
// ============================================

const SONGS = [
  {
    id: 1,
    file: "assets/song1.mp3",   // Mets ton fichier audio ici dans le dossier assets/
    artist: "The Beatles",
    title: "Let It Be",
    previewDuration: 30,        // Durée de l'extrait en secondes
  },
  {
    id: 2,
    file: "assets/song2.mp3",
    artist: "Queen",
    title: "Bohemian Rhapsody",
    previewDuration: 30,
  },
  {
    id: 3,
    file: "assets/song3.mp3",
    artist: "Michael Jackson",
    title: "Thriller",
    previewDuration: 30,
  },
  // Ajoute d'autres musiques ici en copiant le bloc ci-dessus
  // N'oublie pas de mettre le fichier audio dans le dossier assets/
];

// ============================================
// OPTIONS DU JEU (tu peux modifier ces valeurs)
// ============================================
const GAME_CONFIG = {
  pointsBothCorrect: 4,      // Points si artiste + titre corrects
  pointsOneCorrect: 2,       // Points si seulement artiste ou titre correct
  maxTypoForFull: 3,         // Nb de fautes max pour réponse correcte (plein de points)
  maxTypoForHalf: 5,         // Nb de fautes max pour demi-points
  answerTimeSeconds: 45,     // Temps pour répondre (secondes)
};

// js/game.js — Logique principale du blind test (côté hôte)

class BlindTestGame {
  constructor() {
    this.players = {};       // { id: { name, avatar, score, answers } }
    this.currentSong = -1;
    this.phase = "lobby";    // lobby | playing | reveal | final
    this.roomCode = this.generateCode();
    this.timerInterval = null;
    this.timeLeft = 0;
  }

  generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  addPlayer(id, name, avatar) {
    this.players[id] = { id, name, avatar, score: 0, answers: {} };
    return this.players[id];
  }

  removePlayer(id) {
    delete this.players[id];
  }

  startNextSong() {
    this.currentSong++;
    if (this.currentSong >= SONGS.length) {
      this.phase = "final";
      return null;
    }
    this.phase = "playing";
    // Reset answers for this song
    Object.keys(this.players).forEach(id => {
      this.players[id].answers[this.currentSong] = null;
    });
    return SONGS[this.currentSong];
  }

  submitAnswer(playerId, artistGuess, titleGuess) {
    if (this.phase !== "playing") return;
    const song = SONGS[this.currentSong];
    const artistScore = this.scoreAnswer(artistGuess, song.artist);
    const titleScore = this.scoreAnswer(titleGuess, song.title);

    let points = 0;
    // Si les deux sont corrects (avec tolérance)
    if (artistScore === "full" && titleScore === "full") {
      points = GAME_CONFIG.pointsBothCorrect;
    } else if (artistScore === "full" || titleScore === "full") {
      points = GAME_CONFIG.pointsOneCorrect;
    } else if (artistScore === "half" || titleScore === "half") {
      points = 1;
    }

    this.players[playerId].score += points;
    this.players[playerId].answers[this.currentSong] = {
      artist: artistGuess, title: titleGuess,
      artistScore, titleScore, points
    };
    return points;
  }

  scoreAnswer(guess, correct) {
    if (!guess) return "none";
    const distance = this.levenshtein(
      guess.toLowerCase().trim(),
      correct.toLowerCase().trim()
    );
    if (distance <= GAME_CONFIG.maxTypoForFull) return "full";
    if (distance <= GAME_CONFIG.maxTypoForHalf) return "half";
    return "none";
  }

  // Algorithme de Levenshtein (distance d'édition entre 2 chaînes)
  levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i-1] === a[j-1]
          ? matrix[i-1][j-1]
          : 1 + Math.min(matrix[i-1][j-1], matrix[i][j-1], matrix[i-1][j]);
      }
    }
    return matrix[b.length][a.length];
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }
}

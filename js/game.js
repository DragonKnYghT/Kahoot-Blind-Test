// js/game.js — Logique de scoring

function levenshtein(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
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

function scoreAnswer(guess, correct) {
  if (!guess || !guess.trim()) return "none";
  const dist = levenshtein(guess, correct);
  if (dist <= GAME_CONFIG.maxTypoForFull) return "full";
  if (dist <= GAME_CONFIG.maxTypoForHalf) return "half";
  return "none";
}

function calcPoints(artistGuess, titleGuess, song) {
  const artistScore = scoreAnswer(artistGuess, song.artist);
  const titleScore = scoreAnswer(titleGuess, song.title);
  let points = 0;
  if (artistScore === "full" && titleScore === "full") points = GAME_CONFIG.pointsBothCorrect;
  else if (artistScore === "full" || titleScore === "full") points = GAME_CONFIG.pointsOneCorrect;
  else if (artistScore === "half" || titleScore === "half") points = 1;
  return { points, artistScore, titleScore };
}

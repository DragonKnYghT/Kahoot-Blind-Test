# 🎵 Blind Test — Guide d'utilisation

## Installation rapide sur GitHub Pages

### 1. Télécharge les fichiers
Télécharge tous les fichiers du projet et dézippe-les.

### 2. Ajoute tes musiques
- Place tes fichiers `.mp3` dans le dossier `assets/`
- Noms suggérés : `song1.mp3`, `song2.mp3`, etc.
- Ouvre `songs.js` et modifie la liste des musiques :
  ```js
  {
    file: "assets/ton_fichier.mp3",
    artist: "Nom de l'artiste",
    title: "Titre de la chanson",
    previewDuration: 30,  // durée de l'extrait en secondes
  }
  ```

### 3. Publie sur GitHub Pages
1. Crée un nouveau dépôt sur GitHub (ex: `mon-blindtest`)
2. Upload tous les fichiers
3. Va dans **Settings → Pages → Source → main branch**
4. Ton blind test sera disponible sur `https://tonpseudo.github.io/mon-blindtest/`

---

## Utilisation en classe

### L'hôte (toi)
1. Ouvre `host.html` sur le grand écran / projecteur
2. Un **QR code** et un **code** s'affichent
3. Clique **Lancer la partie** quand tout le monde est connecté
4. La musique joue automatiquement avec le visualiseur
5. Clique **Révéler la réponse** (ou attends la fin du timer)
6. Passe à la musique suivante

### Les joueurs (tes camarades)
1. Scannent le QR code ou vont sur `player.html?code=XXXXXX`
2. Entrent leur prénom et choisissent un avatar
3. Écoutent la musique et tapent **l'artiste** et le **titre**
4. Voient leur score en temps réel

---

## Système de points

| Résultat | Points |
|---------|--------|
| Artiste + titre corrects (≤3 fautes) | **4 points** |
| Un seul correct (≤3 fautes) | **2 points** |
| Proche (4–5 fautes) | **1 point** |
| Trop loin ou vide | **0 point** |

> **Tolérance ortho** : jusqu'à 3 lettres d'écart = plein de points, jusqu'à 5 = 1 point  
> Exemple : "Mickaël Jakson" pour "Michael Jackson" → ça compte quand même !

---

## Modifier les options

Dans `songs.js`, tu peux changer :
```js
const GAME_CONFIG = {
  pointsBothCorrect: 4,   // points si les deux sont corrects
  pointsOneCorrect: 2,    // points si un seul correct
  maxTypoForFull: 3,      // fautes max pour plein de points
  maxTypoForHalf: 5,      // fautes max pour 1 point
  answerTimeSeconds: 45,  // temps pour répondre
};
```

---

## Problèmes fréquents

**L'audio ne joue pas ?**  
→ GitHub Pages bloque parfois les gros fichiers. Essaie de réduire le bitrate des mp3 (128kbps suffit).

**Les joueurs ne se voient pas ?**  
→ Tout le monde doit être sur le **même domaine** (même URL GitHub Pages). Ça ne marche pas en local avec des fichiers différents.

**Le QR code ne marche pas ?**  
→ Partage manuellement le lien `player.html?code=XXXXXX` dans le chat de classe.

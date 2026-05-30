# Kahoot-Blind-Test
This is a Kahoot blind test because the blind test feature on Kahoot is paid, so I'm giving you free access to the code if you want to create your own Kahoot blind test.

🎵 Kahoot Blind Test

This is a Kahoot blind test because the blind test feature on Kahoot is paid, so I'm giving you free access to the code if you want to create your own Kahoot blind test.


🚀 Quick setup on GitHub Pages

Download and unzip the project
Put your .mp3 files in the assets/ folder
Open songs.js and edit the song list:

js{
  file: "assets/your_file.mp3",
  artist: "Artist name",
  title: "Song title",
  previewDuration: 30,  // clip length in seconds
}

Create a new GitHub repository, upload all the files
Go to Settings → Pages → Source → main branch
Your blind test will be live at https://yourusername.github.io/your-repo/


🎮 How to play
Host (you)

Open host.html on the projector / main screen
A QR code and a room code are displayed
Click Start game once everyone is connected
The music plays with the audio visualizer
Click Reveal answer (or wait for the timer to run out)
Move on to the next song

Players (your classmates)

Scan the QR code or go to player.html?code=XXXXXX
Enter a username and pick an avatar
Listen to the music and type the artist and title
See their score update in real time


🏆 Scoring system
ResultPointsArtist + title correct (≤3 typos)4 pointsOnly one correct (≤3 typos)2 pointsClose (4–5 typos)1 pointToo far off or empty0 points

Typo tolerance means "Mickaël Jakson" for "Michael Jackson" still counts!


⚙️ Configuration
In songs.js you can tweak:
jsconst GAME_CONFIG = {
  pointsBothCorrect: 4,    // points if both correct
  pointsOneCorrect: 2,     // points if only one correct
  maxTypoForFull: 3,       // max typos for full points
  maxTypoForHalf: 5,       // max typos for 1 point
  answerTimeSeconds: 45,   // time to answer
};

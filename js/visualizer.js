// js/visualizer.js — Visualiseur audio (barres qui bougent)

let audioCtx, analyser, sourceNode, audioBuffer;
let animFrame;

async function loadAudio(url) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const resp = await fetch(url);
  const arrayBuf = await resp.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
}

function playAudio(durationSec) {
  if (!audioCtx || !audioBuffer) return;
  if (sourceNode) { try { sourceNode.stop(); } catch {} }

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  sourceNode.start(0);

  if (durationSec) {
    setTimeout(() => { try { sourceNode.stop(); } catch {} }, durationSec * 1000);
  }

  drawVisualizer();
}

function stopAudio() {
  if (sourceNode) { try { sourceNode.stop(); } catch {} }
  if (animFrame) cancelAnimationFrame(animFrame);
}

function drawVisualizer() {
  const canvas = document.getElementById("visualizer");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const W = canvas.width;
  const H = canvas.height;
  const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);

  function draw() {
    animFrame = requestAnimationFrame(draw);
    if (analyser) analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, W, H);

    const barCount = data.length;
    const barW = (W / barCount) * 0.7;
    const gap = (W / barCount) * 0.3;

    for (let i = 0; i < barCount; i++) {
      const val = analyser ? data[i] / 255 : 0.05 + Math.random() * 0.08;
      const barH = val * H * 0.85;
      const x = i * (barW + gap) + gap / 2;
      const y = (H - barH) / 2;

      // Couleur dégradée selon amplitude
      const hue = 270 + val * 40; // violet -> rose
      ctx.fillStyle = `hsl(${hue}, 80%, ${40 + val * 30}%)`;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
    }
  }

  draw();
}

// Démarre une animation "idle" (sans audio) pour l'attente
function drawIdleVisualizer() {
  const canvas = document.getElementById("visualizer");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const W = canvas.width;
  const H = canvas.height;
  let t = 0;

  function drawIdle() {
    animFrame = requestAnimationFrame(drawIdle);
    ctx.clearRect(0, 0, W, H);
    const barCount = 32;
    const barW = (W / barCount) * 0.7;
    const gap = (W / barCount) * 0.3;
    t += 0.04;
    for (let i = 0; i < barCount; i++) {
      const val = 0.1 + 0.08 * Math.sin(t + i * 0.4) + 0.03 * Math.sin(t * 2.5 + i * 0.8);
      const barH = val * H;
      const x = i * (barW + gap) + gap / 2;
      const y = (H - barH) / 2;
      ctx.fillStyle = `rgba(168, 85, 247, 0.35)`;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
    }
  }
  drawIdle();
}

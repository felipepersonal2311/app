// Gera os efeitos sonoros do molde (whoosh e pop) como WAV 16-bit, sem baixar nada.
// Uso: node scripts/gerar-sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const RATE = 44100;

function wav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, 44 + i * 2));
  return buf;
}

// Pseudo-aleatório determinístico
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// Whoosh: ruído filtrado com envelope em sino e filtro que "abre"
function whoosh(dur = 0.45) {
  const n = Math.round(RATE * dur);
  const out = [];
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t) ** 2;
    const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * t);
    lp += cutoff * (rnd() - lp);
    out.push(lp * env * 1.6);
  }
  return out;
}

// Pop: seno com queda de frequência rápida
function pop(dur = 0.18) {
  const n = Math.round(RATE * dur);
  const out = [];
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 180 + 520 * Math.exp(-t * 40);
    fase += (2 * Math.PI * f) / RATE;
    out.push(Math.sin(fase) * Math.exp(-t * 22) * 0.9);
  }
  return out;
}

mkdirSync("public/sfx", { recursive: true });
writeFileSync("public/sfx/whoosh.wav", wav(whoosh()));
writeFileSync("public/sfx/pop.wav", wav(pop()));

// Blip: bolha curta para balões de fala
function blip(dur = 0.12) {
  const n = Math.round(RATE * dur);
  const out = [];
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 520 + 900 * (t / dur);
    fase += (2 * Math.PI * f) / RATE;
    out.push(Math.sin(fase) * Math.sin((Math.PI * i) / n) * 0.6);
  }
  return out;
}

// Ding: sino com harmônicos (checks)
function ding(freq, dur = 0.6) {
  const n = Math.round(RATE * dur);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.exp(-t * 7) * Math.min(1, t * 400);
    out.push(
      (Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.25 +
        Math.sin(2 * Math.PI * freq * 3.02 * t) * 0.1) * env,
    );
  }
  return out;
}

// Tick: clique curto (calendário contando)
function tick(dur = 0.03) {
  const n = Math.round(RATE * dur);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    out.push((Math.sin(2 * Math.PI * 2400 * t) * 0.5 + rnd() * 0.3) * Math.exp(-t * 180));
  }
  return out;
}

// Rabisco: ruído com "vai e volta" (riscar o copia e cola)
function rabisco(dur = 0.45) {
  const n = Math.round(RATE * dur);
  const out = [];
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    lp += 0.35 * (rnd() - lp);
    const am = 0.5 + 0.5 * Math.abs(Math.sin(2 * Math.PI * 9 * t));
    out.push(lp * am * Math.sin((Math.PI * i) / n) * 1.4);
  }
  return out;
}

// Thump: batida grave (selo, palavra do CTA)
function thump(dur = 0.35) {
  const n = Math.round(RATE * dur);
  const out = [];
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 55 + 110 * Math.exp(-t * 30);
    fase += (2 * Math.PI * f) / RATE;
    out.push(Math.sin(fase) * Math.exp(-t * 9) * 0.95 + rnd() * Math.exp(-t * 120) * 0.25);
  }
  return out;
}

// Brilho: arpejo agudo (comemoração)
function brilho() {
  const notas = [1046.5, 1318.5, 1568, 2093];
  const passo = Math.round(RATE * 0.07);
  const out = new Array(passo * notas.length + RATE * 0.6).fill(0);
  notas.forEach((f, k) => {
    ding(f, 0.6).forEach((v, i) => (out[k * passo + i] += v * 0.5));
  });
  return out;
}

writeFileSync("public/sfx/blip.wav", wav(blip()));
writeFileSync("public/sfx/ding1.wav", wav(ding(880)));
writeFileSync("public/sfx/ding2.wav", wav(ding(1108.7)));
writeFileSync("public/sfx/ding3.wav", wav(ding(1318.5)));
writeFileSync("public/sfx/tick.wav", wav(tick()));
writeFileSync("public/sfx/rabisco.wav", wav(rabisco()));
writeFileSync("public/sfx/thump.wav", wav(thump()));
writeFileSync("public/sfx/brilho.wav", wav(brilho()));
console.log("ok: efeitos gerados em public/sfx/");

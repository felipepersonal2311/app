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
console.log("ok: public/sfx/whoosh.wav, public/sfx/pop.wav");

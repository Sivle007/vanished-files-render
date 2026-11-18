// Uso (desde GTa6): node herramientas/musica.mjs
// Genera un bucle synthwave original (sin samples ni material de terceros) en GTa6/animacion/public/gta/musica.wav.
// 100 BPM, 8 compases: Am - F - C - G (x2). Pad, bajo en corcheas, bombo, caja suave y charles.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 44100;
const BPM = 100;
const negra = 60 / BPM;
const compas = negra * 4;
const COMPASES = 8;
const N = Math.round(compas * COMPASES * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// Acordes (midi): Am, F, C, G
const acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const bajos = [45, 41, 36, 43];

const saw = (fase) => 2 * (fase - Math.floor(fase + 0.5));
let seed = 7;
const ruido = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x3fffffff - 1; };

// Pad: sierras desafinadas con filtro paso bajo de un polo y envolvente lenta.
let lpL = 0, lpR = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const c = Math.floor(t / compas) % 4;
  const tc = t % compas;
  const env = Math.min(1, tc / 0.6) * (1 - 0.25 * (tc / compas));
  let sL = 0, sR = 0;
  for (const nota of acordes[c]) {
    const f = hz(nota);
    sL += saw(t * f * 0.997) + saw(t * f * 1.006);
    sR += saw(t * f * 1.003) + saw(t * f * 0.994);
  }
  const corte = 0.035 + 0.02 * Math.sin(t * 0.4);
  lpL += corte * (sL - lpL);
  lpR += corte * (sR - lpR);
  L[i] += lpL * 0.05 * env;
  R[i] += lpR * 0.05 * env;
}

// Bajo: corcheas pulsantes.
let lpB = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const c = Math.floor(t / compas) % 4;
  const tCorchea = t % (negra / 2);
  const oct = Math.floor(t / (negra / 2)) % 2 ? 12 : 0;
  const f = hz(bajos[c] + oct);
  const s = Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.6 + saw(t * f) * 0.4;
  lpB += 0.08 * (s - lpB);
  const env = Math.exp(-tCorchea * 9);
  L[i] += lpB * 0.22 * env;
  R[i] += lpB * 0.22 * env;
}

// Batería.
const golpe = (inicio, fn, dur) => {
  const a = Math.round(inicio * SR);
  for (let k = 0; k < dur * SR && a + k < N; k++) {
    const v = fn(k / SR);
    L[a + k] += v;
    R[a + k] += v;
  }
};
const tiempos = COMPASES * 4;
for (let b = 0; b < tiempos; b++) {
  const t0 = b * negra;
  golpe(t0, (t) => Math.sin(2 * Math.PI * (50 + 90 * Math.exp(-t * 30)) * t) * Math.exp(-t * 7) * 0.45, 0.5);
  if (b % 2 === 1) {
    let lp = 0;
    golpe(t0, (t) => { lp += 0.5 * (ruido() - lp); return (lp * 0.25 + Math.sin(2 * Math.PI * 190 * t) * 0.08) * Math.exp(-t * 14); }, 0.35);
  }
  for (const d of [0, 0.5]) {
    let prev = 0;
    golpe(t0 + d * negra, (t) => { const r = ruido(); const h = r - prev; prev = r; return h * 0.05 * Math.exp(-t * 60); }, 0.08);
  }
}

// Normaliza y guarda en WAV estéreo de 16 bits.
let pico = 0;
for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.85 / pico;
const datos = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  datos.writeInt16LE(Math.round(L[i] * g * 32767), i * 4);
  datos.writeInt16LE(Math.round(R[i] * g * 32767), i * 4 + 2);
}
const c = Buffer.alloc(44);
c.write('RIFF', 0); c.writeUInt32LE(36 + datos.length, 4); c.write('WAVEfmt ', 8); c.writeUInt32LE(16, 16);
c.writeUInt16LE(1, 20); c.writeUInt16LE(2, 22); c.writeUInt32LE(SR, 24); c.writeUInt32LE(SR * 4, 28);
c.writeUInt16LE(4, 32); c.writeUInt16LE(16, 34); c.write('data', 36); c.writeUInt32LE(datos.length, 40);
const salida = join(raiz, 'animacion', 'public', 'gta', 'musica.wav');
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, Buffer.concat([c, datos]));
console.log(`musica.wav: ${(N / SR).toFixed(1)} s`);

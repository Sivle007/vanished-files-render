// Uso: node herramientas/tiempos.mjs <audio.wav> <texto.txt> <salida.json>
// Saca con Whisper el momento en que se dice cada palabra y lo alinea con el texto exacto del guion,
// para que los subtitulos muestren siempre las palabras del guion aunque Whisper oiga algo distinto.
// Usa la version de Whisper para ONNX porque el procesador de este PC no tiene AVX y whisper.cpp no arranca.
import { pipeline } from '@huggingface/transformers';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [audio, textoRuta, salida] = process.argv.slice(2, 5).map((p) => resolve(p));
// Opcional: inicios de parrafo en ms (separados por comas) para repartir bien los parrafos que Whisper no oyo.
const iniciosParrafo = process.argv[5] ? process.argv[5].split(',').map(Number) : null;

function ffmpeg() {
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  const base = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  for (const pkg of readdirSync(base).filter((p) => p.startsWith('Gyan.FFmpeg'))) {
    for (const sub of readdirSync(join(base, pkg))) {
      const ruta = join(base, pkg, sub, 'bin', 'ffmpeg.exe');
      if (existsSync(ruta)) return ruta;
    }
  }
  throw new Error('No se encuentra ffmpeg');
}

// Whisper necesita audio mono a 16 kHz en coma flotante.
const crudo = join(tmpdir(), `tiempos-${process.pid}.f32`);
const r = spawnSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', audio, '-ar', '16000', '-ac', '1', '-f', 'f32le', crudo]);
if (r.status !== 0) throw new Error(String(r.stderr));
const datos = readFileSync(crudo);
rmSync(crudo);
const muestras = new Float32Array(datos.buffer, datos.byteOffset, datos.byteLength / 4);

// Las variantes "_timestamped" exportan la atencion cruzada que hace falta para los tiempos por palabra.
const asr = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-base_timestamped', { dtype: 'q8', device: 'cpu' });
// Con trozos de 30 s y solape, Whisper a veces pierde el primer tramo entero. Si hay inicios de parrafo,
// el audio se parte en esos inicios en trozos de menos de 28 s y cada trozo se transcribe de una vez.
const oidas = [];
const cortes = [0];
if (iniciosParrafo) {
  const totalMs = (muestras.length / 16000) * 1000;
  let desde = 0;
  while (totalMs - desde > 28000) {
    const validos = iniciosParrafo.filter((t) => t > desde + 3000 && t <= desde + 28000);
    const corte = validos.length ? validos[validos.length - 1] : desde + 28000;
    cortes.push(corte);
    desde = corte;
  }
}
for (let n = 0; n < cortes.length; n++) {
  const ini = cortes[n];
  const fin = cortes[n + 1];
  const trozo = muestras.subarray(Math.floor((ini / 1000) * 16000), fin === undefined ? undefined : Math.floor((fin / 1000) * 16000));
  const opciones = { return_timestamps: 'word', language: 'english', task: 'transcribe' };
  const resultado = await asr(trozo, iniciosParrafo ? opciones : { ...opciones, chunk_length_s: 30, stride_length_s: 5 });
  for (const c of resultado.chunks) oidas.push({ text: c.text.trim(), startMs: ini + Math.round(c.timestamp[0] * 1000), endMs: ini + Math.round((c.timestamp[1] ?? c.timestamp[0]) * 1000) });
}

const normal = (p) => p.toLowerCase().replace(/[^a-z0-9]/g, '');
// Coincidencia exacta o casi (una letra de diferencia en palabras largas, o mismo comienzo), para nombres y plurales.
function parecida(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5)) return true;
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 4) return false;
  let i = 0, j = 0, dif = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++dif > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return dif + (a.length - i) + (b.length - j) <= 1;
}
const palabras = readFileSync(textoRuta, 'utf8')
  .replace(/\r/g, '')
  .split(/\n\s*\n/)
  .flatMap((parrafo, n) => parrafo.split(/\s+/).filter(Boolean).map((text) => ({ text, par: n, startMs: null, endMs: null })));

let j = 0;
let parActual = -1;
for (const p of palabras) {
  // Con inicios de parrafo, cada parrafo se busca solo en su tramo de tiempo: si el emparejado se pierde, se recupera en el siguiente.
  let tope = oidas.length;
  if (iniciosParrafo) {
    const ini = (iniciosParrafo[p.par] ?? 0) - 600;
    const fin = (iniciosParrafo[p.par + 1] ?? Infinity) + 300;
    if (p.par !== parActual) {
      parActual = p.par;
      const primera = oidas.findIndex((o) => o.startMs >= ini);
      j = primera === -1 ? oidas.length : primera;
    }
    const fuera = oidas.findIndex((o, k) => k >= j && o.startMs > fin);
    if (fuera !== -1) tope = fuera;
  }
  // Las palabras cortas (and, the, of...) solo se buscan muy cerca, para no saltar a una aparicion posterior.
  const ventana = normal(p.text).length <= 3 ? 3 : 20;
  for (let k = j; k < Math.min(j + ventana, tope); k++) {
    if (parecida(normal(oidas[k].text), normal(p.text))) {
      p.startMs = oidas[k].startMs;
      p.endMs = oidas[k].endMs;
      j = k + 1;
      break;
    }
  }
}
const alineadas = palabras.filter((p) => p.startMs !== null).length;

// Una coincidencia fuera del tramo de su parrafo es un falso positivo y se descarta.
if (iniciosParrafo) {
  for (const p of palabras) {
    if (p.startMs === null) continue;
    const ini = iniciosParrafo[p.par] ?? 0;
    const fin = iniciosParrafo[p.par + 1] ?? Infinity;
    if (p.startMs < ini - 600 || p.startMs > fin + 300) { p.startMs = null; p.endMs = null; }
  }
}

// Si Whisper oyo menos de la mitad de un parrafo, sus pocas coincidencias no son fiables: se reparte entero.
if (iniciosParrafo) {
  iniciosParrafo.forEach((_, n) => {
    const suyas = palabras.filter((p) => p.par === n);
    if (suyas.filter((p) => p.startMs !== null).length < suyas.length / 2) for (const p of suyas) { p.startMs = null; p.endMs = null; }
  });
}

// Parrafos sin ninguna palabra reconocida: se reparten por su tramo de tiempo segun la longitud de cada palabra.
if (iniciosParrafo) {
  const finTotal = oidasFin();
  iniciosParrafo.forEach((ini, n) => {
    const suyas = palabras.filter((p) => p.par === n);
    if (!suyas.length || suyas.some((p) => p.startMs !== null)) return;
    const fin = (iniciosParrafo[n + 1] ?? finTotal) - 300;
    const total = suyas.reduce((a, p) => a + p.text.length + 2, 0);
    let t = ini;
    for (const p of suyas) {
      const d = ((fin - ini) * (p.text.length + 2)) / total;
      p.startMs = Math.round(t);
      p.endMs = Math.round(t + d);
      t += d;
    }
  });
}
// Si un parrafo empieza con palabras no oidas, su primera palabra se fija al inicio del parrafo para repartir bien el resto.
if (iniciosParrafo) {
  iniciosParrafo.forEach((ini, n) => {
    const primera = palabras.find((p) => p.par === n);
    if (primera && primera.startMs === null) { primera.startMs = ini; primera.endMs = ini + 250; }
  });
}
function oidasFin() { return oidas.at(-1)?.endMs ?? 0; }

// Las palabras que Whisper no reconocio se reparten entre sus vecinas conocidas.
const finAudio = oidas.at(-1)?.endMs ?? 0;
for (let i = 0; i < palabras.length; i++) {
  if (palabras[i].startMs !== null) continue;
  let fin = i;
  while (fin < palabras.length && palabras[fin].startMs === null) fin++;
  const desde = i > 0 ? palabras[i - 1].endMs : 0;
  const hasta = fin < palabras.length ? palabras[fin].startMs : finAudio;
  const paso = (hasta - desde) / (fin - i);
  for (let k = i; k < fin; k++) {
    palabras[k].startMs = Math.round(desde + paso * (k - i));
    palabras[k].endMs = Math.round(desde + paso * (k - i + 1));
  }
  i = fin - 1;
}

writeFileSync(salida, JSON.stringify(palabras.map(({ text, startMs, endMs }) => ({ text, startMs, endMs })), null, 1));
console.log(`${alineadas} de ${palabras.length} palabras alineadas con Whisper. Guardado en ${salida}`);

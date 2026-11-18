// Uso (desde GTa6): node herramientas/narrar.mjs <video-id|todos> [voz]
// Narra en español con Kokoro cada segmento de GTa6/videos/<id>.json.
// Escribe GTa6/animacion/public/gta/<id>/NN.wav y animacion/public/gta/<id>/tiempos.json (duración de cada segmento).
// Solo vuelve a narrar los segmentos cuyo texto ha cambiado.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { aFonemas } from './fonemas.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const { KokoroTTS } = await import(pathToFileURL(join(raiz, 'herramientas', 'node_modules', 'kokoro-js', 'dist', 'kokoro.js')).href);

const VELOCIDAD = 1.08;
const MUESTREO = 24000;
const COLA = 0.35; // silencio al final de cada segmento
const MAX = 260; // caracteres de IPA por llamada (Kokoro corta las entradas largas)

const objetivo = process.argv[2] ?? 'todos';
const voz = process.argv[3] ?? 'em_alex';
const carpetaVideos = join(aqui, '..', 'videos');
const ids = objetivo === 'todos' ? readdirSync(carpetaVideos).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [objetivo];

function guardarWav(ruta, muestras) {
  const datos = Buffer.alloc(muestras.length * 2);
  muestras.forEach((m, i) => datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, m)) * 32767), i * 2));
  const c = Buffer.alloc(44);
  c.write('RIFF', 0); c.writeUInt32LE(36 + datos.length, 4); c.write('WAVEfmt ', 8);
  c.writeUInt32LE(16, 16); c.writeUInt16LE(1, 20); c.writeUInt16LE(1, 22); c.writeUInt32LE(MUESTREO, 24);
  c.writeUInt32LE(MUESTREO * 2, 28); c.writeUInt16LE(2, 32); c.writeUInt16LE(16, 34); c.write('data', 36); c.writeUInt32LE(datos.length, 40);
  writeFileSync(ruta, Buffer.concat([c, datos]));
}

// Parte el texto por frases y las agrupa sin pasar de MAX fonemas.
function trozos(texto) {
  const frases = texto.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*\s*/g) ?? [texto];
  const grupos = [];
  for (const f of frases.map((x) => aFonemas(x)).filter(Boolean)) {
    if (grupos.length && (grupos.at(-1) + ' ' + f).length <= MAX) grupos[grupos.length - 1] += ' ' + f;
    else grupos.push(f);
  }
  // Una frase suelta demasiado larga se corta por comas.
  return grupos.flatMap((g) => {
    if (g.length <= MAX) return [g];
    const partes = [''];
    for (const p of g.split(/(?<=,)\s/)) {
      if ((partes.at(-1) + ' ' + p).length > MAX && partes.at(-1)) partes.push('');
      partes[partes.length - 1] = (partes.at(-1) + ' ' + p).trim();
    }
    return partes;
  });
}

let tts = null;
for (const id of ids) {
  const video = JSON.parse(readFileSync(join(carpetaVideos, `${id}.json`), 'utf8'));
  const destino = join(raiz, 'animacion', 'public', 'gta', id);
  mkdirSync(destino, { recursive: true });
  const tiempos = [];
  for (let s = 0; s < video.segmentos.length; s++) {
    const seg = video.segmentos[s];
    const nombre = String(s).padStart(2, '0');
    const wav = join(destino, `${nombre}.wav`);
    const firma = join(destino, `${nombre}.txt`);
    const clave = `${voz}\n${VELOCIDAD}\n${seg.voz}`;
    if (!(existsSync(wav) && existsSync(firma) && readFileSync(firma, 'utf8') === clave)) {
      tts ??= await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
      const inicio = Date.now();
      const partes = [];
      for (const t of trozos(seg.voz)) {
        const { input_ids } = tts.tokenizer(t, { truncation: true });
        const audio = await tts.generate_from_ids(input_ids, { voice: voz, speed: VELOCIDAD });
        partes.push(audio.audio, new Float32Array(Math.round(0.12 * MUESTREO)));
      }
      partes.push(new Float32Array(Math.round(COLA * MUESTREO)));
      const total = new Float32Array(partes.reduce((n, p) => n + p.length, 0));
      let pos = 0;
      for (const p of partes) { total.set(p, pos); pos += p.length; }
      guardarWav(wav, total);
      writeFileSync(firma, clave);
      console.log(`${id}/${nombre}: ${(total.length / MUESTREO).toFixed(1)} s en ${((Date.now() - inicio) / 1000).toFixed(0)} s`);
    }
    const bytes = readFileSync(wav).length - 44;
    tiempos.push(+(bytes / 2 / MUESTREO).toFixed(3));
  }
  writeFileSync(join(destino, 'tiempos.json'), JSON.stringify(tiempos));
  console.log(`${id}: ${tiempos.length} segmentos, ${(tiempos.reduce((a, b) => a + b, 0) / 60).toFixed(2)} min`);
}

// Uso: node herramientas/narrar.mjs <carpeta-del-proyecto> [voz]
// Narra con Kokoro cada bloque y cada Short de proyecto.json en audio/<nombre>.wav.
// Solo regenera los bloques cuyo texto ha cambiado desde la ultima vez.
// El phonemizer de kokoro-js relanza cualquier error y el mensaje real se pierde; se muestra aqui antes.
for (const evento of ['uncaughtException', 'unhandledRejection']) {
  process.on(evento, (e) => {
    console.error(`ERROR (${evento}):`, e?.stack ?? e);
    process.exit(1);
  });
}
const { KokoroTTS } = await import('kokoro-js');
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const VELOCIDAD = 1.12;
const PAUSA_PARRAFO = 0.38;
const MUESTREO = 24000;
const MAX_CARACTERES = 350;

const dir = resolve(process.argv[2] ?? '.');
const voz = process.argv[3] ?? 'af_heart';
const proyecto = JSON.parse(readFileSync(join(dir, 'proyecto.json'), 'utf8'));
mkdirSync(join(dir, 'audio'), { recursive: true });

// Kokoro corta las entradas largas, asi que se narra parrafo a parrafo y frase a frase si hace falta.
function trozos(texto) {
  return texto.split(/\n\s*\n/).flatMap((parrafo) => {
    const limpio = parrafo.replace(/\s+/g, ' ').trim();
    if (limpio.length <= MAX_CARACTERES) return [limpio];
    const frases = limpio.match(/[^.!?]+[.!?]+["”']?\s*/g) ?? [limpio];
    const grupos = [''];
    for (const f of frases) {
      if ((grupos.at(-1) + f).length > MAX_CARACTERES && grupos.at(-1)) grupos.push('');
      grupos[grupos.length - 1] += f;
    }
    return grupos.map((g) => g.trim());
  }).filter(Boolean);
}

function guardarWav(ruta, muestras) {
  const datos = Buffer.alloc(muestras.length * 2);
  muestras.forEach((m, i) => datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, m)) * 32767), i * 2));
  const cabecera = Buffer.alloc(44);
  cabecera.write('RIFF', 0);
  cabecera.writeUInt32LE(36 + datos.length, 4);
  cabecera.write('WAVEfmt ', 8);
  cabecera.writeUInt32LE(16, 16);
  cabecera.writeUInt16LE(1, 20);
  cabecera.writeUInt16LE(1, 22);
  cabecera.writeUInt32LE(MUESTREO, 24);
  cabecera.writeUInt32LE(MUESTREO * 2, 28);
  cabecera.writeUInt16LE(2, 32);
  cabecera.writeUInt16LE(16, 34);
  cabecera.write('data', 36);
  cabecera.writeUInt32LE(datos.length, 40);
  writeFileSync(ruta, Buffer.concat([cabecera, datos]));
}

const pendientes = [...proyecto.bloques, ...proyecto.shorts].filter((b) => {
  const firma = join(dir, 'audio', `${b.audio}.txt`);
  return !existsSync(firma) || readFileSync(firma, 'utf8') !== `${voz}\n${b.texto}`;
});
console.log(`${pendientes.length} audios por narrar con ${voz}`);
if (!pendientes.length) process.exit(0);

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
const silencio = new Float32Array(Math.round(PAUSA_PARRAFO * MUESTREO));

for (const b of pendientes) {
  const inicio = Date.now();
  const partes = [];
  for (const t of trozos(b.texto)) {
    const audio = await tts.generate(t, { voice: voz, speed: VELOCIDAD });
    partes.push(audio.audio, silencio);
  }
  const total = new Float32Array(partes.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of partes) {
    total.set(p, pos);
    pos += p.length;
  }
  guardarWav(join(dir, 'audio', `${b.audio}.wav`), total);
  writeFileSync(join(dir, 'audio', `${b.audio}.txt`), `${voz}\n${b.texto}`);
  console.log(`${b.audio}: ${(total.length / MUESTREO).toFixed(1)} s de audio en ${((Date.now() - inicio) / 1000).toFixed(0)} s`);
}

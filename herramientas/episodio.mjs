// Uso: node herramientas/episodio.mjs <carpeta-de-produccion>
// Prepara un episodio para la animacion: copia la narracion en mp3 a animacion/public/episodios/<carpeta>/
// y calcula cuando empieza cada parrafo buscando las pausas que narrar.mjs deja entre trozos.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(process.argv[2]);
const carpeta = basename(dir);
const proyecto = JSON.parse(readFileSync(join(dir, 'proyecto.json'), 'utf8'));
const destino = join(raiz, 'animacion', 'public', 'episodios', carpeta);
mkdirSync(destino, { recursive: true });

function localizar(exe) {
  if (spawnSync(exe, ['-version']).status === 0) return exe;
  const base = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  for (const pkg of readdirSync(base).filter((p) => p.startsWith('Gyan.FFmpeg'))) {
    for (const sub of readdirSync(join(base, pkg))) {
      const ruta = join(base, pkg, sub, 'bin', `${exe}.exe`);
      if (existsSync(ruta)) return ruta;
    }
  }
  throw new Error(`No se encuentra ${exe}`);
}
const ffmpeg = localizar('ffmpeg');
const ffprobe = localizar('ffprobe');

// Mismo reparto en trozos que narrar.mjs, recordando a que parrafo pertenece cada trozo.
const MAX_CARACTERES = 350;
function trozos(texto) {
  return texto.split(/\n\s*\n/).flatMap((parrafo, p) => {
    const limpio = parrafo.replace(/\s+/g, ' ').trim();
    if (!limpio) return [];
    if (limpio.length <= MAX_CARACTERES) return [{ p, texto: limpio }];
    const frases = limpio.match(/[^.!?]+[.!?]+["”']?\s*/g) ?? [limpio];
    const grupos = [''];
    for (const f of frases) {
      if ((grupos.at(-1) + f).length > MAX_CARACTERES && grupos.at(-1)) grupos.push('');
      grupos[grupos.length - 1] += f;
    }
    return grupos.map((g) => ({ p, texto: g.trim() }));
  });
}

function duracion(ruta) {
  return parseFloat(spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ruta], { encoding: 'utf8' }).stdout);
}

function silencios(ruta) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', ruta, '-af', 'silencedetect=noise=-45dB:d=0.3', '-f', 'null', '-'], { encoding: 'utf8' });
  const lista = [];
  let inicio = null;
  for (const linea of r.stderr.split('\n')) {
    const a = linea.match(/silence_start: ([\d.]+)/);
    const b = linea.match(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/);
    if (a) inicio = parseFloat(a[1]);
    if (b && inicio !== null) {
      lista.push({ inicio, fin: parseFloat(b[1]), largo: parseFloat(b[2]) });
      inicio = null;
    }
  }
  return lista;
}

const procesar = (b) => {
  const wav = join(dir, 'audio', `${b.audio}.wav`);
  const total = duracion(wav);
  const lista = trozos(b.texto);
  // Los cortes entre trozos son las pausas mas largas; se usan tantas como cortes haya.
  const cortes = silencios(wav)
    .filter((s) => s.fin < total - 0.2)
    .sort((x, y) => y.largo - x.largo)
    .slice(0, lista.length - 1)
    .map((s) => s.fin)
    .sort((x, y) => x - y);
  if (cortes.length !== lista.length - 1) console.warn(`${b.audio}: ${lista.length} trozos pero ${cortes.length + 1} tramos de audio`);

  const parrafos = [];
  lista.forEach((t, i) => {
    const desde = i === 0 ? 0 : cortes[i - 1] ?? total;
    if (parrafos.at(-1)?.p === t.p) parrafos.at(-1).texto += ` ${t.texto}`;
    else parrafos.push({ p: t.p, texto: t.texto, inicioMs: Math.round(desde * 1000) });
  });

  const mp3 = `${b.audio}.mp3`;
  spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-b:a', '128k', join(destino, mp3)]);
  return { titulo: b.titulo, audio: mp3, duracionMs: Math.round(total * 1000), parrafos: parrafos.map(({ texto, inicioMs }) => ({ texto, inicioMs })) };
};

const bloques = proyecto.bloques.map(procesar);
writeFileSync(join(destino, 'episodio.json'), JSON.stringify({ carpeta, bloques }, null, 1));

// Los Shorts se preparan igual; el texto completo se guarda aparte para sacar el tiempo de cada palabra.
const shorts = proyecto.shorts.filter((s) => existsSync(join(dir, 'audio', `${s.audio}.wav`))).map((s) => {
  writeFileSync(join(destino, `${s.audio}.txt`), s.texto);
  return procesar(s);
});
writeFileSync(join(destino, 'shorts.json'), JSON.stringify({ carpeta, shorts }, null, 1));
console.log(`${shorts.length} shorts preparados`);
let t = 0;
for (const b of bloques) {
  console.log(`\n== ${b.titulo} (${(b.duracionMs / 1000).toFixed(1)} s)`);
  b.parrafos.forEach((p, i) => console.log(`  ${i}  ${((t + p.inicioMs) / 1000).toFixed(1).padStart(6)}  ${p.texto.slice(0, 90)}`));
  t += b.duracionMs;
}

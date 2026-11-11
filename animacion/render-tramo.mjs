// Uso: node render-tramo.mjs <composicion> <desde> <hasta> <salida.mp4>
// Renderiza solo un rango de fotogramas (sin audio), para rehacer un bloque y empalmarlo en un video ya hecho.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpus } from 'node:os';

const aqui = dirname(fileURLToPath(import.meta.url));
const [id, desde, hasta, salida] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: resolve(aqui, 'src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
await renderMedia({
  serveUrl, composition, outputLocation: resolve(salida), concurrency: cpus().length,
  codec: 'h264', crf: 20, muted: true, frameRange: [Number(desde), Number(hasta) < 0 ? composition.durationInFrames - 1 : Number(hasta)], timeoutInMilliseconds: 120000,
  onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`${Math.round(progress * 100)}% `); },
});
console.log(`\n${salida}: fotogramas ${desde}-${hasta}`);

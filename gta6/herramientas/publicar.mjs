// Uso (desde GTa6): node herramientas/publicar.mjs
// Genera salida/PUBLICAR.md: título, descripción con capítulos (tiempos reales de la narración), etiquetas y miniatura de cada vídeo.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;

// Calendario pensado para el lanzamiento (jueves 19 de noviembre de 2026, medianoche hora local).
const INFO = {
  '01-hora': {
    publicar: 'Miércoles 18, ya (lo buscan antes de medianoche)',
    resumen: 'GTA 6 sale el jueves 19 de noviembre de 2026 en PS5 y Xbox Series X|S. Te explico a qué hora se desbloquea en España, Latinoamérica y Estados Unidos, qué hacer hoy para jugar a medianoche y qué hacer si no te deja entrar.',
    pregunta: '¿Desde qué país vas a jugar?',
    etiquetas: ['gta 6', 'a que hora sale gta 6', 'gta 6 hora de salida', 'gta 6 horario', 'gta 6 españa', 'gta 6 mexico', 'gta 6 argentina', 'gta 6 ps5', 'gta 6 xbox', 'gta 6 precarga', 'gta vi', 'cuando sale gta 6'],
  },
  '02-ediciones': {
    publicar: 'Miércoles 18 (antes del límite del bonus del día 20)',
    resumen: 'Edición Estándar (79,99 €) o Ultimate (99,99 €): qué incluye cada una, cómo funciona el contenido extra, el bonus de reserva Vintage Vice City Pack y cuál tiene más sentido según cómo juegues.',
    pregunta: '¿Estándar o Ultimate?',
    etiquetas: ['gta 6', 'gta 6 ultimate edition', 'gta 6 edicion estandar', 'gta 6 precio', 'gta 6 que edicion comprar', 'gta 6 ediciones', 'vintage vice city pack', 'gta 6 reserva', 'gta vi', 'gta 6 ps5', 'gta 6 xbox'],
  },
  '03-espacio': {
    publicar: 'Miércoles 18',
    resumen: 'La precarga de GTA 6 ocupa hasta 212 GB. Cuánto espacio útil tiene tu PS5 o Xbox Series, cómo liberar espacio, cómo usar un disco externo y cómo descargar más rápido.',
    pregunta: '¿Cuántos GB libres te quedan?',
    etiquetas: ['gta 6', 'gta 6 cuanto ocupa', 'gta 6 212 gb', 'gta 6 tamaño', 'gta 6 precarga', 'gta 6 ps5 espacio', 'gta 6 xbox series s', 'liberar espacio ps5', 'gta vi', 'gta 6 descarga'],
  },
  '04-pc': {
    publicar: 'Jueves 19',
    resumen: 'GTA 6 sale solo en consolas. Lo confirmado sobre la versión de PC, el rumor del primer trimestre de 2027, lo que tardaron GTA 5 y Red Dead Redemption 2 en llegar a PC, y por qué cualquier "descarga de GTA 6 para PC" hoy es una estafa.',
    pregunta: '¿Esperas a PC o te pasas a consola?',
    etiquetas: ['gta 6', 'gta 6 pc', 'gta 6 pc fecha', 'gta 6 steam', 'cuando sale gta 6 en pc', 'gta 6 pc requisitos', 'gta 6 pc descargar', 'gta vi pc', 'gta 6 estafa'],
  },
  '05-mapa': {
    publicar: 'Jueves 19',
    resumen: 'Leonida, el estado de GTA 6 inspirado en Florida, zona por zona: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia y Mount Kalaga. Mapa ilustrado propio y aproximado (no es el mapa oficial).',
    pregunta: '¿Qué zona vas a visitar primero?',
    etiquetas: ['gta 6', 'gta 6 mapa', 'mapa gta 6', 'leonida', 'gta 6 vice city', 'gta 6 leonida keys', 'grassrivers', 'port gellhorn', 'ambrosia gta 6', 'mount kalaga', 'gta vi map'],
  },
  '06-historia': {
    publicar: 'Jueves 19',
    resumen: 'Quiénes son Jason Duval y Lucía Caminos según sus perfiles oficiales, cuál es la premisa de la historia y quiénes son los personajes secundarios presentados. Cero spoilers del juego.',
    pregunta: '¿Con quién vas a jugar más, Jason o Lucía?',
    etiquetas: ['gta 6', 'gta 6 historia', 'jason gta 6', 'lucia gta 6', 'jason y lucia', 'gta 6 personajes', 'gta 6 sin spoilers', 'gta 6 protagonistas', 'gta vi story', 'boobie ike', 'cal hampton'],
  },
  '07-online': {
    publicar: 'Viernes 20',
    resumen: '¿GTA 6 tiene modo online? Lo que ha dicho (y no ha dicho) Rockstar, qué pasó con GTA 5 y Red Dead 2, los rumores sobre 2027 y qué pasa con el GTA Online actual.',
    pregunta: '¿Historia u online?',
    etiquetas: ['gta 6', 'gta 6 online', 'gta 6 multijugador', 'gta online', 'gta 6 tiene online', 'gta 6 online fecha', 'gta online gta 6', 'gta vi online'],
  },
  '08-vice-city': {
    publicar: 'Sábado 21',
    resumen: 'La historia de Vice City en la saga: del GTA original de 1997 a GTA Vice City (2002), Vice City Stories (2006) y la vuelta en GTA 6.',
    pregunta: '¿Cuál fue tu primera vez en Vice City?',
    etiquetas: ['gta 6', 'vice city', 'gta vice city', 'historia de vice city', 'vice city stories', 'tommy vercetti', 'gta 6 vice city', 'saga gta'],
  },
  '09-espera': {
    publicar: 'Miércoles 18 por la tarde (antes del lanzamiento)',
    resumen: 'De GTA 5 en 2013 al lanzamiento de GTA 6: el anuncio de 2022, la gran filtración, los tráileres récord, los dos retrasos y la recta final.',
    pregunta: '¿Cuántos años tenías cuando salió GTA 5?',
    etiquetas: ['gta 6', 'historia de gta 6', 'gta 6 retraso', 'gta 6 filtracion', 'gta 6 trailer', 'gta 6 espera', 'gta 5', 'gta vi'],
  },
  '10-records': {
    publicar: 'Domingo 22',
    resumen: 'Los récords y cifras de GTA 6 antes de salir: el récord Guinness del primer tráiler, los 475 millones de visitas del segundo, las búsquedas en Google, el precio y la herencia de GTA 5.',
    pregunta: '¿Crees que GTA 6 batirá el récord de GTA 5?',
    etiquetas: ['gta 6', 'gta 6 records', 'gta 6 trailer record', 'gta 6 guinness', 'gta 6 ventas', 'gta 5 ventas', 'gta vi', 'gta 6 curiosidades'],
  },
};

const MINIS = {
  '01-hora': '¿A QUÉ HORA / SALE GTA 6?', '02-ediciones': '¿80 € O 100 €? / GTA 6', '03-espacio': '212 GB / ¿TE CABE?',
  '04-pc': '¿GTA 6 / EN PC?', '05-mapa': 'EL MAPA / DE GTA 6', '06-historia': 'JASON Y LUCÍA / SIN SPOILERS',
  '07-online': '¿Y EL / ONLINE?', '08-vice-city': 'VICE CITY / 1997 → 2026', '09-espera': '13 AÑOS / DE ESPERA', '10-records': 'RÉCORD / SIN SALIR',
};

const marca = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let md = '# Mapa Neón · textos para publicar\n\nCanal no oficial. Vídeos en 1920x1080 en `salida/`, miniaturas `salida/miniatura-*.jpg`.\n\n';
for (const id of Object.keys(INFO)) {
  const guion = JSON.parse(readFileSync(join(raiz, 'videos', `${id}.json`), 'utf8'));
  const rutaT = join(raiz, 'salida', `${id}-tiempos.json`);
  const tiempos = existsSync(rutaT) ? JSON.parse(readFileSync(rutaT, 'utf8')) : null;
  const caps = [];
  let t = 0;
  guion.segmentos.forEach((s, i) => {
    if (s.capitulo) caps.push(`${marca(t)} ${s.capitulo}`);
    t += tiempos ? Math.ceil(tiempos[i] * FPS) / FPS : 0;
  });
  const info = INFO[id];
  md += `---\n\n## ${id}\n\n**Publicar:** ${info.publicar}  \n**Archivo:** \`salida/${id}.mp4\` (${tiempos ? marca(t + 2) : '?'})  \n**Miniatura:** \`salida/miniatura-${id}.jpg\` (texto: ${MINIS[id]})\n\n`;
  md += `**Título**\n\`\`\`\n${guion.titulo}\n\`\`\`\n\n**Descripción**\n\`\`\`\n${info.resumen}\n\n💬 ${info.pregunta} Te leo en los comentarios.\n\n`;
  md += `⏱️ Capítulos\n${tiempos ? caps.join('\n') : '(faltan tiempos)'}\n\n`;
  md += `🔔 Suscríbete a Mapa Neón para todas las guías de GTA 6 en español.\n\n`;
  md += `ℹ️ Canal no oficial, sin relación con Rockstar Games ni Take-Two. Animaciones, música e ilustraciones de personajes originales del canal (fan art, no arte oficial). La información refleja lo publicado antes del lanzamiento: lo no confirmado se indica como rumor o estimación. Voz sintética (IA).\n\n#GTA6 #GTAVI #Leonida\n\`\`\`\n\n`;
  md += `**Etiquetas**\n\`\`\`\n${info.etiquetas.join(', ')}\n\`\`\`\n\n`;
}
writeFileSync(join(raiz, 'salida', 'PUBLICAR.md'), md);
console.log('salida/PUBLICAR.md listo');

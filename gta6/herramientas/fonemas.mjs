// Convierte texto en español (acento latino, con seseo) a los fonemas IPA que entiende Kokoro.
// kokoro-js solo fonetiza inglés; sus voces españolas (em_alex, ef_dora) necesitan el texto ya en IPA.
// Uso como módulo: import { aFonemas } from './fonemas.mjs'
// Uso de prueba:   node fonemas.mjs "texto"

// Palabras extranjeras o siglas reescritas como se dicen en español (claves en minúsculas).
export const PRONUNCIA = {
  'gta': 'ye te á', 'rockstar': 'rókstar', 'games': 'guéims', 'take-two': 'téik tú',
  'xbox': 'équis box', 'ps5': 'pé ése cínco', 'ps4': 'pé ése cuátro', 'playstation': 'pléisteishon',
  'series': 'séries', 'jason': 'yéison', 'lucia': 'lusía', 'lucía': 'lusía', 'duval': 'duvál', 'caminos': 'camínos',
  'vice': 'váis', 'city': 'síti', 'online': 'onláin', 'ultimate': 'áltimeit', 'edition': 'edíshon',
  'trailer': 'tréiler', 'tráiler': 'tréiler', 'tráileres': 'tréilers', 'trailers': 'tréilers', 'gb': 'gígas', 'tb': 'terabáit',
  'pc': 'pé cé', 'steam': 'estím', 'leonida': 'leonída', 'keys': 'kís', 'port': 'pórt', 'gellhorn': 'guélhorn',
  'ambrosia': 'ambrósia', 'grassrivers': 'grasrívers', 'kalaga': 'kalága', 'mount': 'máunt', 'youtube': 'yutúb',
  'tiktok': 'tíktok', 'guinness': 'guínes', 'plus': 'plás', 'standard': 'estándar', 'pack': 'pák', 'vintage': 'víntash',
  'newswire': 'niúswaier', 'bloomberg': 'blúmberg', 'schreier': 'shráier', 'andreas': 'andréas', 'liberty': 'líberti',
  'red': 'réd', 'dead': 'déd', 'redemption': 'ridémshon', 'tommy': 'tómi', 'vercetti': 'verséti', 'stories': 'estóris',
  'miami': 'maiámi', 'bonnie': 'bóni', 'clyde': 'cláid', 'nvme': 'ene uve eme é', 'ssd': 'ése ése dé', 'hdmi': 'áche dé éme í',
  'fps': 'efe pe ese', 'hdr': 'áche dé érre', 'dlc': 'dé éle cé', 'cheetah': 'chíta', 'grotti': 'gróti', 'twitch': 'tuích',
  'ok': 'okéi', 'spoilers': 'espóilers', 'spoiler': 'espóiler', 'hype': 'jáip', 'fans': 'fáns', 'fan': 'fán',
  'gameplay': 'guéimplei', 'shorts': 'shórts', 'short': 'shórt', 'link': 'línk', 'méxico': 'méjico', 'texas': 'téjas',
  'neon': 'neón', 'iv': 'cuátro', 'vi': 'séis', 'iii': 'trés', 'ign': 'í yé éne', 'leaks': 'líks', 'leak': 'lík',
  'hacker': 'jáker', 'teaser': 'tíser', 'marketing': 'márketin', 'vs': 'contra', 'easter': 'íster', 'eggs': 'égs',
  'store': 'estór', 'microsoft': 'máicrosoft', 'sony': 'sóni', 'justice': 'yástis', 'extended': 'eksténded', 'look': 'lúk',
  'roleplay': 'rólplei', 'switch': 'suích', 'sandy': 'sándi', 'shores': 'shórs', 'blaine': 'bléin', 'county': 'cáunti',
  'pro': 'pró', 'game': 'guéim', 'pass': 'pás', 'web': 'uéb', 'newsletter': 'niúsleter', 'show': 'shóu', 'reality': 'riáliti',
  'influencer': 'influénser', 'influencers': 'influénsers', 'stream': 'estrím', 'streamers': 'estrímers', 'like': 'láik',
  'reddit': 'rédit', 'x': 'équis', 'twitter': 'tuíter', 'instagram': 'ínstagram', 'tommy vercetti': 'tómi verséti',
  'mapa neón': 'mápa neón', 'bully': 'búli', 'max': 'máks', 'payne': 'péin', 'l.a.': 'él éi', 'noire': 'nuár',
  'heist': 'jáist', 'heists': 'jáists', 'killer': 'kíler', 'crypto': 'crípto', 'sale': 'sále', 'hd': 'áche dé',
  'ram': 'rám', 'gpu': 'yí pi iú', 'cpu': 'sí pi iú', 'nvidia': 'envídia', 'amd': 'á éme dé', 'gamer': 'guéimer',
  'gamers': 'guéimers', 'v': 'cínco', 's': 'ése', 'bae-luxe': 'béi lúks', 'roxy': 'róksi', 'only': 'ónli', 'raw': 'ró', 'records': 'récords', 'dre': 'dré', 'quan': 'kuán', 'hampton': 'jámpton', 'heder': 'jéder', 'boobie': 'búbi', 'ike': 'áik', 'gamesbeat': 'guéimsbit', 'dwnply': 'dáunplei', 'ready': 'rédi', 'flow': 'flóu', 'boxed': 'bóksd', 'mini': 'míni',
};

const UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
  'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

export function numero(n) {
  if (n < 30) return UNIDADES[n];
  if (n < 100) return DECENAS[Math.floor(n / 10)] + (n % 10 ? ' y ' + UNIDADES[n % 10] : '');
  if (n === 100) return 'cien';
  if (n < 1000) return CENTENAS[Math.floor(n / 100)] + (n % 100 ? ' ' + numero(n % 100) : '');
  if (n < 1e6) {
    const m = Math.floor(n / 1000);
    return (m === 1 ? 'mil' : numero(m).replace(/uno$/, 'ún') + ' mil') + (n % 1000 ? ' ' + numero(n % 1000) : '');
  }
  const m = Math.floor(n / 1e6);
  return (m === 1 ? 'un millón' : numero(m).replace(/uno$/, 'ún') + ' millones') + (n % 1e6 ? ' ' + numero(n % 1e6) : '');
}

function escapa(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Siglas, palabras extranjeras, cifras y símbolos a palabras pronunciables.
export function normalizar(texto) {
  let t = ' ' + texto + ' ';
  t = t.replace(/[“”«»"]/g, '').replace(/[—–]/g, ', ').replace(/…/g, '...').replace(/[¿¡]/g, '');
  for (const [k, v] of Object.entries(PRONUNCIA).filter(([k]) => /[ .]/.test(k))) {
    t = t.replace(new RegExp(`(?<![\\p{L}])${escapa(k)}(?![\\p{L}])`, 'giu'), () => v);
  }
  t = t.replace(/[\p{L}\p{N}\-]+/gu, (w) => {
    const k = w.toLowerCase();
    return Object.prototype.hasOwnProperty.call(PRONUNCIA, k) ? PRONUNCIA[k] : w;
  });
  t = t.replace(/(\d+),(\d{2})\s*(€|euros)/gi, (_, a, b) => `${numero(+a)} euros con ${numero(+b)}`);
  t = t.replace(/(\d+)\.(\d{2})\s*(\$|dólares)/gi, (_, a, b) => `${numero(+a)} dólares con ${numero(+b)}`);
  t = t.replace(/\$\s?(\d+)\.(\d{2})/g, (_, a, b) => `${numero(+a)} dólares con ${numero(+b)}`);
  t = t.replace(/\$\s?(\d+)/g, (_, a) => `${numero(+a)} dólares`);
  t = t.replace(/(\d+)\s?€/g, (_, a) => `${numero(+a)} euros`);
  t = t.replace(/(\d+)\s?%/g, (_, a) => `${numero(+a)} por ciento`);
  t = t.replace(/(\d+):(\d{2})/g, (_, h, m) => `${numero(+h)}${+m ? ' y ' + numero(+m) : ''}`);
  t = t.replace(/(\d+)\s?gígas/gi, (_, a) => `${numero(+a)} gígas`);
  t = t.replace(/(\d+)\.(\d{3})(?!\d)/g, (_, a, b) => a + b).replace(/(\d+)\.(\d{3})(?!\d)/g, (_, a, b) => a + b);
  t = t.replace(/(\d+),(\d+)/g, (_, a, b) => `${numero(+a)} coma ${b.split('').map((d) => numero(+d)).join(' ')}`);
  t = t.replace(/\d+/g, (d) => numero(+d));
  t = t.replace(/&/g, ' y ').replace(/\+/g, ' plás ').replace(/#/g, '').replace(/\//g, ' o ');
  return t.replace(/\s+/g, ' ').trim();
}

const ATONAS = new Set(['el', 'la', 'los', 'las', 'lo', 'le', 'les', 'un', 'una', 'unos', 'unas', 'de', 'del', 'a', 'al', 'en',
  'y', 'e', 'o', 'u', 'que', 'se', 'me', 'te', 'nos', 'os', 'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'por', 'con', 'sin', 'si',
  'para', 'pero', 'como', 'cuando', 'donde', 'porque', 'ni', 'tan', 'muy', 'hasta', 'desde', 'entre', 'sobre', 'tras', 'contra']);
const FUERTES = 'aeoáéóíú';
const VOCALES = 'aeiouáéíóúü';
const QUITA_TILDE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };

// Separa una palabra en grafemas; los dígrafos cuentan como una unidad. 'G' es una g siempre dura.
function grafemas(w) {
  const g = [];
  for (let i = 0; i < w.length; i++) {
    const c = w[i], n = w[i + 1], n2 = w[i + 2];
    if (c === 'c' && n === 'h') { g.push('ch'); i++; continue; }
    if (c === 's' && n === 'h') { g.push('sh'); i++; continue; }
    if (c === 'l' && n === 'l') { g.push('ll'); i++; continue; }
    if (c === 'r' && n === 'r') { g.push('rr'); i++; continue; }
    if (c === 'q' && n === 'u') { g.push('k'); i++; continue; }
    if (c === 'g' && n === 'u' && n2 && 'eéií'.includes(n2)) { g.push('G'); i++; continue; }
    if (c === 'g' && n === 'ü') { g.push('G'); continue; }
    if (c === 'y' && i === w.length - 1 && i > 0 && VOCALES.includes(w[i - 1])) { g.push('i'); continue; }
    g.push(c);
  }
  return g;
}

function palabra(w, ctx) {
  w = w.toLowerCase();
  if (w === 'y') return { ipa: 'i', ultimo: 'i' };
  const g = grafemas(w);
  // Núcleos: tramos de vocales seguidas, partidos entre dos vocales fuertes (hiato).
  const nucleos = [];
  for (let i = 0; i < g.length; i++) {
    if (!VOCALES.includes(g[i]) || g[i].length > 1) continue;
    const prev = g[i - 1];
    const sigue = nucleos.length && nucleos.at(-1).at(-1) === i - 1 && !(FUERTES.includes(g[i]) && FUERTES.includes(prev));
    if (sigue) nucleos.at(-1).push(i); else nucleos.push([i]);
  }
  let tonica = nucleos.findIndex((nu) => nu.some((i) => 'áéíóú'.includes(g[i])));
  if (tonica < 0) {
    const fin = w.at(-1);
    if (nucleos.length === 1) tonica = ATONAS.has(w) ? -1 : 0;
    else tonica = 'aeiouns'.includes(fin) ? nucleos.length - 2 : nucleos.length - 1;
  }
  // Vocal principal de cada núcleo: la fuerte, o la segunda si las dos son débiles.
  const papel = new Map();
  const principales = [];
  nucleos.forEach((nu) => {
    let p = nu.find((i) => FUERTES.includes(g[i]));
    if (p === undefined) p = nu.at(-1);
    principales.push(p);
    nu.forEach((i) => { if (i !== p) papel.set(i, i < p ? 'antes' : 'despues'); });
  });
  const tonicaVocal = tonica >= 0 ? principales[tonica] : -1;

  let out = '';
  let prev = ctx.prev; // último fonema emitido; null tras una pausa
  const emite = (f) => { out += f; prev = f.at(-1); };
  const inicioPausa = ctx.prev === null;
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    const n = g[i + 1];
    if (VOCALES.includes(c)) {
      const base = QUITA_TILDE[c] ?? c;
      const rol = papel.get(i);
      if (i === tonicaVocal) out += 'ˈ';
      if (rol === 'antes') emite(base === 'i' ? 'j' : base === 'u' ? 'w' : base);
      else if (rol === 'despues') emite(base === 'i' ? 'j' : base);
      else emite(base);
      continue;
    }
    const tras = (set) => prev && set.includes(prev);
    const duro = (i === 0 && inicioPausa) || tras('mnŋɲ');
    switch (c) {
      case 'b': case 'v': emite(duro ? 'b' : 'β'); break;
      case 'd': emite(duro || tras('l') ? 'd' : 'ð'); break;
      case 'g': if (n && 'eiéí'.includes(n)) { emite('x'); break; } emite(duro ? 'g' : 'ɣ'); break;
      case 'G': emite(duro ? 'g' : 'ɣ'); break;
      case 'c': emite(n && 'eiéí'.includes(n) ? 's' : 'k'); break;
      case 'k': case 'q': emite('k'); break;
      case 'z': emite('s'); break;
      case 's': emite(n && 'bdgmnlrvyG'.includes(n) ? 'z' : 's'); break;
      case 'ch': emite('tʃ'); break;
      case 'sh': emite('ʃ'); break;
      case 'j': emite('x'); break;
      case 'h': break;
      case 'll': case 'y': emite('ʝ'); break;
      case 'ñ': emite('ɲ'); break;
      case 'n': {
        const sig = n === 'c' && !'eiéí'.includes(g[i + 2] ?? '') ? 'k' : n;
        emite(sig && 'bvpm'.includes(sig) ? 'm' : sig && 'kgjqG'.includes(sig) ? 'ŋ' : 'n');
        break;
      }
      case 'rr': emite('r'); break;
      case 'r': emite(i === 0 || tras('nls') ? 'r' : 'ɾ'); break;
      case 'x': emite('ks'); break;
      case 'w': emite('w'); break;
      default: if (/[a-z]/.test(c)) emite(c);
    }
  }
  return { ipa: out.replace(/ss/g, 's'), ultimo: prev };
}

export function aFonemas(texto) {
  const t = normalizar(texto);
  const fichas = t.match(/\.\.\.|[\p{L}]+|[.,!?;:]/gu) ?? [];
  let ctx = { prev: null };
  const salida = [];
  for (const f of fichas) {
    if (/^(\.\.\.|[.,!?;:])$/u.test(f)) {
      const p = f === ';' || f === ':' ? ',' : f;
      if (salida.length && !/[.,!?]$/.test(salida.at(-1))) salida[salida.length - 1] += p;
      ctx = { prev: null };
      continue;
    }
    const r = palabra(f, ctx);
    if (!r.ipa) continue;
    salida.push(r.ipa);
    ctx = { prev: r.ultimo };
  }
  return salida.join(' ');
}

if (process.argv[1] && process.argv[1].endsWith('fonemas.mjs') && process.argv[2]) {
  console.log(normalizar(process.argv[2]));
  console.log(aFonemas(process.argv[2]));
}

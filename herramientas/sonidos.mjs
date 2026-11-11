// Uso: node herramientas/sonidos.mjs
// Sintetiza con FFmpeg una biblioteca propia de musica ambiental y sonidos de ambiente en animacion/public/audio/.
// Al ser sonido generado aqui, no tiene derechos de terceros ni puede recibir reclamaciones de Content ID.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'animacion', 'public', 'audio');
mkdirSync(salida, { recursive: true });

function localizar() {
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
const ffmpeg = localizar();

function generar(nombre, filtro, segundos) {
  const destino = join(salida, `${nombre}.wav`);
  const fundido = `afade=t=in:d=1.5,afade=t=out:st=${segundos - 1.5}:d=1.5,aformat=sample_rates=48000:channel_layouts=stereo,alimiter=limit=0.9`;
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-filter_complex', `${filtro},${fundido}[fin]`, '-map', '[fin]', '-t', String(segundos), destino], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${nombre}: ${r.stderr}`);
  console.log(`${nombre}.wav`);
}

const ruido = (color, seg, semilla) => `anoisesrc=color=${color}:sample_rate=48000:duration=${seg}:seed=${semilla}`;
const reverb = 'aecho=0.8:0.75:420|860|1300:0.35|0.25|0.15';

// Nota sostenida con varias voces ligeramente desafinadas, como un pad de cuerdas.
const nota = (f, amp) => [0, 0.6, -0.5].map((d) => `${(amp / 3).toFixed(3)}*sin(2*PI*${(f + d).toFixed(2)}*t)`).join('+');
function acordes(nombre, lista, porAcorde, brillo) {
  const partes = lista.map((frecuencias, i) => {
    const envolvente = `min(t/2.5\\,1)*min((${porAcorde}-t)/2.5\\,1)`;
    const voces = frecuencias.map((f, k) => nota(f, k === 0 ? 0.32 : 0.18)).join('+');
    return `aevalsrc='(${voces})*${envolvente}*(0.85+0.15*sin(2*PI*0.2*t))':s=48000:d=${porAcorde}[c${i}]`;
  });
  let cadena = '[c0]';
  const cruces = [];
  for (let i = 1; i < lista.length; i++) {
    const fin = i === lista.length - 1 ? '[mix]' : `[x${i}]`;
    cruces.push(`${cadena}[c${i}]acrossfade=d=2${fin}`);
    cadena = fin;
  }
  const total = lista.length * porAcorde - (lista.length - 1) * 2;
  generar(nombre, `${partes.join(';')};${cruces.join(';')};[mix]lowpass=f=${brillo},${reverb},volume=1.6`, total);
}

const SEG = 90;

// Ambientes.
generar('viento', `${ruido('pink', SEG, 1)},highpass=f=180,lowpass=f=1400,tremolo=f=0.13:d=0.7,volume=1.4[a];${ruido('brown', SEG, 2)},lowpass=f=500,tremolo=f=0.1:d=0.6,volume=2[b];[a][b]amix=inputs=2:normalize=0`, SEG);
generar('mar', `${ruido('brown', SEG, 3)},lowpass=f=650,tremolo=f=0.11:d=0.85,volume=2.4[a];${ruido('pink', SEG, 4)},highpass=f=1800,lowpass=f=6000,tremolo=f=0.11:d=0.9,volume=0.5[b];[a][b]amix=inputs=2:normalize=0`, SEG);
generar('lluvia', `${ruido('white', SEG, 5)},highpass=f=1200,lowpass=f=9000,volume=0.35[a];${ruido('pink', SEG, 6)},lowpass=f=900,volume=0.7[b];[a][b]amix=inputs=2:normalize=0`, SEG);
generar('trueno', `${ruido('brown', 9, 7)},lowpass=f=260,volume=6,afade=t=in:d=0.08,afade=t=out:st=0.3:d=8:curve=exp,aecho=0.8:0.6:300|700:0.4|0.3`, 9);
generar('bajo-el-agua', `${ruido('brown', SEG, 8)},lowpass=f=220,tremolo=f=0.1:d=0.5,volume=3[a];aevalsrc='0.05*sin(2*PI*40*t)':s=48000:d=${SEG}[b];[a][b]amix=inputs=2:normalize=0`, SEG);
generar('sonar', `aevalsrc='0.6*sin(2*PI*1180*t)*exp(-5*t)':s=48000:d=2.5,aecho=0.8:0.8:350|700:0.45|0.25`, 2.5);

// Musica.
generar('musica-tenebrosa', `aevalsrc='0.24*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.05*t))+0.17*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.07*t+1))+0.11*sin(2*PI*110.6*t)+0.09*sin(2*PI*130.81*t)*(0.5+0.5*sin(2*PI*0.03*t))+0.05*sin(2*PI*155.56*t)*(0.5+0.5*sin(2*PI*0.09*t+2))':s=48000:d=${SEG},lowpass=f=900,${reverb},volume=1.5`, SEG);
generar('musica-tension', `aevalsrc='0.55*sin(2*PI*49*t)*exp(-9*mod(t\\,0.5))+0.07*sin(2*PI*196*t)*(0.5+0.5*sin(2*PI*7*t))+0.05*sin(2*PI*207.65*t)*(0.5+0.5*sin(2*PI*7*t+1))+0.12*sin(2*PI*98*t)':s=48000:d=${SEG},lowpass=f=1500,${reverb},volume=1.4`, SEG);
// Suspense: dos graves que chocan entre si, un latido lento y agudos que crecen y se apagan.
generar('musica-suspense', `aevalsrc='0.2*sin(2*PI*55*t)+0.15*sin(2*PI*58.27*t)+0.5*sin(2*PI*48*t)*(exp(-14*mod(t\\,1.6))+0.7*exp(-14*mod(t-0.28\\,1.6)))+0.04*sin(2*PI*880*t)*(0.5+0.5*sin(2*PI*0.08*t))+0.035*sin(2*PI*932.33*t)*(0.5+0.5*sin(2*PI*0.06*t+1))+0.06*sin(2*PI*164.81*t)*(0.5+0.5*sin(2*PI*0.04*t+2))':s=48000:d=${SEG},lowpass=f=2500,${reverb},volume=1.4`, SEG);
// Misterio: notas sueltas que se repiten a ritmos distintos sobre un pedal grave, sin patron obvio.
const pulsacion = (f, periodo, fase, amp) => `${amp}*sin(2*PI*${f}*t)*exp(-2.2*mod(t+${fase}\\,${periodo}))`;
generar('musica-misterio', `aevalsrc='${[
  pulsacion(220, 2.3, 0, 0.22), pulsacion(261.63, 3.1, 0.7, 0.18), pulsacion(329.63, 4.3, 1.9, 0.16), pulsacion(196, 5.9, 2.6, 0.2), pulsacion(392, 7.7, 4.1, 0.1),
].join('+')}+0.1*sin(2*PI*110*t)*(0.6+0.4*sin(2*PI*0.05*t))':s=48000:d=${SEG},lowpass=f=3000,${reverb},volume=2.2`, SEG);
acordes('musica-triste', [[110, 130.81, 164.81], [87.31, 110, 130.81], [65.41, 130.81, 164.81], [98, 123.47, 146.83]], 9, 1100);
acordes('musica-esperanza', [[130.81, 164.81, 196, 261.63], [98, 146.83, 196, 246.94], [110, 164.81, 220, 261.63], [87.31, 130.81, 174.61, 220]], 8, 2600);

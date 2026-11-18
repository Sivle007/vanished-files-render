import React from 'react';
import { AbsoluteFill, Audio, CalculateMetadataFunction, Composition, interpolate, Sequence, staticFile, Still, useCurrentFrame } from 'remotion';
import { Acabado, FondoGTA } from './Fondos';
import { Escena, EscenaGTA, LogoNeon, MapaLeonida, PersonajeGTA } from './Escenas';
import { C, FPS, Fondo, FUENTE_TEXTO, FUENTE_TITULO, neon } from './estilo';
import v01 from '../../../videos/01-hora.json';
import v02 from '../../../videos/02-ediciones.json';
import v03 from '../../../videos/03-espacio.json';
import v04 from '../../../videos/04-pc.json';
import v05 from '../../../videos/05-mapa.json';
import v06 from '../../../videos/06-historia.json';
import v07 from '../../../videos/07-online.json';
import v08 from '../../../videos/08-vice-city.json';
import v09 from '../../../videos/09-espera.json';
import v10 from '../../../videos/10-records.json';
import v11 from '../../../videos/11-confirmado.json';
import { Acc, Expr, Presentador } from './Presentadores';

type Segmento = { voz: string; capitulo?: string; escena: Escena & { fondo?: Fondo }; habla?: 'L' | 'M' | 'N'; exprL?: Expr; exprM?: Expr; accL?: Acc; accM?: Acc };
type Guion = { titulo: string; presentadores?: boolean; segmentos: Segmento[] };

export const GUIONES: Record<string, Guion> = {
  '01-hora': v01 as Guion, '02-ediciones': v02 as Guion, '03-espacio': v03 as Guion, '04-pc': v04 as Guion,
  '05-mapa': v05 as Guion, '06-historia': v06 as Guion, '07-online': v07 as Guion, '08-vice-city': v08 as Guion,
  '09-espera': v09 as Guion, '10-records': v10 as Guion, '11-confirmado': v11 as Guion,
};

const COLA = 2 * FPS; // 2 s extra al final con la última escena
type Props = { id: string; tiempos: number[] };

const Transicion: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7], [1, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: `linear-gradient(90deg, ${C.rosa}, ${C.cian})`, opacity: o * 0.55, mixBlendMode: 'screen' }} />;
};

const Marca: React.FC = () => (
  <div style={{ position: 'absolute', right: 40, bottom: 26, opacity: 0.85, transform: 'scale(0.32)', transformOrigin: 'bottom right' }}>
    <LogoNeon tam={120} />
  </div>
);

// Contenido reducido en el centro y Leo (izquierda) y Marisol (derecha) a los lados; en "plato", los dos en grande.
export const ConPresentadores: React.FC<{ s: Segmento; dur: number }> = ({ s, dur }) => {
  const plato = s.escena.tipo === 'plato';
  const alto = plato ? 820 : 700;
  const host = (quien: 'leo' | 'marisol') => {
    const habla = s.habla === (quien === 'leo' ? 'L' : 'M');
    const otro = s.habla && s.habla !== 'N' && !habla;
    const lado = quien === 'leo' ? { left: plato ? 330 : -40 } : { right: plato ? 330 : -40 };
    return (
      <div style={{ position: 'absolute', bottom: plato ? -60 : -130, ...lado, transform: `scale(${otro ? 0.95 : 1})`, transformOrigin: 'bottom center', opacity: otro ? 0.9 : 1, filter: habla ? 'drop-shadow(0 0 18px #ff2e8899)' : 'none' }}>
        <Presentador quien={quien} expr={(quien === 'leo' ? s.exprL : s.exprM) ?? 'normal'} habla={habla} acc={quien === 'leo' ? s.accL : s.accM} alto={alto} />
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {plato ? <EscenaGTA e={s.escena} duracion={dur} /> : (
        <AbsoluteFill style={{ transform: 'scale(0.76) translateY(-70px)' }}><EscenaGTA e={s.escena} duracion={dur} /></AbsoluteFill>
      )}
      {host('leo')}
      {host('marisol')}
    </AbsoluteFill>
  );
};

export const VideoGTA: React.FC<Props> = ({ id, tiempos }) => {
  const guion = GUIONES[id];
  let desde = 0;
  const total = tiempos.reduce((a, b) => a + Math.ceil(b * FPS), 0) + COLA;
  return (
    <AbsoluteFill style={{ background: C.noche }}>
      <Audio src={staticFile('gta/musica.wav')} loop volume={(f) => interpolate(f, [0, 30, total - 60, total], [0, 0.08, 0.08, 0], { extrapolateRight: 'clamp' })} />
      {guion.segmentos.map((s, i) => {
        const dur = Math.ceil((tiempos[i] ?? 3) * FPS) + (i === guion.segmentos.length - 1 ? COLA : 0);
        const el = (
          <Sequence key={i} from={desde} durationInFrames={dur} name={`${i} ${s.escena.tipo}`}>
            <FondoGTA tipo={s.escena.fondo ?? 'noche'} />
            {guion.presentadores ? <ConPresentadores s={s} dur={dur} /> : <EscenaGTA e={s.escena} duracion={dur} />}
            <Transicion />
            <Audio src={staticFile(`gta/${id}/${String(i).padStart(2, '0')}.wav`)} />
          </Sequence>
        );
        desde += dur;
        return el;
      })}
      <Marca />
      <Acabado />
    </AbsoluteFill>
  );
};

const metadatos: CalculateMetadataFunction<Props> = async ({ props }) => {
  // Sin narración (revisión de fotogramas), 8 s por segmento.
  const n = GUIONES[props.id].segmentos.length;
  let tiempos: number[] = await fetch(staticFile(`gta/${props.id}/tiempos.json`)).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  if (!Array.isArray(tiempos)) tiempos = [];
  if (tiempos.length < n) tiempos = Array.from({ length: n }, (_, i) => tiempos[i] ?? 8);
  const frames = tiempos.reduce((a, b) => a + Math.ceil(b * FPS), 0) + COLA;
  return { durationInFrames: frames, props: { ...props, tiempos } };
};

// ---------- Miniaturas (1920x1080; YouTube las reduce) ----------
type Mini = { id: string; arriba: string; abajo: string; fondo: Fondo; visual: 'reloj' | 'precio' | 'disco' | 'pc' | 'mapa' | 'pareja' | 'online' | 'vice' | 'trece' | 'record'; color: string };
export const MINIATURAS: Mini[] = [
  { id: '01-hora', arriba: '¿A QUÉ HORA', abajo: 'SALE GTA 6?', fondo: 'ciudad', visual: 'reloj', color: C.amarillo },
  { id: '02-ediciones', arriba: '¿80 € O 100 €?', abajo: 'GTA 6', fondo: 'atardecer', visual: 'precio', color: C.verde },
  { id: '03-espacio', arriba: '212 GB', abajo: '¿TE CABE?', fondo: 'noche', visual: 'disco', color: C.rosa },
  { id: '04-pc', arriba: '¿GTA 6', abajo: 'EN PC?', fondo: 'noche', visual: 'pc', color: C.cian },
  { id: '05-mapa', arriba: 'EL MAPA', abajo: 'DE GTA 6', fondo: 'playa', visual: 'mapa', color: C.amarillo },
  { id: '06-historia', arriba: 'JASON Y LUCÍA', abajo: 'SIN SPOILERS', fondo: 'atardecer', visual: 'pareja', color: C.cian },
  { id: '07-online', arriba: '¿Y EL', abajo: 'ONLINE?', fondo: 'ciudad', visual: 'online', color: C.rojo },
  { id: '08-vice-city', arriba: 'VICE CITY', abajo: '1997 → 2026', fondo: 'atardecer', visual: 'vice', color: C.rosa },
  { id: '09-espera', arriba: '13 AÑOS', abajo: 'DE ESPERA', fondo: 'noche', visual: 'trece', color: C.amarillo },
  { id: '10-records', arriba: 'RÉCORD', abajo: 'SIN SALIR', fondo: 'ciudad', visual: 'record', color: C.verde },
];

const Visual: React.FC<{ v: Mini['visual']; color: string }> = ({ v, color }) => {
  const grande = (t: string, tam = 330, c = C.blanco, sombra = color) => (
    <div style={{ fontFamily: FUENTE_TITULO, fontSize: tam, lineHeight: 1, color: c, textShadow: neon(sombra, 1.4) }}>{t}</div>
  );
  switch (v) {
    case 'reloj':
      return (
        <svg width={620} height={620} viewBox="-310 -310 620 620">
          <circle r={280} fill="#120c2e" stroke={C.amarillo} strokeWidth={22} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-6} y={-262} width={12} height={40} fill={C.blanco} transform={`rotate(${i * 30})`} />)}
          <rect x={-10} y={-210} width={20} height={210} rx={10} fill={C.rosa} />
          <rect x={-8} y={-170} width={16} height={170} rx={8} fill={C.rosa} transform="rotate(-4)" />
          <circle r={24} fill={C.blanco} />
          <text y={140} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={90} fill={C.amarillo}>00:00</text>
        </svg>
      );
    case 'precio':
      return grande('€', 520, C.amarillo, C.naranja);
    case 'disco':
      return (
        <svg width={620} height={560} viewBox="0 0 620 560">
          <rect x={60} y={150} width={500} height={300} rx={30} fill="#120c2e" stroke={C.cian} strokeWidth={14} />
          <rect x={100} y={260} width={420} height={80} rx={20} fill="#2b1f5c" />
          <rect x={100} y={260} width={390} height={80} rx={20} fill={C.rosa} />
          <text x={310} y={230} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={60} fill={C.blanco}>ALMACENAMIENTO</text>
          <text x={310} y={420} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={70} fill={C.rojo}>¡LLENO!</text>
        </svg>
      );
    case 'pc':
      return (
        <svg width={620} height={560} viewBox="0 0 620 560">
          <rect x={40} y={60} width={540} height={340} rx={24} fill="#120c2e" stroke={C.cian} strokeWidth={14} />
          <rect x={250} y={400} width={120} height={70} fill="#2b1f5c" />
          <rect x={170} y={460} width={280} height={30} rx={14} fill={C.cian} />
          <text x={310} y={290} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={200} fill={C.rojo}>?</text>
        </svg>
      );
    case 'mapa':
      return <div style={{ transform: 'scale(0.62)', transformOrigin: 'center' }}><MapaLeonida foco="vice" fijo /></div>;
    case 'pareja':
      return (
        <svg width={640} height={680} viewBox="-330 -740 660 760">
          <circle cx={0} cy={-360} r={300} fill={C.rosa} opacity={0.22} />
          <PersonajeGTA quien="jason" x={-110} brillo={C.cian} />
          <PersonajeGTA quien="lucia" x={120} brillo={C.rosa} />
        </svg>
      );
    case 'online':
      return (
        <svg width={600} height={560} viewBox="0 0 600 560">
          <circle cx={300} cy={280} r={230} fill="#120c2e" stroke={C.cian} strokeWidth={14} />
          <ellipse cx={300} cy={280} rx={100} ry={230} fill="none" stroke={C.cian} strokeWidth={10} />
          <line x1={70} y1={280} x2={530} y2={280} stroke={C.cian} strokeWidth={10} />
          <line x1={120} y1={160} x2={480} y2={160} stroke={C.cian} strokeWidth={8} />
          <line x1={120} y1={400} x2={480} y2={400} stroke={C.cian} strokeWidth={8} />
          <line x1={90} y1={490} x2={510} y2={70} stroke={C.rojo} strokeWidth={34} strokeLinecap="round" />
        </svg>
      );
    case 'vice':
      return grande('VC', 420, C.blanco, C.rosa);
    case 'trece':
      return grande('13', 520, C.amarillo, C.naranja);
    case 'record':
      return (
        <svg width={600} height={600} viewBox="0 0 600 600">
          <path d="M170 80 L 430 80 L 420 260 C 410 340 360 380 300 380 C 240 380 190 340 180 260 Z" fill={C.amarillo} stroke={C.naranja} strokeWidth={10} />
          <path d="M170 120 C 80 120 90 250 190 260 M430 120 C 520 120 510 250 410 260" stroke={C.amarillo} strokeWidth={22} fill="none" />
          <rect x={270} y={380} width={60} height={90} fill={C.amarillo} />
          <rect x={190} y={460} width={220} height={60} rx={12} fill={C.naranja} />
          <text x={300} y={260} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={120} fill="#7a3b00">#1</text>
        </svg>
      );
  }
};

export const MiniaturaGTA: React.FC<{ indice: number }> = ({ indice }) => {
  const m = MINIATURAS[indice];
  return (
    <AbsoluteFill>
      <FondoGTA tipo={m.fondo} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(8,4,26,0.85) 0%, rgba(8,4,26,0.55) 55%, rgba(8,4,26,0.1) 100%)' }} />
      <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 1150, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 190, lineHeight: 0.95, color: C.blanco, textShadow: `0 8px 0 #000, ${neon(C.rosa, 1)}`, transform: 'rotate(-3deg)' }}>{m.arriba}</div>
        <div style={{ alignSelf: 'flex-start', fontFamily: FUENTE_TITULO, fontSize: 170, lineHeight: 1, color: '#0b0820', background: m.color, padding: '6px 34px', borderRadius: 18, transform: 'rotate(-3deg)', boxShadow: `0 0 50px ${m.color}` }}>{m.abajo}</div>
      </div>
      <div style={{ position: 'absolute', right: 70, top: 0, bottom: 0, width: 650, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Visual v={m.visual} color={m.color} />
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 30, transform: 'scale(0.45)', transformOrigin: 'bottom right' }}><LogoNeon tam={120} /></div>
    </AbsoluteFill>
  );
};

// ---------- Marca del canal ----------
export const LogoGTA: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, #3a0f5e, ${C.noche})`, alignItems: 'center', justifyContent: 'center' }}>
    <LogoNeon tam={210} />
  </AbsoluteFill>
);

export const BannerGTA: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ transform: 'scale(1.334)', transformOrigin: 'top left', width: 1920, height: 1080 }}>
      <FondoGTA tipo="atardecer" />
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 70 }}>
      <div style={{ background: 'rgba(11,8,32,0.6)', padding: '20px 40px', borderRadius: 30 }}><LogoNeon tam={150} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 96, color: C.blanco, textShadow: `0 6px 0 #0b0820, ${neon(C.rosa)}` }}>GUÍAS Y NOTICIAS DE GTA 6</div>
        <div style={{ fontFamily: FUENTE_TEXTO, fontWeight: 900, fontSize: 54, color: C.amarillo, textShadow: '0 4px 14px #000' }}>Todo Leonida, en español · Canal no oficial</div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const ComposicionesGTA: React.FC = () => (
  <>
    {Object.keys(GUIONES).map((id) => (
      <Composition key={id} id={`GTA-${id}`} component={VideoGTA} width={1920} height={1080} fps={FPS} durationInFrames={300}
        defaultProps={{ id, tiempos: [] as number[] }} calculateMetadata={metadatos} />
    ))}
    {MINIATURAS.map((m, i) => (
      <Still key={m.id} id={`GTA-mini-${m.id}`} component={MiniaturaGTA} width={1920} height={1080} defaultProps={{ indice: i }} />
    ))}
    <Still id="GTA-logo" component={LogoGTA} width={800} height={800} />
    <Still id="GTA-banner" component={BannerGTA} width={2560} height={1440} />
  </>
);

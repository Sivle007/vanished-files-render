import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { C, Fondo } from './estilo';

const W = 1920;
const H = 1080;

// Palmera en silueta; se balancea un poco.
export const Palmera: React.FC<{ x: number; y: number; escala: number; color?: string; fase?: number; espejo?: boolean }> = ({ x, y, escala, color = '#0a0618', fase = 0, espejo }) => {
  const f = useCurrentFrame();
  const giro = Math.sin(f / 45 + fase) * 2.2;
  const hoja = (ang: number, largo: number, i: number) => {
    const a = ((ang + Math.sin(f / 30 + i + fase) * 3) * Math.PI) / 180;
    const ex = Math.cos(a) * largo;
    const ey = Math.sin(a) * largo;
    const cx = Math.cos(a - 0.35) * largo * 0.55;
    const cy = Math.sin(a - 0.35) * largo * 0.55 - 40;
    return <path key={i} d={`M0 0 Q ${cx} ${cy} ${ex} ${ey} Q ${cx * 0.9} ${cy + 30} 0 0`} fill={color} />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${espejo ? -escala : escala} ${escala}) rotate(${giro})`}>
      <path d="M-14 0 C -10 -200 20 -380 40 -520 L 58 -518 C 40 -380 16 -200 14 0 Z" fill={color} />
      <g transform="translate(48 -520)">
        {[200, 235, 270, 160, 125, 320, 345, 95].map((ang, i) => hoja(ang, 230 - (i % 3) * 30, i))}
      </g>
    </g>
  );
};

const Sol: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => {
  const f = useCurrentFrame();
  const bandas = Array.from({ length: 7 }, (_, i) => i);
  return (
    <g>
      <defs>
        <linearGradient id="sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.amarillo} />
          <stop offset="0.55" stopColor={C.naranja} />
          <stop offset="1" stopColor={C.rosa} />
        </linearGradient>
        <clipPath id="solClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.25} fill={C.rosa} opacity={0.18} />
      <circle cx={cx} cy={cy} r={r} fill="url(#sol)" />
      <g clipPath="url(#solClip)">
        {bandas.map((i) => {
          const y = cy + r * 0.1 + i * (r / 7) + ((f * 0.4) % (r / 7));
          return <rect key={i} x={cx - r} y={y} width={r * 2} height={3 + i * 2.2} fill="#2a0b3d" />;
        })}
      </g>
    </g>
  );
};

const Rejilla: React.FC<{ horizonte: number; color: string }> = ({ horizonte, color }) => {
  const f = useCurrentFrame();
  const lineasH = Array.from({ length: 14 }, (_, i) => i);
  const lineasV = Array.from({ length: 31 }, (_, i) => i - 15);
  const avance = (f % 30) / 30;
  return (
    <g opacity={0.85}>
      {lineasH.map((i) => {
        const t = (i + avance) / 14;
        const y = horizonte + (H - horizonte) * t * t;
        return <line key={i} x1={0} x2={W} y1={y} y2={y} stroke={color} strokeWidth={1 + t * 2.5} opacity={0.25 + t * 0.6} />;
      })}
      {lineasV.map((i) => (
        <line key={i} x1={W / 2 + i * 22} y1={horizonte} x2={W / 2 + i * 260} y2={H} stroke={color} strokeWidth={1.6} opacity={0.5} />
      ))}
    </g>
  );
};

const Estrellas: React.FC<{ n: number; alto: number }> = ({ n, alto }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = random(`ex${i}`) * W;
        const y = random(`ey${i}`) * alto;
        const o = 0.35 + 0.65 * Math.abs(Math.sin(f / (20 + random(`et${i}`) * 40) + i));
        return <circle key={i} cx={x} cy={y} r={random(`er${i}`) * 1.8 + 0.6} fill="#fff" opacity={o} />;
      })}
    </g>
  );
};

const Skyline: React.FC<{ base: number; color: string; ventanas?: boolean; semilla: string; alto?: number }> = ({ base, color, ventanas, semilla, alto = 1 }) => {
  const f = useCurrentFrame();
  const edificios: { x: number; w: number; h: number }[] = [];
  let x = -20;
  let i = 0;
  while (x < W + 40) {
    const w = 50 + random(`${semilla}w${i}`) * 110;
    const h = (90 + random(`${semilla}h${i}`) * 330 + (Math.abs(x - W * 0.62) < 260 ? 160 : 0)) * alto;
    edificios.push({ x, w, h });
    x += w + 4;
    i++;
  }
  return (
    <g>
      {edificios.map((e, k) => (
        <g key={k}>
          <rect x={e.x} y={base - e.h} width={e.w} height={e.h} fill={color} />
          {ventanas &&
            Array.from({ length: Math.floor(e.h / 34) }, (_, fila) =>
              Array.from({ length: Math.floor(e.w / 26) }, (_, col) => {
                const s = random(`${semilla}v${k}-${fila}-${col}`);
                if (s < 0.55) return null;
                const enc = Math.sin(f / 50 + s * 40) > -0.85;
                return (
                  <rect key={`${fila}-${col}`} x={e.x + 9 + col * 26} y={base - e.h + 14 + fila * 34} width={10} height={14}
                    fill={s > 0.85 ? C.cian : s > 0.7 ? C.rosa : C.amarillo} opacity={enc ? 0.75 : 0.1} />
                );
              }),
            )}
        </g>
      ))}
    </g>
  );
};

const Mar: React.FC<{ y: number; color: string; reflejo: string }> = ({ y, color, reflejo }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={y} width={W} height={H - y} fill={color} />
      {Array.from({ length: 16 }, (_, i) => {
        const yy = y + 12 + i * i * 2.6;
        const ancho = 140 + i * 30;
        const desf = Math.sin(f / 20 + i) * 18;
        return <rect key={i} x={W / 2 - ancho / 2 + desf} y={yy} width={ancho} height={3 + i * 0.4} fill={reflejo} opacity={0.6 - i * 0.03} rx={2} />;
      })}
    </g>
  );
};

export const FondoGTA: React.FC<{ tipo: Fondo }> = ({ tipo }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 600], [1.0, 1.06], { extrapolateRight: 'clamp' });
  let cielo: string;
  let contenido: React.ReactNode;
  switch (tipo) {
    case 'atardecer':
      cielo = `linear-gradient(180deg, #1a0533 0%, #5b1470 35%, ${C.rosa} 62%, ${C.naranja} 74%)`;
      contenido = (
        <>
          <Estrellas n={40} alto={320} />
          <Sol cx={W / 2} cy={700} r={260} />
          <Mar y={800} color="#1b0630" reflejo={C.rosa} />
          <Palmera x={150} y={1090} escala={1.25} fase={0} />
          <Palmera x={330} y={1100} escala={0.85} fase={1.3} />
          <Palmera x={1780} y={1090} escala={1.2} fase={2} espejo />
          <Palmera x={1600} y={1110} escala={0.8} fase={0.6} espejo />
        </>
      );
      break;
    case 'noche':
      cielo = `linear-gradient(180deg, #05031a 0%, #150a3d 55%, #3a0f5e 72%)`;
      contenido = (
        <>
          <Estrellas n={120} alto={700} />
          <Skyline base={740} color="#1c0f45" semilla="n" alto={0.7} />
          <rect x={0} y={736} width={W} height={4} fill={C.rosa} opacity={0.8} />
          <rect x={0} y={740} width={W} height={H - 740} fill="#0a0420" />
          <Rejilla horizonte={740} color={C.rosa} />
        </>
      );
      break;
    case 'ciudad':
      cielo = `linear-gradient(180deg, #070424 0%, #1d0b4a 50%, #6b1a6e 80%, ${C.rosa} 100%)`;
      contenido = (
        <>
          <Estrellas n={70} alto={500} />
          <circle cx={1500} cy={210} r={90} fill="#ffe9f6" opacity={0.9} />
          <circle cx={1530} cy={195} r={88} fill="#1a0a45" opacity={0.85} />
          <Skyline base={1000} color="#24124f" semilla="c1" alto={1.1} />
          <Skyline base={1080} color="#0d0628" ventanas semilla="c2" alto={0.95} />
        </>
      );
      break;
    case 'playa':
      cielo = `linear-gradient(180deg, #0b2a5c 0%, #1b6fa8 40%, ${C.cian} 62%, #ffb3d1 78%)`;
      contenido = (
        <>
          <circle cx={1450} cy={560} r={120} fill="#fff3c4" opacity={0.95} />
          <Mar y={760} color="#0b5a8a" reflejo="#bff4ff" />
          <path d={`M0 930 Q ${W / 2} 880 ${W} 950 L ${W} ${H} L 0 ${H} Z`} fill="#f4c99b" />
          <path d={`M0 930 Q ${W / 2} ${880 + Math.sin(f / 25) * 8} ${W} 950`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.7} />
          <Palmera x={160} y={1100} escala={1.2} color="#0b2a3a" fase={0.4} />
          <Palmera x={1760} y={1100} escala={1.1} color="#0b2a3a" fase={1.7} espejo />
        </>
      );
      break;
    case 'pantano':
    default:
      cielo = `linear-gradient(180deg, #021612 0%, #063b33 50%, #1f6b52 80%)`;
      contenido = (
        <>
          <Estrellas n={50} alto={420} />
          <circle cx={560} cy={260} r={80} fill="#e8fff4" opacity={0.85} />
          <rect x={0} y={780} width={W} height={H - 780} fill="#03221c" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={-200 + ((f * (0.6 + i * 0.2) + i * 400) % (W + 400)) - 200} y={700 + i * 45} width={900} height={50} rx={25} fill="#bfffe9" opacity={0.06} />
          ))}
          {Array.from({ length: 90 }, (_, i) => {
            const x = random(`hx${i}`) * W;
            const h = 80 + random(`hh${i}`) * 200;
            const sway = Math.sin(f / 30 + i) * 8;
            return <path key={i} d={`M${x} ${H} Q ${x + sway} ${H - h / 2} ${x + sway * 2} ${H - h}`} stroke="#011410" strokeWidth={6} fill="none" />;
          })}
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={random(`lx${i}`) * W + Math.sin(f / 20 + i) * 20} cy={620 + random(`ly${i}`) * 380 + Math.cos(f / 25 + i) * 15} r={3} fill={C.amarillo}
              opacity={0.3 + 0.7 * Math.abs(Math.sin(f / 15 + i))} />
          ))}
        </>
      );
      break;
  }
  return (
    <AbsoluteFill style={{ background: cielo, transform: `scale(${zoom})` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {contenido}
      </svg>
    </AbsoluteFill>
  );
};

// Rayas de vídeo antiguo y viñeta, por encima de todo.
export const Acabado: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)', opacity: 0.55 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,2,20,0.75) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: ((f * 7) % 1300) - 100, height: 90, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.035), transparent)' }} />
    </AbsoluteFill>
  );
};

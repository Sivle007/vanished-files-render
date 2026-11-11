// Piezas comunes del estilo true crime: lienzo, camara, atmosfera (niebla, lluvia, polvo, grano, vineta, sirena)
// y utilidades de tiempo. Todo se dibuja en un lienzo de 1920x1080.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { crimen, letra } from '../MarcaCrimen';

export const W = 1920;
export const H = 1080;
export const SUELO = 930;
export const fijo = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ap = (f: number, a: number, b: number) => b <= a ? (f >= a ? 1 : 0) : interpolate(f, [a, b], [0, 1], { ...fijo, easing: Easing.out(Easing.cubic) });
export const lineal = (f: number, a: number, b: number) => b <= a ? (f >= a ? 1 : 0) : interpolate(f, [a, b], [0, 1], fijo);

export type ConDuracion = { duracion: number };

export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, ...style }}>
    {children}
  </svg>
);

// Movimiento de camara: zoom y desplazamiento a lo largo de la escena (con un punto de foco).
export type Mov = { zoom?: [number, number]; x?: [number, number]; y?: [number, number]; foco?: [number, number] };
export const Camara: React.FC<{ duracion: number; mov?: Mov; children: React.ReactNode }> = ({ duracion, mov = {}, children }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, duracion], [0, 1], { ...fijo, easing: Easing.inOut(Easing.sin) });
  const [z0, z1] = mov.zoom ?? [1.02, 1.1];
  const [x0, x1] = mov.x ?? [0, 0];
  const [y0, y1] = mov.y ?? [0, 0];
  const [fx, fy] = mov.foco ?? [50, 50];
  return (
    <AbsoluteFill style={{ transformOrigin: `${fx}% ${fy}%`, transform: `translate(${x0 + (x1 - x0) * t}px, ${y0 + (y1 - y0) * t}px) scale(${z0 + (z1 - z0) * t})` }}>
      {children}
    </AbsoluteFill>
  );
};

// Parpadeo natural para personajes: cada ~3-4 s, con desfase por semilla.
export const parpadeo = (f: number, semilla: string) => {
  const periodo = 95 + Math.floor(random(semilla) * 40);
  const fase = (f + Math.floor(random(semilla + 'f') * periodo)) % periodo;
  return fase < 3 ? 1 - Math.abs(fase - 1.5) / 1.5 : 0;
};
export const respira = (f: number, semilla: string) => (Math.sin(f / 22 + random(semilla) * 6) + 1) / 2;

export const Niebla: React.FC<{ opacidad?: number; color?: string; y?: number }> = ({ opacidad = 0.35, color = '#9AA7B8', y = 700 }) => {
  const f = useCurrentFrame();
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <defs>
        <radialGradient id="niebla-g">
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 7 }, (_, i) => {
        const vel = 0.25 + random(`nv${i}`) * 0.4;
        const x = ((random(`nx${i}`) * (W + 1200) + f * vel) % (W + 1200)) - 600;
        return <ellipse key={i} cx={x} cy={y + (random(`ny${i}`) - 0.5) * 260} rx={520 + random(`nr${i}`) * 300} ry={110 + random(`nh${i}`) * 60} fill="url(#niebla-g)" opacity={opacidad} />;
      })}
    </g>
  );
};

export const Lluvia: React.FC<{ cantidad?: number; opacidad?: number }> = ({ cantidad = 160, opacidad = 0.35 }) => {
  const f = useCurrentFrame();
  return (
    <g stroke="#AFC3D9" strokeWidth={2} opacity={opacidad}>
      {Array.from({ length: cantidad }, (_, i) => {
        const vel = 38 + random(`lv${i}`) * 20;
        const x = random(`lx${i}`) * (W + 300) - 150;
        const y = ((random(`ly${i}`) * (H + 200) + f * vel) % (H + 200)) - 100;
        return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} />;
      })}
    </g>
  );
};

export const Polvo: React.FC<{ cantidad?: number; color?: string }> = ({ cantidad = 50, color = '#E8E2D4' }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: cantidad }, (_, i) => {
        const x = (random(`px${i}`) * W + Math.sin(f / 60 + i) * 30 + f * 0.2) % W;
        const y = (random(`py${i}`) * H - f * (0.15 + random(`pv${i}`) * 0.3) + H * 4) % H;
        return <circle key={i} cx={x} cy={y} r={1 + random(`pr${i}`) * 2.2} fill={color} opacity={0.15 + 0.25 * Math.abs(Math.sin(f / 40 + i))} />;
      })}
    </g>
  );
};

// Capa final comun: grano de pelicula, vineta y un leve parpadeo de luz.
export const Acabado: React.FC<{ vineta?: number; grano?: number }> = ({ vineta = 0.85, grano = 0.08 }) => {
  const f = useCurrentFrame();
  const parp = 0.02 * Math.sin(f * 1.7) * Math.sin(f * 0.31);
  return (
    <>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 260px rgba(0,0,0,${vineta})`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(0, parp) }} />
      {/* Grano: textura fija desplazada cada fotograma (mucho mas barato que un filtro de ruido en cada imagen). */}
      <AbsoluteFill style={{ opacity: grano * 1.6, mixBlendMode: 'overlay', backgroundImage: `url(${staticFile('grano.png')})`, backgroundPosition: `${(f * 137) % 512}px ${(f * 251) % 512}px` }} />
    </>
  );
};

// Luz de sirena roja y azul que barre la escena.
export const Sirena: React.FC<{ intensidad?: number }> = ({ intensidad = 0.35 }) => {
  const f = useCurrentFrame();
  const fase = (f % 24) / 24;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${20 + fase * 60}% 20%, rgba(200,53,43,${intensidad}), transparent 55%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${80 - fase * 60}% 25%, rgba(70,110,200,${intensidad * 0.8}), transparent 55%)`, mixBlendMode: 'screen' }} />
    </>
  );
};

// Texto de pantalla: titulo en Bebas con subtitulo de maquina de escribir.
export const TextoPantalla: React.FC<{ texto: string; sub?: string; desde?: number; pos?: 'abajo' | 'arriba' | 'centro'; color?: string }> = ({ texto, sub, desde = 8, pos = 'abajo', color = crimen.hueso }) => {
  const f = useCurrentFrame();
  const o = ap(f, desde, desde + 10);
  const letras = Math.floor(lineal(f, desde + 6, desde + 6 + (sub?.length ?? 0) * 1.2) * (sub?.length ?? 0));
  const estilo: React.CSSProperties = pos === 'centro' ? { justifyContent: 'center' } : pos === 'arriba' ? { justifyContent: 'flex-start', paddingTop: 70 } : { justifyContent: 'flex-end', paddingBottom: 70 };
  return (
    <AbsoluteFill style={{ alignItems: 'center', ...estilo }}>
      <div style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)`, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontFamily: letra.titulo, fontSize: 74, letterSpacing: 4, color, background: 'rgba(10,10,13,0.72)', padding: '6px 26px', borderLeft: `6px solid ${crimen.rojo}` }}>{texto}</div>
        {sub && <div style={{ fontFamily: letra.maquina, fontSize: 30, color: crimen.hueso, marginTop: 10, textShadow: '0 2px 8px #000' }}>{sub.slice(0, letras)}</div>}
      </div>
    </AbsoluteFill>
  );
};

// Objetos de atrezo en SVG para colocar en las escenas (detras/delante de los personajes).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { crimen, letra } from '../MarcaCrimen';
import { TINTA } from '../Personaje';
import { ap } from './base';

const b = { stroke: TINTA, strokeWidth: 6, strokeLinejoin: 'round' as const };

export const Altavoz: React.FC<{ x: number; y: number; ondas?: boolean }> = ({ x, y, ondas = true }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-8} y={0} width={16} height={520} fill="#3A2E24" {...b} />
      <path d="M0,10 L70,-30 L70,60 Z" fill="#6B7079" {...b} />
      <path d="M0,10 L-70,-30 L-70,60 Z" fill="#6B7079" {...b} />
      {ondas &&
        [0, 1, 2].map((i) => {
          const t = ((f / 20 + i / 3) % 1);
          return <path key={i} d={`M${90 + t * 120},${-50 - t * 40} Q${120 + t * 150},15 ${90 + t * 120},${80 + t * 40}`} stroke={crimen.rojo} strokeWidth={6} fill="none" opacity={1 - t} />;
        })}
    </g>
  );
};

export const Autobus: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-300} y={-200} width={600} height={180} rx={24} fill="#B9AD8C" {...b} />
    <rect x={-300} y={-80} width={600} height={30} fill={crimen.rojo} opacity={0.85} />
    {[-250, -170, -90, -10, 70, 150].map((wx) => <rect key={wx} x={wx} y={-175} width={62} height={70} rx={6} fill="#2A3646" stroke={TINTA} strokeWidth={4} />)}
    <rect x={230} y={-175} width={50} height={150} fill="#2A3646" stroke={TINTA} strokeWidth={4} />
    <circle cx={-190} cy={-14} r={36} fill={TINTA} />
    <circle cx={190} cy={-14} r={36} fill={TINTA} />
  </g>
);

export const Telefono: React.FC<{ x: number; y: number; suena?: boolean }> = ({ x, y, suena }) => {
  const f = useCurrentFrame();
  const t = suena ? Math.sin(f * 2) * 4 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${t})`}>
      <path d="M-90,0 L-70,-70 L70,-70 L90,0 Z" fill="#2A2B30" {...b} />
      <path d="M-100,-80 Q0,-130 100,-80 L90,-60 Q0,-100 -90,-60 Z" fill="#1A1B1F" {...b} />
      <circle cx={0} cy={-36} r={24} fill="#E8E2D4" {...b} />
    </g>
  );
};

// Montones sobre la mesa: llaves, sobres y escrituras (lo que los miembros entregaban).
export const Entregas: React.FC<{ x: number; y: number; desde?: number }> = ({ x, y, desde = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-320} y={0} width={640} height={30} fill="#4A3A2C" {...b} />
      {Array.from({ length: 9 }, (_, i) => {
        const o = ap(f, desde + i * 6, desde + i * 6 + 8);
        const tipo = i % 3;
        const px = -240 + (i % 5) * 120;
        const py = -20 - Math.floor(i / 5) * 40 - (1 - o) * 120;
        return (
          <g key={i} opacity={o} transform={`translate(${px} ${py}) rotate(${(i * 37) % 20 - 10})`}>
            {tipo === 0 && <rect x={-50} y={-30} width={100} height={60} fill="#E8E2D4" {...b} />}
            {tipo === 1 && <g><circle cx={-20} cy={0} r={18} fill="none" stroke="#C9A86A" strokeWidth={8} /><rect x={-4} y={-5} width={60} height={10} fill="#C9A86A" /></g>}
            {tipo === 2 && <g><rect x={-46} y={-34} width={92} height={68} fill="#D8CFB8" {...b} /><rect x={-30} y={-18} width={60} height={6} fill="#888" /><rect x={-30} y={-4} width={50} height={6} fill="#888" /></g>}
          </g>
        );
      })}
    </g>
  );
};

export const CajaFuerte: React.FC<{ x: number; y: number; cierra?: number }> = ({ x, y, cierra = 30 }) => {
  const f = useCurrentFrame();
  const t = ap(f, cierra, cierra + 12);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-160} y={-260} width={320} height={260} rx={10} fill="#3A3D44" {...b} />
      <rect x={-130} y={-230} width={260} height={200} fill="#1A1B1F" />
      {[0, 1, 2].map((i) => <rect key={i} x={-100 + i * 70} y={-120 - i * 6} width={60} height={86} rx={6} fill="#2E4A6E" stroke={TINTA} strokeWidth={4} />)}
      <g transform={`translate(-130 0) scale(${1 - t * 0.0 + t} 1)`}>
        <rect x={0} y={-230} width={260 * t} height={200} fill="#4A4D55" stroke={TINTA} strokeWidth={t > 0 ? 6 : 0} />
      </g>
      {t > 0.9 && <circle cx={60} cy={-130} r={26} fill="#2A2B30" stroke="#C9A86A" strokeWidth={5} />}
    </g>
  );
};

// Bandeja con vasitos de liquido rojo (los ensayos de "White Night"). Sin efectos ni victimas.
export const Vasos: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={0} width={520} height={24} rx={8} fill="#6B7079" {...b} />
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i} transform={`translate(${-210 + i * 60} 0)`}>
        <path d="M-20,-70 L20,-70 L14,0 L-14,0 Z" fill="#E8E2D4" opacity={0.5} {...b} />
        <path d="M-17,-40 L17,-40 L14,0 L-14,0 Z" fill="#8E1F1A" />
      </g>
    ))}
  </g>
);

export const Radio: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-160} y={-120} width={320} height={120} rx={10} fill="#3A3D44" {...b} />
      <rect x={-130} y={-96} width={150} height={70} fill="#1A1B1F" />
      <path d={`M-126,-60 ${Array.from({ length: 14 }, (_, i) => `L${-120 + i * 10},${-60 + Math.sin(i + f / 2) * 18}`).join(' ')}`} stroke="#6FD08C" strokeWidth={3} fill="none" />
      {[60, 110].map((cx) => <circle key={cx} cx={cx} cy={-60} r={20} fill="#6B7079" {...b} />)}
      <path d="M100,-120 L160,-300" stroke={TINTA} strokeWidth={6} />
      {[0, 1, 2].map((i) => {
        const t = (f / 25 + i / 3) % 1;
        return <circle key={i} cx={160} cy={-300} r={20 + t * 120} fill="none" stroke={crimen.azul} strokeWidth={4} opacity={1 - t} />;
      })}
    </g>
  );
};

export const Pastillas: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-34} y={-90} width={68} height={90} rx={8} fill="#C2733C" opacity={0.85} {...b} />
    <rect x={-40} y={-112} width={80} height={26} rx={6} fill="#E8E2D4" {...b} />
    <rect x={-24} y={-60} width={48} height={30} fill="#E8E2D4" />
    {[-70, 60, 90].map((px, i) => <ellipse key={i} cx={px} cy={-6} rx={14} ry={8} fill="#E8E2D4" {...b} strokeWidth={3} />)}
  </g>
);

export const Tractor: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-420} y={-110} width={300} height={70} fill="#4A4A3A" {...b} />
    <rect x={-100} y={-170} width={160} height={110} fill="#5A4A2A" {...b} />
    <rect x={-80} y={-240} width={100} height={80} fill="#2A3646" {...b} />
    <circle cx={30} cy={-40} r={60} fill={TINTA} />
    <circle cx={30} cy={-40} r={24} fill="#6B6B6B" />
    <circle cx={-360} cy={-36} r={34} fill={TINTA} />
    <circle cx={-180} cy={-36} r={34} fill={TINTA} />
    <path d="M-120,-80 L-100,-80" stroke={TINTA} strokeWidth={10} />
  </g>
);

export const SillaRuedas: React.FC<{ x: number; y: number; vacia?: boolean }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={-80} r={80} fill="none" stroke="#6B7079" strokeWidth={10} />
    <circle cx={110} cy={-24} r={24} fill="none" stroke="#6B7079" strokeWidth={8} />
    <path d="M-40,-200 L-40,-110 L90,-110 L110,-30" stroke="#6B7079" strokeWidth={10} fill="none" />
    <rect x={-46} y={-130} width={140} height={20} fill="#3A3D44" />
  </g>
);

// Hilos rojos desde un punto (Jones) hacia varias personas: control.
export const Hilos: React.FC<{ desde: [number, number]; hasta: [number, number][]; desdeF?: number }> = ({ desde, hasta, desdeF = 6 }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {hasta.map((p, i) => {
        const t = ap(f, desdeF + i * 4, desdeF + i * 4 + 14);
        const tension = 0.5 + 0.5 * Math.sin(f / 10 + i);
        return <path key={i} d={`M${desde[0]},${desde[1]} Q${(desde[0] + p[0]) / 2},${(desde[1] + p[1]) / 2 + 40 * tension} ${desde[0] + (p[0] - desde[0]) * t},${desde[1] + (p[1] - desde[1]) * t}`} stroke={crimen.rojo} strokeWidth={4} fill="none" opacity={0.85} />;
      })}
    </g>
  );
};

export const Cartel: React.FC<{ x: number; y: number; texto: string; ancho?: number }> = ({ x, y, texto, ancho = 900 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-ancho / 2 + 40} y={0} width={20} height={260} fill="#3A2E24" />
    <rect x={ancho / 2 - 60} y={0} width={20} height={260} fill="#3A2E24" />
    <rect x={-ancho / 2} y={-90} width={ancho} height={110} fill="#6B5636" {...b} />
    <text x={0} y={-18} textAnchor="middle" fill="#F1E6C8" style={{ fontFamily: letra.titulo, fontSize: 52, letterSpacing: 3 }}>{texto}</text>
  </g>
);

export const Puerta: React.FC<{ x: number; y: number; abre?: number }> = ({ x, y, abre = 0 }) => {
  const f = useCurrentFrame();
  const t = ap(f, abre, abre + 16);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-110} y={-420} width={220} height={420} fill="#F2E6C8" opacity={0.15 + 0.85 * t} />
      <rect x={-110} y={-420} width={220} height={420} fill="none" {...b} />
      <path d={`M-110,-420 L${-110 + 220 * (1 - t)},-420 L${-110 + 220 * (1 - t)},0 L-110,0 Z`} fill="#3A2E24" {...b} />
      <path d={`M-110,0 L-260,140 L260,140 L110,0 Z`} fill="#F2E6C8" opacity={0.12 * t} />
    </g>
  );
};

export const Sirena: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  const on = f % 20 < 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-8} y={0} width={16} height={400} fill="#3A2E24" {...b} />
      <rect x={-50} y={-60} width={100} height={60} rx={14} fill={on ? crimen.rojo : '#5A1F1C'} {...b} />
      {on && <circle cx={0} cy={-30} r={120} fill={crimen.rojo} opacity={0.25} />}
    </g>
  );
};

export const Papeles: React.FC<{ x: number; y: number; firmas?: number }> = ({ x, y, firmas = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 6 }, (_, i) => {
        const o = ap(f, firmas + i * 8, firmas + i * 8 + 8);
        return (
          <g key={i} transform={`translate(${(i % 3) * 30 - 30} ${-i * 12}) rotate(${(i * 23) % 14 - 7})`} opacity={0.4 + o * 0.6}>
            <rect x={-150} y={-200} width={300} height={200} fill="#E8E2D4" {...b} strokeWidth={4} />
            <path d={`M-100,-50 q30,-${30 * o} 60,0 t60,0`} stroke="#1C2A4A" strokeWidth={5} fill="none" opacity={o} />
          </g>
        );
      })}
    </g>
  );
};

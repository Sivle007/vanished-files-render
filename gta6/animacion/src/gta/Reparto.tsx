import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FUENTE_TEXTO, FUENTE_TITULO, neon } from './estilo';

// Retratos cartoon propios de los secundarios de GTA 6 (fan art del canal, no arte oficial).
// Cada uno se reconoce por pelo, gafas, barba y ropa.
export type Aspecto = {
  piel: string;
  pelo: 'corto' | 'trenzas' | 'largo' | 'rizado' | 'rapado' | 'gorra' | 'canoso';
  colorPelo?: string;
  gafas?: 'sol' | 'aviador' | 'cabeza';
  barba?: 'corta' | 'perilla' | 'larga';
  camiseta: string;
  chaqueta?: string;
  estampado?: string;
  cadena?: boolean;
  mujer?: boolean;
};

const B = { stroke: '#0b0820', strokeWidth: 5, strokeLinejoin: 'round' as const };

export const Retrato: React.FC<{ a: Aspecto }> = ({ a }) => {
  const f = useCurrentFrame();
  const resp = Math.sin(f / 18) * 2;
  const pelo = a.colorPelo ?? '#20140e';
  const sinGafas = !a.gafas || a.gafas === 'cabeza';
  const lente = a.gafas === 'aviador' ? '#8a4b1a' : '#111';
  return (
    <svg width={300} height={320} viewBox="-150 -300 300 320">
      <g transform={`translate(0 ${resp})`}>
        {a.pelo === 'rizado' && <circle cx={0} cy={-190} r={92} fill={pelo} />}
        {a.pelo === 'largo' && <path d="M-58 -210 Q -70 -110 -46 -96 L 46 -96 Q 70 -110 58 -210 Z" fill={pelo} />}
        {a.pelo === 'canoso' && <path d="M-60 -200 Q -72 -120 -50 -104 L 50 -104 Q 72 -120 60 -200 Z" fill={pelo} />}
        {a.pelo === 'trenzas' && [-46, -30, 30, 46].map((x) => <rect key={x} x={x - 6} y={-200} width={12} height={a.mujer ? 120 : 80} rx={6} fill={pelo} />)}
        <path d="M-130 20 Q -128 -70 -60 -86 L 60 -86 Q 128 -70 130 20 Z" fill={a.chaqueta ?? a.camiseta} {...B} />
        {a.estampado && [[-95, -30], [-70, -60], [-105, 0], [85, -40], [100, -5], [70, -65]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={11} fill={a.estampado} opacity={0.85} />
        ))}
        {a.chaqueta && <path d="M-50 -86 L 50 -86 L 36 20 L -36 20 Z" fill={a.camiseta} {...B} strokeWidth={4} />}
        {a.cadena && <path d="M-28 -84 Q 0 -30 28 -84" fill="none" stroke="#f2c94c" strokeWidth={7} />}
        <rect x={-20} y={-118} width={40} height={36} fill={a.piel} {...B} strokeWidth={4} />
        <ellipse cx={0} cy={-170} rx={a.mujer ? 46 : 52} ry={a.mujer ? 56 : 60} fill={a.piel} {...B} />
        {a.barba === 'corta' && <path d="M-50 -168 Q -46 -110 0 -108 Q 46 -110 50 -168 Q 34 -134 0 -132 Q -34 -134 -50 -168 Z" fill={pelo} opacity={0.75} />}
        {a.barba === 'larga' && <path d="M-50 -168 Q -50 -96 0 -88 Q 50 -96 50 -168 Q 34 -130 0 -128 Q -34 -130 -50 -168 Z" fill={pelo} />}
        {a.barba === 'perilla' && <path d="M-16 -128 Q 0 -100 16 -128 Z" fill={pelo} />}
        {sinGafas ? (
          <>
            <rect x={-24} y={-180} width={11} height={8} rx={3} fill="#1a1010" />
            <rect x={13} y={-180} width={11} height={8} rx={3} fill="#1a1010" />
            <path d="M-30 -192 L -10 -190 M 10 -190 L 30 -192" stroke="#1a1010" strokeWidth={5} strokeLinecap="round" />
          </>
        ) : (
          <g>
            <rect x={-42} y={-188} width={36} height={22} rx={a.gafas === 'aviador' ? 11 : 5} fill={lente} {...B} strokeWidth={3} />
            <rect x={6} y={-188} width={36} height={22} rx={a.gafas === 'aviador' ? 11 : 5} fill={lente} {...B} strokeWidth={3} />
            <line x1={-6} y1={-180} x2={6} y2={-180} stroke="#111" strokeWidth={4} />
          </g>
        )}
        <path d={a.mujer ? 'M-12 -136 Q 0 -128 12 -136' : 'M-12 -138 Q 0 -134 12 -138'} stroke={a.mujer ? '#8a2e48' : '#5a3324'} strokeWidth={a.mujer ? 7 : 4} fill="none" strokeLinecap="round" />
        {a.pelo === 'corto' && <path d="M-52 -182 Q -56 -238 0 -238 Q 56 -238 52 -182 Q 36 -212 0 -210 Q -36 -212 -52 -182 Z" fill={pelo} {...B} strokeWidth={3} />}
        {a.pelo === 'rapado' && <path d="M-50 -192 Q -48 -232 0 -232 Q 48 -232 50 -192 Q 30 -214 0 -214 Q -30 -214 -50 -192 Z" fill={pelo} opacity={0.6} />}
        {(a.pelo === 'largo' || a.pelo === 'canoso') && <path d="M-56 -170 Q -60 -240 0 -240 Q 60 -240 56 -170 Q 40 -214 0 -212 Q -40 -214 -56 -170 Z" fill={pelo} {...B} strokeWidth={3} />}
        {a.pelo === 'rizado' && [[-40, -222], [-10, -236], [22, -232], [46, -212], [-56, -196], [56, -190]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={pelo} />)}
        {a.pelo === 'trenzas' && <path d="M-50 -178 Q -52 -232 0 -234 Q 52 -232 50 -178 Q 34 -208 0 -206 Q -34 -208 -50 -178 Z" fill={pelo} {...B} strokeWidth={3} />}
        {a.pelo === 'gorra' && (
          <g>
            <path d="M-54 -184 Q -54 -240 0 -242 Q 54 -240 54 -184 Z" fill="#f2c94c" {...B} strokeWidth={4} />
            <path d="M-54 -196 Q -90 -200 -100 -186 L -54 -184 Z" fill="#d9a92c" {...B} strokeWidth={3} />
          </g>
        )}
        {a.gafas === 'cabeza' && (
          <g>
            <rect x={-40} y={-232} width={34} height={18} rx={6} fill="#111" />
            <rect x={6} y={-232} width={34} height={18} rx={6} fill="#111" />
          </g>
        )}
      </g>
    </svg>
  );
};

export type Ficha = { nombre: string; rol: string; aspecto: Aspecto | Aspecto[] };

export const RepartoEscena: React.FC<{ titulo: string; personajes: Ficha[]; duracion: number }> = ({ titulo, personajes, duracion }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const paso = (duracion * 0.6) / personajes.length;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 }}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 96, color: C.blanco, textShadow: neon(C.rosa, 1.1) }}>{titulo}</div>
      <div style={{ display: 'flex', gap: 46 }}>
        {personajes.map((p, i) => {
          const r = Math.round(8 + i * paso);
          const s = spring({ frame: f - r, fps, config: { damping: 13, stiffness: 120 } });
          const activo = f >= r && (i === personajes.length - 1 || f < Math.round(8 + (i + 1) * paso) + 15);
          const lista = Array.isArray(p.aspecto) ? p.aspecto : [p.aspecto];
          const col = [C.cian, C.rosa, C.amarillo][i % 3];
          return (
            <div key={i} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 80}px) scale(${activo ? 1.04 : 0.96})`, width: 520, borderRadius: 30, border: `4px solid ${col}`, background: 'rgba(12,6,34,0.82)', boxShadow: activo ? `0 0 36px ${col}` : `0 0 12px ${col}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 10px 26px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {lista.map((a, k) => <div key={k} style={{ marginLeft: k ? -110 : 0 }}><Retrato a={a} /></div>)}
              </div>
              <div style={{ fontFamily: FUENTE_TITULO, fontSize: 58, color: C.blanco, textShadow: neon(col, 0.6), marginTop: 6 }}>{p.nombre}</div>
              <div style={{ fontFamily: FUENTE_TEXTO, fontWeight: 800, fontSize: 32, color: '#d9c8f0', textAlign: 'center' }}>{p.rol}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

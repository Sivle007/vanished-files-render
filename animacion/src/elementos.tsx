// Piezas reutilizables de las escenas. Todas dibujan sobre un lienzo SVG de 1920x1080.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { color, fuente } from './estilo';

export const ANCHO = 1920;
export const ALTO = 1080;
export const HORIZONTE = 700;

export const Lienzo: React.FC<{ children: React.ReactNode; zoom?: number }> = ({ children, zoom = 1 }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {children}
    </svg>
  </AbsoluteFill>
);

export const Cielo: React.FC<{ arriba: string; medio: string; brillo: string; id: string }> = ({ arriba, medio, brillo, id }) => (
  <>
    <defs>
      <linearGradient id={`cielo-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={arriba} />
        <stop offset="0.55" stopColor={medio} />
        <stop offset="0.65" stopColor={brillo} />
      </linearGradient>
      <radialGradient id={`halo-${id}`} cx="0.5" cy="0.65" r="0.5">
        <stop offset="0" stopColor={brillo} stopOpacity="0.55" />
        <stop offset="1" stopColor={brillo} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={ANCHO} height={ALTO} fill={`url(#cielo-${id})`} />
    <rect width={ANCHO} height={ALTO} fill={`url(#halo-${id})`} />
  </>
);

export const Estrellas: React.FC<{ cantidad?: number; semilla?: string }> = ({ cantidad = 90, semilla = 'e' }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: cantidad }, (_, i) => {
        const x = random(`${semilla}x${i}`) * ANCHO;
        const y = random(`${semilla}y${i}`) * (HORIZONTE - 120);
        const brillo = 0.35 + 0.35 * Math.sin(frame / 18 + i);
        return <circle key={i} cx={x} cy={y} r={random(`${semilla}r${i}`) * 1.8 + 0.6} fill={color.blanco} opacity={brillo} />;
      })}
    </g>
  );
};

export const Aurora: React.FC<{ intensidad?: number; colores?: [string, string, string] }> = ({ intensidad = 1, colores = [color.hielo, '#5FD3B0', color.hielo] }) => {
  const frame = useCurrentFrame();
  const bandas = [0, 1, 2].map((b) => {
    const puntos = [];
    for (let x = -100; x <= ANCHO + 100; x += 40) {
      const y = 230 + b * 45 + 55 * Math.sin(x / 320 + frame / 45 + b * 1.7) + 25 * Math.sin(x / 140 - frame / 30);
      puntos.push(`${x},${y.toFixed(1)}`);
    }
    return `M${puntos.join(' L')}`;
  });
  return (
    <g opacity={0.5 * intensidad}>
      <defs>
        <filter id="aurora-desenfoque">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      {bandas.map((d, i) => (
        <path key={i} d={d} stroke={colores[i]} strokeWidth={70 - i * 15} fill="none" filter="url(#aurora-desenfoque)" opacity={0.7 - i * 0.15} />
      ))}
    </g>
  );
};

export const MarHelado: React.FC<{ deriva?: number }> = ({ deriva = 0.4 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect y={HORIZONTE} width={ANCHO} height={ALTO - HORIZONTE} fill={color.profundo} />
      <rect y={HORIZONTE} width={ANCHO} height={3} fill={color.hieloClaro} opacity={0.35} />
      {Array.from({ length: 26 }, (_, i) => {
        const fila = random(`fy${i}`);
        const y = HORIZONTE + 20 + fila * (ALTO - HORIZONTE - 40);
        const escala = 0.4 + fila * 1.4;
        const ancho = (80 + random(`fw${i}`) * 220) * escala;
        const x = ((random(`fx${i}`) * (ANCHO + 600) - frame * deriva * escala) % (ANCHO + 600) + ANCHO + 600) % (ANCHO + 600) - 300;
        const alto = 10 * escala;
        return (
          <polygon
            key={i}
            points={`${x},${y} ${x + ancho * 0.15},${y - alto} ${x + ancho * 0.8},${y - alto * 0.8} ${x + ancho},${y} ${x + ancho * 0.6},${y + alto * 0.5}`}
            fill={color.hieloClaro}
            opacity={0.18 + fila * 0.35}
          />
        );
      })}
    </g>
  );
};

export const Barco: React.FC<{ x: number; y: number; escala?: number; fase?: number; tono?: string }> = ({ x, y, escala = 1, fase = 0, tono = color.noche }) => {
  const frame = useCurrentFrame();
  const balanceo = Math.sin(frame / 22 + fase) * 1.5;
  const sube = Math.sin(frame / 18 + fase) * 3;
  const farol = 0.6 + 0.4 * Math.sin(frame / 9 + fase);
  return (
    <g transform={`translate(${x} ${y + sube}) rotate(${balanceo}) scale(${escala})`}>
      <path d="M-170,0 L170,0 L140,42 L-150,42 Z" fill={tono} />
      <path d="M150,0 L235,-18 L238,-14 L162,4 Z" fill={tono} />
      {[-95, 0, 90].map((mx, i) => (
        <g key={mx}>
          <rect x={mx - 3} y={-230 + i * 15} width={6} height={230 - i * 15} fill={tono} />
          <rect x={mx - 55} y={-190 + i * 15} width={110} height={10} rx={5} fill={tono} />
          <rect x={mx - 45} y={-130 + i * 10} width={90} height={9} rx={4} fill={tono} />
        </g>
      ))}
      <path d="M-95,-215 L235,-16" stroke={tono} strokeWidth={2} />
      <circle cx={-150} cy={-8} r={5} fill={color.ambar} opacity={farol} />
      <circle cx={-150} cy={-8} r={18} fill={color.ambar} opacity={farol * 0.25} />
    </g>
  );
};

export const Nieve: React.FC<{ cantidad?: number; velocidad?: number }> = ({ cantidad = 140, velocidad = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: cantidad }, (_, i) => {
        const cerca = random(`nz${i}`);
        const y = ((random(`ny${i}`) * ALTO + frame * velocidad * (1 + cerca * 2.5)) % (ALTO + 20)) - 10;
        const x = (random(`nx${i}`) * ANCHO + Math.sin(frame / 25 + i) * 12 * cerca + frame * velocidad * 0.6) % ANCHO;
        return <circle key={i} cx={x} cy={y} r={1 + cerca * 2.8} fill={color.blanco} opacity={0.35 + cerca * 0.5} />;
      })}
    </g>
  );
};

export const Marinero: React.FC<{ x: number; y: number; escala?: number; relleno?: string; opacidad?: number }> = ({ x, y, escala = 1, relleno = color.blanco, opacidad = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={opacidad}>
    <circle cx={0} cy={-34} r={7} fill={relleno} />
    <rect x={-8} y={-25} width={16} height={22} rx={6} fill={relleno} />
    <rect x={-7} y={-5} width={5.5} height={16} rx={2.5} fill={relleno} />
    <rect x={1.5} y={-5} width={5.5} height={16} rx={2.5} fill={relleno} />
  </g>
);

// Caja con una cifra destacada, en HTML para que el texto quede nitido.
export const Dato: React.FC<{ etiqueta: string; valor: string; x: number; y: number; colorValor?: string; aparece?: number }> = ({
  etiqueta, valor, x, y, colorValor = color.ambar, aparece = 0,
}) => {
  const frame = useCurrentFrame();
  const entrada = interpolate(frame - aparece, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, opacity: entrada, transform: `translateY(${(1 - entrada) * 14}px)`,
        background: 'rgba(6,11,22,0.72)', border: `2px solid ${color.hielo}`, borderRadius: 14, padding: '14px 26px',
        fontFamily: fuente.texto, color: color.blanco,
      }}
    >
      <div style={{ fontSize: 22, letterSpacing: 5, fontWeight: 500, opacity: 0.8 }}>{etiqueta}</div>
      <div style={{ fontSize: 64, fontWeight: 800, color: colorValor, lineHeight: 1.1 }}>{valor}</div>
    </div>
  );
};

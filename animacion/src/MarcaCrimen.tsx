// Identidad true crime de Vanished Files: negro, rojo oscuro, azul frio, papel envejecido y stickman.
import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { loadFont as cargarBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as cargarMaquina } from '@remotion/google-fonts/SpecialElite';

export const crimen = {
  negro: '#0A0A0D',
  carbon: '#16171C',
  rojo: '#C8352B',
  rojoOscuro: '#6E1410',
  azul: '#5B7FA6',
  azulOscuro: '#1A2738',
  hueso: '#E8E2D4',
  papel: '#CBBF9F',
};
export const letra = {
  titulo: cargarBebas('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily,
  maquina: cargarMaquina('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily,
};

// Filtro de "tinta gastada" para sellos y textos impresos.
const Desgaste: React.FC<{ id: string; fuerza?: number }> = ({ id, fuerza = 0.55 }) => (
  <filter id={id}>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="ruido" />
    <feColorMatrix in="ruido" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -${fuerza * 3} 1.35`} result="mascara" />
    <feComposite in="SourceGraphic" in2="mascara" operator="in" />
  </filter>
);

// Grano de pelicula sobre toda la imagen.
const Grano: React.FC<{ ancho: number; alto: number; opacidad?: number }> = ({ ancho, alto, opacidad = 0.12 }) => (
  <svg width={ancho} height={alto} style={{ position: 'absolute', inset: 0 }}>
    <filter id="grano">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="3" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={ancho} height={alto} filter="url(#grano)" opacity={opacidad} />
  </svg>
);

// Stickman que se desintegra en particulas hacia la derecha: la persona que "desaparece".
export const Desaparecido: React.FC<{ id: string; color?: string; particulas?: string }> = ({ id, color = crimen.hueso, particulas = crimen.azul }) => (
  <g>
    <defs>
      <linearGradient id={`borrado-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.45" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <mask id={`masc-${id}`}>
        <rect x="-200" y="-260" width="400" height="520" fill={`url(#borrado-${id})`} />
      </mask>
    </defs>
    <g mask={`url(#masc-${id})`} stroke={color} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx="0" cy="-150" r="52" fill={color} stroke="none" />
      <path d="M0,-90 L0,60" />
      <path d="M-95,-30 L0,-60 L95,-30" />
      <path d="M-70,200 L0,60 L70,200" />
    </g>
    {Array.from({ length: 46 }, (_, i) => {
      const x = 10 + random(`${id}x${i}`) * 170;
      const y = -210 + random(`${id}y${i}`) * 420;
      const t = 6 + random(`${id}t${i}`) * 16 * (1 - (x - 10) / 220);
      return <rect key={i} x={x} y={y} width={t} height={t} fill={i % 3 === 0 ? color : particulas} opacity={0.9 - (x - 10) / 220} />;
    })}
  </g>
);

// Sello circular rojo con el nombre del canal alrededor.
const Sello: React.FC<{ id: string; r: number }> = ({ id, r }) => (
  <g filter={`url(#gastado-${id})`}>
    <defs>
      <Desgaste id={`gastado-${id}`} fuerza={0.4} />
      <path id={`arco-${id}`} d={`M${-r + 52},0 A${r - 52},${r - 52} 0 1,1 ${r - 52},0 A${r - 52},${r - 52} 0 1,1 ${-r + 52},0`} />
    </defs>
    <circle r={r} fill="none" stroke={crimen.rojo} strokeWidth={16} />
    <circle r={r - 92} fill="none" stroke={crimen.rojo} strokeWidth={5} />
    <text fill={crimen.rojo} style={{ fontFamily: letra.titulo, fontSize: 64, letterSpacing: 9 }}>
      <textPath href={`#arco-${id}`} startOffset="0">VANISHED FILES ✦ CASE FILES ✦ VANISHED FILES ✦ CASE FILES ✦</textPath>
    </text>
  </g>
);

export const LogoCrimen: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 40% 30%, ${crimen.azulOscuro}, ${crimen.negro} 70%)` }}>
    <svg viewBox="-400 -400 800 800" width="100%" height="100%">
      <Sello id="logo" r={350} />
      <g transform="translate(-20 20) scale(0.95)">
        <Desaparecido id="logo" />
      </g>
    </svg>
    <Grano ancho={800} alto={800} opacidad={0.1} />
  </AbsoluteFill>
);

// Elementos de pared de investigacion para los laterales del banner.
const Polaroid: React.FC<{ x: number; y: number; giro: number; id: string; tono?: string }> = ({ x, y, giro, id, tono = crimen.azulOscuro }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <rect x="-130" y="-150" width="260" height="300" fill={crimen.hueso} opacity={0.92} />
    <rect x="-112" y="-132" width="224" height="210" fill={tono} />
    <g transform="translate(0 -20) scale(0.32)">
      <Desaparecido id={id} color="#9AA6B5" particulas="#3E5672" />
    </g>
    <circle cx="0" cy="-138" r="11" fill={crimen.rojo} />
  </g>
);

const Recorte: React.FC<{ x: number; y: number; giro: number; titular: string }> = ({ x, y, giro, titular }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <rect x="-170" y="-110" width="340" height="220" fill={crimen.papel} opacity={0.85} />
    <text x="-150" y="-55" fill={crimen.negro} style={{ fontFamily: letra.titulo, fontSize: 52 }}>{titular}</text>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x="-150" y={-20 + i * 24} width={i === 4 ? 180 : 300} height="9" fill={crimen.negro} opacity={0.35} />
    ))}
    <circle cx="0" cy="-98" r="11" fill={crimen.rojo} />
  </g>
);

const MapaTrozo: React.FC<{ x: number; y: number; giro: number }> = ({ x, y, giro }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <rect x="-200" y="-150" width="400" height="300" fill={crimen.papel} opacity={0.7} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M-200,${-120 + i * 50} C-80,${-150 + i * 50} 40,${-90 + i * 50} 200,${-130 + i * 50}`} stroke={crimen.azulOscuro} strokeOpacity={0.35} strokeWidth={3} fill="none" />
    ))}
    <path d="M-150,80 L-40,10 L60,40 L140,-70" stroke={crimen.rojo} strokeWidth={6} strokeDasharray="14 10" fill="none" />
    <circle cx="140" cy="-70" r="34" fill="none" stroke={crimen.rojo} strokeWidth={6} />
    <circle cx="0" cy="-138" r="11" fill={crimen.rojo} />
  </g>
);

const Cuerda: React.FC<{ a: [number, number]; b: [number, number] }> = ({ a, b }) => (
  <path d={`M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${Math.max(a[1], b[1]) + 60} ${b[0]},${b[1]}`} stroke={crimen.rojo} strokeWidth={4} fill="none" opacity={0.85} />
);

export const BannerCrimen: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${crimen.carbon}, ${crimen.negro} 75%)` }}>
    <svg viewBox="0 0 2560 1440" width="100%" height="100%" style={{ position: 'absolute' }}>
      {/* Pared izquierda */}
      <Polaroid x={200} y={330} giro={-8} id="b1" />
      <Recorte x={210} y={930} giro={5} titular="MISSING" />
      <MapaTrozo x={330} y={1220} giro={-4} />
      <Polaroid x={300} y={640} giro={6} id="b2" tono="#2A1A1E" />
      {/* Pared derecha */}
      <MapaTrozo x={2290} y={240} giro={4} />
      <Polaroid x={2380} y={620} giro={7} id="b3" />
      <Recorte x={2330} y={960} giro={-6} titular="CASE CLOSED?" />
      <Polaroid x={2400} y={1200} giro={-5} id="b4" tono="#2A1A1E" />
      <Cuerda a={[200, 192]} b={[300, 502]} />
      <Cuerda a={[300, 502]} b={[210, 822]} />
      <Cuerda a={[210, 822]} b={[330, 1072]} />
      <Cuerda a={[2290, 92]} b={[2380, 482]} />
      <Cuerda a={[2380, 482]} b={[2330, 852]} />
      <Cuerda a={[2330, 852]} b={[2400, 1062]} />
    </svg>
    {/* Oscurece los laterales y deja una franja central limpia para el texto */}
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(10,10,13,0.25) 0%, rgba(10,10,13,0.92) 26%, rgba(10,10,13,0.96) 50%, rgba(10,10,13,0.92) 74%, rgba(10,10,13,0.25) 100%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(91,127,166,0.16), rgba(0,0,0,0) 45%)` }} />
    {/* Zona segura central (1546x423) */}
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 56 }}>
      <svg viewBox="-400 -400 800 800" width={330} height={330}>
        <Sello id="banner" r={350} />
        <g transform="translate(-20 20) scale(0.95)">
          <Desaparecido id="banner" />
        </g>
      </svg>
      <div>
        <div style={{ position: 'relative', fontFamily: letra.titulo, fontSize: 200, lineHeight: 0.9, color: crimen.hueso, letterSpacing: 6 }}>
          <span style={{ position: 'absolute', left: 5, top: 0, color: crimen.rojo, opacity: 0.75, whiteSpace: 'nowrap' }}>VANISHED FILES</span>
          <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>VANISHED FILES</span>
        </div>
        <div style={{ fontFamily: letra.maquina, fontSize: 46, color: crimen.hueso, marginTop: 22, letterSpacing: 2 }}>
          TRUE CRIME <span style={{ color: crimen.rojo }}>·</span> CULTS <span style={{ color: crimen.rojo }}>·</span> UNSOLVED CASES
        </div>
        <div style={{ display: 'inline-block', marginTop: 22, padding: '6px 18px', border: `3px solid ${crimen.azul}`, color: crimen.azul, fontFamily: letra.maquina, fontSize: 34, letterSpacing: 3 }}>
          NEW CASE FILE EVERY WEEK
        </div>
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 300px rgba(0,0,0,0.9)' }} />
    <Grano ancho={2560} alto={1440} opacidad={0.09} />
  </AbsoluteFill>
);

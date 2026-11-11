// Imagenes fijas del canal: logo (foto de perfil), banner de YouTube y miniaturas de los episodios.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { color, fuente } from './estilo';
import { Barco, Lienzo } from './elementos';
import { ConFondo, Fondo } from './escenas';

// Icono del canal: un expediente con la silueta de una persona que se desvanece.
export const Icono: React.FC<{ tamano: number }> = ({ tamano }) => (
  <svg viewBox="0 0 400 400" width={tamano} height={tamano}>
    <defs>
      <linearGradient id="carpeta" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F5B75C" />
        <stop offset="1" stopColor="#C9802A" />
      </linearGradient>
      <linearGradient id="silueta" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color.noche} stopOpacity="0.95" />
        <stop offset="0.7" stopColor={color.noche} stopOpacity="0.5" />
        <stop offset="1" stopColor={color.noche} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M40,95 L160,95 L185,125 L360,125 L360,330 L40,330 Z" fill="url(#carpeta)" />
    <path d="M40,150 L360,150 L360,330 L40,330 Z" fill="#E59A3E" />
    <circle cx="200" cy="200" r="38" fill="url(#silueta)" />
    <path d="M130,330 C130,265 160,245 200,245 C240,245 270,265 270,330 Z" fill="url(#silueta)" />
  </svg>
);

export const Logo: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${color.azul}, ${color.noche} 70%)`, justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ marginTop: -40 }}>
      <Icono tamano={500} />
    </div>
    <div style={{ position: 'absolute', bottom: 120, fontFamily: fuente.titulo, fontWeight: 700, fontSize: 92, letterSpacing: 6, color: color.blanco }}>VF</div>
  </AbsoluteFill>
);

// Banner 2560x1440: todo lo importante dentro de la zona segura central (1546x423).
export const Banner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.noche }}>
    <ConFondo tipo="aurora">
      <Lienzo>
        <Fondo tipo="aurora" nieve={50} />
        <Barco x={1560} y={735} escala={0.32} tono="#071019" />
        <Barco x={1700} y={738} escala={0.24} tono="#0A1622" fase={1} />
      </Lienzo>
    </ConFondo>
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(6,11,22,0.0) 15%, rgba(6,11,22,0.7) 35%, rgba(6,11,22,0.7) 65%, rgba(6,11,22,0) 85%)' }} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 50 }}>
      <Icono tamano={300} />
      <div>
        <div style={{ fontFamily: fuente.titulo, fontWeight: 700, fontSize: 150, color: color.blanco, lineHeight: 1, textShadow: '0 8px 40px rgba(0,0,0,0.7)' }}>Vanished Files</div>
        <div style={{ fontFamily: fuente.texto, fontWeight: 800, fontSize: 40, letterSpacing: 7, color: color.ambar, marginTop: 24 }}>REAL CASES · REAL EVIDENCE · NO MYTHS</div>
        <div style={{ fontFamily: fuente.texto, fontWeight: 500, fontSize: 34, letterSpacing: 4, color: color.hieloClaro, marginTop: 14 }}>New case files every week</div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// Miniaturas 1920x1080 (se exportan a 1280x720).
const Etiqueta: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: 'absolute', top: 60, left: 70, background: color.rojo, color: color.blanco, fontFamily: fuente.texto, fontWeight: 800, fontSize: 52, letterSpacing: 6, padding: '10px 28px', borderRadius: 10 }}>{texto}</div>
);

const Titular: React.FC<{ arriba: string; abajo: string; colorArriba?: string }> = ({ arriba, abajo, colorArriba = color.ambar }) => (
  <div style={{ position: 'absolute', left: 70, bottom: 120, fontFamily: fuente.texto, fontWeight: 800, lineHeight: 0.95, textShadow: '0 0 30px rgba(0,0,0,0.9), 0 8px 0 rgba(0,0,0,0.6)' }}>
    <div style={{ fontSize: 190, color: colorArriba }}>{arriba}</div>
    <div style={{ fontSize: 190, color: color.blanco }}>{abajo}</div>
  </div>
);

const Marco: React.FC<{ imagen: string; x: number; y: number; ancho: number; alto: number; brillo?: number }> = ({ imagen, x, y, ancho, alto, brillo = 0.95 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: ancho, height: alto, borderRadius: '50%', overflow: 'hidden', border: `10px solid ${color.ambar}`, boxShadow: `0 0 90px ${color.ambar}55, 0 20px 60px rgba(0,0,0,0.8)` }}>
    <Img src={staticFile(`retratos/${imagen}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', filter: `grayscale(1) sepia(0.35) contrast(1.15) brightness(${brillo})` }} />
  </div>
);

const Sombra: React.FC = () => <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(4,8,16,0.85) 0%, rgba(4,8,16,0.55) 45%, rgba(4,8,16,0) 70%)' }} />;

export const MiniaturaF1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.noche }}>
    <Lienzo zoom={1.15}>
      <Fondo tipo="crepusculo" nieve={120} />
      <Barco x={1300} y={740} escala={0.55} tono="#0A1220" />
      <path d="M1080,745 L1520,745 L1500,762 L1100,762 Z" fill={color.hieloClaro} opacity={0.5} />
    </Lienzo>
    <Sombra />
    <Marco imagen="franklin" x={1300} y={110} ancho={500} alto={630} brillo={1.45} />
    <Etiqueta texto="PART 1" />
    <Titular arriba="129 MEN" abajo="VANISHED" />
  </AbsoluteFill>
);

export const MiniaturaF2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.noche }}>
    <Lienzo zoom={1.1}>
      <Fondo tipo="noche" nieve={80} />
      {[0, 1, 2].map((i) => {
        const x = 1180 + i * 260;
        return <path key={i} d={`M${x - 60},880 L${x - 60},660 Q${x},605 ${x + 60},660 L${x + 60},880 Z`} fill="#22384A" stroke={color.hieloClaro} strokeOpacity={0.6} strokeWidth={4} />;
      })}
      <rect width={1920} height={1080} fill={color.rojo} opacity={0.12} />
    </Lienzo>
    <Sombra />
    <Marco imagen="fitzjames" x={1380} y={70} ancho={400} alto={500} />
    <Etiqueta texto="PART 2" />
    <Titular arriba="WHAT" abajo="KILLED THEM?" colorArriba={color.rojo} />
  </AbsoluteFill>
);

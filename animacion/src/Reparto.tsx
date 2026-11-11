// Hojas de personajes para aprobar el estilo antes de animar.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DatosPersonaje, PIELES, Personaje, Expresion, Pose } from './Personaje';
import { crimen, letra } from './MarcaCrimen';

const Fondo: React.FC<{ claro?: boolean; children: React.ReactNode }> = ({ claro, children }) => (
  <AbsoluteFill style={{ background: claro ? '#ECE8DF' : `radial-gradient(ellipse at 50% 40%, #24252B, ${crimen.negro} 80%)` }}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <filter id="grano-hoja">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="5" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1920} height={1080} filter="url(#grano-hoja)" opacity={claro ? 0.06 : 0.1} />
    </svg>
    {children}
  </AbsoluteFill>
);

const Ficha: React.FC<{ x: number; nombre: string; papel: string; claro?: boolean }> = ({ x, nombre, papel, claro }) => (
  <div style={{ position: 'absolute', left: x - 110, top: 905, width: 220, textAlign: 'center' }}>
    <div style={{ fontFamily: letra.titulo, fontSize: 34, color: claro ? '#26262B' : crimen.hueso, letterSpacing: 1 }}>{nombre}</div>
    <div style={{ fontFamily: letra.maquina, fontSize: 18, color: claro ? '#8A3A30' : crimen.rojo, marginTop: 2 }}>{papel}</div>
  </div>
);

const REPARTO: { datos: DatosPersonaje; nombre: string; papel: string; escala?: number }[] = [
  { nombre: 'JIM JONES', papel: 'TEMPLE LEADER', datos: { id: 'jones', piel: PIELES.clara, pelo: 'tupe', colorPelo: '#141317', gafasSol: true, camisa: { color: '#2A2228', manga: 'larga' }, pantalon: { color: '#1C1C21' }, zapatos: '#1A1A1E', expresion: 'serio', pose: 'hablar' } },
  { nombre: 'LEO RYAN', papel: 'U.S. CONGRESSMAN', datos: { id: 'ryan', piel: PIELES.clara, pelo: 'raya', colorPelo: '#7A5638', camisa: { color: '#E9E6DE', manga: 'larga' }, corbata: '#2F4F7A', pantalon: { color: '#5C6370' }, zapatos: '#2B2B2B', expresion: 'neutral', pose: 'quieto', objeto: 'libreta' } },
  { nombre: 'JACKIE SPEIER', papel: 'CONGRESSIONAL AIDE', datos: { id: 'speier', piel: PIELES.clara, pelo: 'flequillo', colorPelo: '#2E211B', camisa: { color: '#3E5C86', chaqueta: true }, pantalon: { color: '#4B4E57', tipo: 'falda' }, zapatos: '#2B2B2B', expresion: 'preocupado', pose: 'quieto', objeto: 'carpeta' } },
  { nombre: 'DON HARRIS', papel: 'NBC REPORTER', datos: { id: 'harris', piel: PIELES.clara, pelo: 'entradas', colorPelo: '#5A4A3E', barba: 'bigote', camisa: { color: '#B39B73', chaqueta: true }, pantalon: { color: '#4A4740' }, zapatos: '#3A2E25', expresion: 'neutral', pose: 'hablar', objeto: 'micro' } },
  { nombre: 'CHRISTINE MILLER', papel: 'SPOKE UP · VICTIM', datos: { id: 'miller', piel: PIELES.oscura, pelo: 'canoso', colorPelo: '#C9C4BA', camisa: { color: '#6E3A4C', manga: 'larga' }, pantalon: { color: '#3C3C44', tipo: 'falda' }, zapatos: '#2B2B2B', bufanda: '#E09A3A', expresion: 'serio', pose: 'alto' } },
  { nombre: 'TEMPLE MEMBER', papel: 'COMMUNITY', datos: { id: 'miembro', piel: PIELES.morena, pelo: 'afro', colorPelo: '#1E1A18', camisa: { color: '#C2733C', manga: 'corta' }, pantalon: { color: '#4A6A94' }, zapatos: '#F1EEE6', expresion: 'sonrisa', pose: 'quieto' } },
  { nombre: 'VERNON GOSNEY', papel: 'ASKED FOR HELP', datos: { id: 'gosney', piel: PIELES.clara, pelo: 'corto', colorPelo: '#A07A4E', camisa: { color: '#7B8C6A', manga: 'corta' }, pantalon: { color: '#3F5A80' }, zapatos: '#F1EEE6', expresion: 'miedo', pose: 'bolsillos' } },
  { nombre: 'GUARD', papel: 'ARMED PERIMETER', datos: { id: 'guardia', piel: PIELES.media, pelo: 'rapado', colorPelo: '#1E1A18', camisa: { color: '#3B4636', manga: 'larga' }, pantalon: { color: '#2A2F28' }, zapatos: '#1A1A1E', expresion: 'serio', pose: 'quieto', objeto: 'linterna' } },
  { nombre: 'DR LESLIE MOOTOO', papel: 'MEDICAL EXAMINER', datos: { id: 'mootoo', piel: PIELES.media, pelo: 'raya', colorPelo: '#222', barba: 'bigote', gafas: true, camisa: { color: '#E6E3DA', chaqueta: true }, pantalon: { color: '#3A3D44' }, zapatos: '#2B2B2B', expresion: 'serio', pose: 'quieto', objeto: 'maletin' } },
];

export const RepartoJonestown: React.FC = () => (
  <Fondo>
    <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: letra.titulo, fontSize: 64, color: crimen.hueso, letterSpacing: 6 }}>
      JONESTOWN <span style={{ color: crimen.rojo }}>·</span> CAST FILE
    </div>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute' }}>
      {REPARTO.map((r, i) => (
        <Personaje key={r.datos.id} {...r.datos} x={130 + i * 207} y={880} escala={0.6} />
      ))}
    </svg>
    {REPARTO.map((r, i) => (
      <Ficha key={r.nombre} x={130 + i * 207} nombre={r.nombre} papel={r.papel} />
    ))}
  </Fondo>
);

const MUESTRAS: { e: Expresion; p: Pose; t: string }[] = [
  { e: 'neutral', p: 'quieto', t: 'NEUTRAL' },
  { e: 'sonrisa', p: 'senalar', t: 'POINTING' },
  { e: 'preocupado', p: 'cara', t: 'FACEPALM' },
  { e: 'enfado', p: 'alto', t: 'STOP' },
  { e: 'sonrisa', p: 'cabeza', t: 'RELAXED' },
  { e: 'sorpresa', p: 'brazosArriba', t: 'SHOCK' },
  { e: 'triste', p: 'bolsillos', t: 'SAD' },
  { e: 'miedo', p: 'hablar', t: 'AFRAID' },
];

export const HojaExpresiones: React.FC = () => (
  <Fondo claro>
    <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: letra.titulo, fontSize: 64, color: '#26262B', letterSpacing: 6 }}>
      EXPRESSIONS <span style={{ color: crimen.rojo }}>·</span> POSES
    </div>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute' }}>
      {MUESTRAS.map((m, i) => (
        <Personaje
          key={i}
          id={`m${i}`}
          pelo="mechones"
          camisa={{ color: '#2B2B30', manga: 'corta' }}
          pantalon={{ color: '#4A6A94', tipo: 'corto' }}
          expresion={m.e}
          pose={m.p}
          x={140 + i * 235}
          y={880}
          escala={0.62}
        />
      ))}
    </svg>
    {MUESTRAS.map((m, i) => (
      <Ficha key={i} x={140 + i * 235} nombre={m.t} papel={m.e.toUpperCase()} claro />
    ))}
  </Fondo>
);

// Mapa de expediente: paises y estados reales (Natural Earth), rutas rojas animadas, chinchetas y avion.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { crimen, letra } from '../MarcaCrimen';
import { FORMAS, MARCOS_CRIMEN } from '../mapasCrimen';
import { Acabado, Camara, ConDuracion, Mov, Svg, W, H, ap, lineal } from './base';

export type VistaCrimen = keyof typeof MARCOS_CRIMEN;
export const proyectar = (vista: VistaCrimen, lat: number, lon: number) => {
  const m = MARCOS_CRIMEN[vista];
  return { x: ((lon - m.lonMin) / (m.lonMax - m.lonMin)) * W, y: ((m.latMax - lat) / (m.latMax - m.latMin)) * H };
};

export type Ruta = { desde: [number, number]; hasta: [number, number]; curva?: number; avion?: boolean; desdeF?: number; hastaF?: number };
export type Chincheta = { lat: number; lon: number; texto: string; aparece?: number; color?: string; abajo?: boolean };

export const LUGARES = {
  indianapolis: [39.77, -86.16],
  redwoodValley: [39.26, -123.2],
  sanFrancisco: [37.77, -122.42],
  georgetown: [6.8, -58.16],
  portKaituma: [7.73, -59.88],
  jonestown: [7.69, -59.97],
  nuevaYork: [40.71, -74.0],
  baltimore: [39.29, -76.61],
  marinCity: [37.87, -122.51],
  losAngeles: [34.05, -118.24],
  lasVegas: [36.17, -115.14],
  compton: [33.9, -118.22],
} as const satisfies Record<string, [number, number]>;

export const MapaCrimen: React.FC<ConDuracion & { vista: VistaCrimen; resaltar?: string[]; rutas?: Ruta[]; marcas?: Chincheta[]; mov?: Mov; titulo?: string; atenuar?: boolean }> = ({
  duracion, vista, resaltar = [], rutas = [], marcas = [], mov, titulo,
}) => {
  const f = useCurrentFrame();
  const formas = FORMAS[vista];
  const brillo = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <AbsoluteFill style={{ background: '#141B24' }}>
      <Camara duracion={duracion} mov={mov ?? { zoom: [1, 1.08] }}>
        <Svg>
          <defs>
            <pattern id="reticula" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M80,0 L0,0 L0,80" fill="none" stroke="#2A3646" strokeWidth={1.5} />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#reticula)" />
          {Object.entries(formas).map(([k, d]) => {
            const esEstado = k.includes(':');
            const res = resaltar.includes(k);
            return (
              <path
                key={k}
                d={d}
                fill={res ? '#7A2A24' : esEstado ? '#B9AD8C' : '#A89C7C'}
                fillOpacity={res ? 0.55 + 0.25 * brillo : esEstado ? 1 : 0.85}
                stroke={esEstado ? '#6E6450' : '#3E382A'}
                strokeWidth={esEstado ? 1.5 : 3}
              />
            );
          })}
          {rutas.map((r, i) => {
            const a = proyectar(vista, ...r.desde);
            const b = proyectar(vista, ...r.hasta);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - (r.curva ?? 120);
            const t = ap(f, r.desdeF ?? 12, r.hastaF ?? Math.max(30, duracion * 0.6));
            const d = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
            const largo = Math.hypot(b.x - a.x, b.y - a.y) * 1.25;
            const px = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
            const py = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
            const dx = 2 * (1 - t) * (mx - a.x) + 2 * t * (b.x - mx);
            const dy = 2 * (1 - t) * (my - a.y) + 2 * t * (b.y - my);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={crimen.rojo} strokeWidth={7} strokeDasharray={`${largo * t} ${largo}`} strokeLinecap="round" />
                {r.avion && t > 0 && t < 1 && (
                  <g transform={`translate(${px} ${py}) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI})`}>
                    <path d="M26,0 L-18,-8 L-24,-26 L-30,-26 L-28,-6 L-40,-4 L-44,-14 L-48,-14 L-46,0 L-48,14 L-44,14 L-40,4 L-28,6 L-30,26 L-24,26 L-18,8 Z" fill={crimen.hueso} stroke="#111" strokeWidth={3} />
                  </g>
                )}
              </g>
            );
          })}
          {marcas.map((m, i) => {
            const p = proyectar(vista, m.lat, m.lon);
            const o = ap(f, m.aparece ?? 8 + i * 8, (m.aparece ?? 8 + i * 8) + 10);
            const c = m.color ?? crimen.rojo;
            return (
              <g key={i} opacity={o} transform={`translate(${p.x} ${p.y - (1 - o) * 30})`}>
                <circle r={34} fill={c} opacity={0.2 * brillo} />
                <circle r={13} fill={c} stroke="#111" strokeWidth={4} />
                <g transform={`translate(${Math.max(0, (m.texto.length * 15 + 30) / 2 + 30 - p.x) - Math.max(0, p.x + (m.texto.length * 15 + 30) / 2 + 30 - W)} ${m.abajo ? 60 : -34})`}>
                  <rect x={-(m.texto.length * 15 + 30) / 2} y={-38} width={m.texto.length * 15 + 30} height={46} fill="rgba(10,10,13,0.85)" />
                  <text x={0} y={-4} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: 38, letterSpacing: 2 }}>{m.texto}</text>
                </g>
              </g>
            );
          })}
        </Svg>
      </Camara>
      {titulo && (
        <div style={{ position: 'absolute', left: 70, top: 60, fontFamily: letra.titulo, fontSize: 64, color: crimen.hueso, background: 'rgba(10,10,13,0.75)', padding: '4px 22px', borderLeft: `6px solid ${crimen.rojo}`, opacity: ap(f, 4, 14) }}>{titulo}</div>
      )}
      <Acabado />
    </AbsoluteFill>
  );
};

// Ruta en un solo sentido con distancia escrita (para el rotulo de "~150 MILES").
export const lineaTiempo = lineal;

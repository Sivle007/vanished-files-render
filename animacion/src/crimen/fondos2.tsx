// Escenarios del caso Tupac (y reutilizables): Las Vegas de noche, cruce con semaforo, coches, vestibulo de hotel
// visto por camara de seguridad, estudio de grabacion, celda, hospital, plato de television, ring y escenario de concierto.
import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { crimen, letra } from '../MarcaCrimen';
import { TINTA } from '../Personaje';
import { H, SUELO, W } from './base';

const b = { stroke: TINTA, strokeWidth: 6, strokeLinejoin: 'round' as const };

const CieloNoche: React.FC<{ id: string; brillo?: string }> = ({ id, brillo = '#3A1E4A' }) => (
  <>
    <defs>
      <linearGradient id={`cn-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#05060C" />
        <stop offset="0.7" stopColor="#140E24" />
        <stop offset="1" stopColor={brillo} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#cn-${id})`} />
  </>
);

// Neon que parpadea suavemente.
const Neon: React.FC<{ x: number; y: number; w: number; h: number; color: string; texto?: string; semilla: string }> = ({ x, y, w, h, color, texto, semilla }) => {
  const f = useCurrentFrame();
  const fallo = random(`${semilla}${Math.floor(f / 7)}`) > 0.96 ? 0.35 : 1;
  return (
    <g opacity={fallo}>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={10} fill={color} opacity={0.18} />
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={color} strokeWidth={6} />
      {texto && <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fill={color} style={{ fontFamily: letra.titulo, fontSize: Math.min(56, h * 0.7), letterSpacing: 4 }}>{texto}</text>}
    </g>
  );
};

// Silueta de la ciudad de Las Vegas con hoteles y neones (sin logotipos reales).
export const FondoVegas: React.FC<{ calle?: boolean }> = ({ calle = true }) => (
  <g>
    <CieloNoche id="vegas" />
    {Array.from({ length: 22 }, (_, i) => {
      const x = i * 92 - 20;
      const h = 220 + random(`vh${i}`) * 360;
      return (
        <g key={i}>
          <rect x={x} y={700 - h} width={84} height={h} fill={i % 3 ? '#161226' : '#1E1830'} stroke="#0A0812" strokeWidth={3} />
          {Array.from({ length: Math.floor(h / 34) }, (_, k) => (random(`vv${i}-${k}`) > 0.5 ? <rect key={k} x={x + 10 + (k % 3) * 24} y={700 - h + 14 + k * 30} width={12} height={10} fill="#F2C46A" opacity={0.6} /> : null))}
        </g>
      );
    })}
    <Neon x={180} y={330} w={300} h={80} color="#FF4FA3" texto="CASINO" semilla="n1" />
    <Neon x={760} y={250} w={380} h={90} color="#4FD1FF" texto="GRAND HOTEL" semilla="n2" />
    <Neon x={1420} y={360} w={300} h={80} color="#FFC14F" texto="SHOW" semilla="n3" />
    {calle && (
      <>
        <rect y={700} width={W} height={H - 700} fill="#1A1A22" />
        <path d={`M0,${SUELO - 40} L${W},${SUELO - 40}`} stroke="#E8E2D4" strokeWidth={6} strokeDasharray="60 50" opacity={0.5} />
        <rect y={700} width={W} height={H - 700} fill="url(#reflejo)" />
        <defs>
          <linearGradient id="reflejo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF4FA3" stopOpacity="0.12" />
            <stop offset="1" stopColor="#4FD1FF" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </>
    )}
  </g>
);

// Semaforo (rojo por defecto).
export const Semaforo: React.FC<{ x: number; y: number; luz?: 'rojo' | 'ambar' | 'verde'; escala?: number }> = ({ x, y, luz = 'rojo', escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-8} y={0} width={16} height={420} fill="#2A2A30" />
    <rect x={-40} y={-200} width={80} height={210} rx={14} fill="#1A1A1E" {...b} />
    {(['rojo', 'ambar', 'verde'] as const).map((c, i) => {
      const on = c === luz;
      const col = c === 'rojo' ? '#FF3B2F' : c === 'ambar' ? '#FFB02E' : '#3BD16F';
      return (
        <g key={c}>
          {on && <circle cx={0} cy={-165 + i * 64} r={60} fill={col} opacity={0.25} />}
          <circle cx={0} cy={-165 + i * 64} r={24} fill={on ? col : '#2E2E34'} />
        </g>
      );
    })}
  </g>
);

// Cabeza estilizada que asoma por la ventanilla (mismo trazo que los personajes).
const Cabeza: React.FC<{ x: number; r: number; piel: string; panuelo?: string; barba?: boolean; mira?: number }> = ({ x, r, piel, panuelo, barba, mira = 0 }) => (
  <g transform={`translate(${x} -120)`}>
    <rect x={-r * 0.45} y={r * 0.6} width={r * 0.9} height={r} fill={piel} stroke={TINTA} strokeWidth={3} />
    <circle r={r} fill={piel} stroke={TINTA} strokeWidth={3.5} />
    {barba && <path d={`M${-r * 0.85},${r * 0.15} Q0,${r * 1.25} ${r * 0.85},${r * 0.15} Q0,${r * 0.75} ${-r * 0.85},${r * 0.15} Z`} fill="#1E1A18" />}
    {panuelo && (
      <>
        <path d={`M${-r},${-r * 0.25} Q0,${-r * 0.75} ${r},${-r * 0.25} L${r * 0.95},${-r * 0.55} Q0,${-r * 1.15} ${-r * 0.95},${-r * 0.55} Z`} fill={panuelo} stroke={TINTA} strokeWidth={2.5} />
        <circle cx={-r * 0.95} cy={-r * 0.35} r={r * 0.22} fill={panuelo} stroke={TINTA} strokeWidth={2} />
      </>
    )}
    <circle cx={r * 0.3 + mira} cy={-r * 0.05} r={r * 0.11} fill={TINTA} />
    <circle cx={r * 0.65 + mira} cy={-r * 0.05} r={r * 0.11} fill={TINTA} />
  </g>
);

// Coche generico de los 90 visto de lado: sedan negro (BMW) o blanco (Cadillac).
// ocupantes: "tupac" = Tupac de copiloto y Suge al volante; "conductor" = solo Suge.
export const Coche: React.FC<{ x: number; y: number; color: string; escala?: number; espejo?: boolean; ventanilla?: number; luces?: boolean; ocupantes?: 'tupac' | 'conductor' }> = ({ x, y, color, escala = 1, espejo, ventanilla = 0, luces = true, ocupantes }) => (
  <g transform={`translate(${x} ${y}) scale(${espejo ? -escala : escala} ${escala})`}>
    <ellipse cx={0} cy={6} rx={300} ry={18} fill="#000" opacity={0.35} />
    <path d="M-300,-30 L-290,-90 L-180,-100 L-120,-170 L120,-170 L190,-100 L290,-90 L300,-30 Z" fill={color} {...b} />
    <path d="M-105,-158 L-20,-158 L-20,-104 L-160,-104 Z" fill="#1E2A3A" stroke={TINTA} strokeWidth={4} />
    <path d={`M0,-158 L105,-158 L165,-104 L0,-104 Z`} fill="#1E2A3A" stroke={TINTA} strokeWidth={4} />
    {ocupantes && (
      <g>
        <Cabeza x={ocupantes === 'tupac' ? 102 : 66} r={31} piel="#5E3E2A" barba />
        {ocupantes === 'tupac' && <Cabeza x={42} r={29} piel="#6E4A33" panuelo="#B3261E" />}
        <path d="M0,-158 L105,-158 L165,-104 L0,-104 Z" fill="#9FC3E0" opacity={0.12} />
        <path d="M14,-104 L60,-158 L78,-158 L32,-104 Z" fill="#FFFFFF" opacity={0.08} />
        <path d="M0,-158 L105,-158 L165,-104 L0,-104 Z" fill="none" stroke={TINTA} strokeWidth={4} />
      </g>
    )}
    {ventanilla > 0 && <rect x={-150} y={-156} width={128 * ventanilla} height={50} fill="#05060A" opacity={0.9} />}
    <rect x={-300} y={-60} width={600} height={10} fill="#000" opacity={0.25} />
    {[-185, 185].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={-26} r={46} fill={TINTA} />
        <circle cx={cx} cy={-26} r={20} fill="#8A8A90" />
      </g>
    ))}
    {luces && <path d="M292,-80 L460,-110 L460,-30 L298,-50 Z" fill="#FFF4C8" opacity={0.18} />}
    <rect x={286} y={-80} width={14} height={20} fill="#FFF4C8" />
    <rect x={-300} y={-80} width={12} height={20} fill="#C8352B" />
  </g>
);

// Cruce de Flamingo Road con semaforo en rojo.
export const FondoCruce: React.FC = () => (
  <g>
    <FondoVegas />
    <rect y={760} width={W} height={20} fill="#E8E2D4" opacity={0.25} />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1500 + i * 40} y={790} width={24} height={150} fill="#E8E2D4" opacity={0.35} />)}
    <Semaforo x={1680} y={330} />
    <g transform="translate(1420 300)">
      <rect x={-150} y={-36} width={300} height={56} fill="#1F6E43" {...b} strokeWidth={4} />
      <text x={0} y={2} textAnchor="middle" fill="#F2F2F2" style={{ fontFamily: letra.titulo, fontSize: 38, letterSpacing: 2 }}>E FLAMINGO RD</text>
    </g>
  </g>
);

// Vestibulo de hotel-casino visto por camara de seguridad (tinte verde, hora y REC).
export const FondoVestibulo: React.FC<{ cctv?: boolean }> = ({ cctv = true }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect width={W} height={H} fill="#3A2E28" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={i * 340 + 60} y={120} width={40} height={720} fill="#5A4636" />
          <circle cx={i * 340 + 250} cy={150} r={60} fill="#F2D49A" opacity={0.25} />
          <circle cx={i * 340 + 250} cy={150} r={16} fill="#F2D49A" />
        </g>
      ))}
      <rect y={SUELO - 160} width={W} height={H - SUELO + 160} fill="#5A1E24" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 137) % W} cy={SUELO - 120 + (i % 4) * 50} r={10} fill="#C9A86A" opacity={0.25} />)}
      {[1450, 1600, 1750].map((x) => (
        <g key={x}>
          <rect x={x - 50} y={560} width={100} height={210} rx={10} fill="#3A3D44" {...b} />
          <rect x={x - 34} y={590} width={68} height={60} fill="#4FD1FF" opacity={0.5} />
        </g>
      ))}
      {cctv && (
        <>
          <rect width={W} height={H} fill="#1F5A2E" opacity={0.35} style={{ mixBlendMode: 'multiply' }} />
          {Array.from({ length: 54 }, (_, i) => <rect key={i} y={i * 20} width={W} height={2} fill="#000" opacity={0.18} />)}
          <text x={60} y={90} fill="#E8FFE8" style={{ fontFamily: letra.maquina, fontSize: 40 }}>CAM 04 · LOBBY</text>
          <text x={W - 60} y={90} textAnchor="end" fill="#E8FFE8" style={{ fontFamily: letra.maquina, fontSize: 40 }}>09-07-96 20:4{Math.floor(f / 30) % 10}</text>
          {f % 30 < 18 && <circle cx={W - 80} cy={H - 80} r={16} fill="#FF3B2F" />}
        </>
      )}
    </g>
  );
};

// Estudio de grabacion: vestibulo oscuro con cristal de cabina y microfono.
export const FondoEstudio: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#16141C" />
    <rect x={980} y={180} width={760} height={460} fill="#0E1422" {...b} />
    <rect x={1000} y={200} width={720} height={420} fill="#24304A" opacity={0.6} />
    <path d="M1360,260 L1360,520 M1300,260 a60,60 0 0 1 120,0 L1420,330 a60,60 0 0 1 -120,0 Z" stroke="#8A8A90" strokeWidth={10} fill="#3A3D44" />
    <rect x={160} y={560} width={620} height={110} fill="#2A2228" {...b} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={190 + i * 42} y={585} width={16} height={60} fill={i % 4 ? '#4FD1FF' : '#FF4FA3'} opacity={0.6} />)}
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#0E0D12" />
    <rect x={120} y={140} width={260} height={70} fill="#B3261E" opacity={0.7} {...b} strokeWidth={4} />
    <text x={250} y={188} textAnchor="middle" fill="#F2F2F2" style={{ fontFamily: letra.titulo, fontSize: 44 }}>ON AIR</text>
  </g>
);

export const FondoCelda: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#3A3E44" />
    <rect x={200} y={140} width={1520} height={SUELO - 140} fill="#4A4E54" />
    <rect x={1280} y={250} width={240} height={140} fill="#A8C4D6" opacity={0.5} {...b} />
    {[1320, 1380, 1440].map((x) => <rect key={x} x={x} y={250} width={12} height={140} fill={TINTA} />)}
    <rect x={260} y={700} width={560} height={90} fill="#5A5E64" {...b} />
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#2A2C30" />
  </g>
);

// Barrotes en primer plano (para "delante").
export const Barrotes: React.FC = () => (
  <g>
    {Array.from({ length: 13 }, (_, i) => <rect key={i} x={60 + i * 150} y={0} width={22} height={H} fill="#2A2C30" stroke="#111" strokeWidth={4} />)}
    <rect x={0} y={120} width={W} height={22} fill="#2A2C30" />
  </g>
);

export const FondoHospital: React.FC = () => {
  const f = useCurrentFrame();
  const pulso = Array.from({ length: 40 }, (_, i) => {
    const x = 1360 + i * 9;
    const fase = (i + f) % 40;
    const y = fase === 10 ? -40 : fase === 11 ? 30 : fase === 12 ? -10 : 0;
    return `${i ? 'L' : 'M'}${x},${300 + y}`;
  }).join(' ');
  return (
    <g>
      <rect width={W} height={H} fill="#1C2A32" />
      <rect x={1320} y={220} width={380} height={170} rx={10} fill="#0A1418" {...b} />
      <path d={pulso} stroke="#3BD16F" strokeWidth={4} fill="none" />
      <rect x={1500} y={390} width={14} height={300} fill="#3A3D44" />
      <rect x={300} y={620} width={980} height={70} rx={10} fill="#E8E8EE" {...b} />
      <rect x={300} y={690} width={980} height={60} fill="#B8C4CC" {...b} />
      <rect x={300} y={580} width={160} height={50} rx={14} fill="#F2F2F2" {...b} />
      <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#16222A" />
    </g>
  );
};

// Plato de television con focos y camara (para la entrevista de 2018).
export const FondoPlato: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#0C0C10" />
    <circle cx={960} cy={520} r={420} fill="#3A2E5A" opacity={0.4} />
    {[300, 1620].map((x) => (
      <g key={x}>
        <path d={`M${x},180 L${x - 40},120 L${x + 40},120 Z`} fill="#3A3D44" {...b} />
        <path d={`M${x - 30},180 L${x + 30},180 L${x + 260 * (x < 960 ? 1 : -1)},${SUELO} L${x - 60 * (x < 960 ? 1 : -1)},${SUELO} Z`} fill="#F2E6C8" opacity={0.06} />
      </g>
    ))}
    <rect x={820} y={700} width={280} height={30} fill="#3A2A20" {...b} />
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#16141C" />
  </g>
);

export const CamaraTV: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-10,0 L-80,220 M10,0 L80,220 M0,0 L0,230" stroke={TINTA} strokeWidth={10} />
      <rect x={-120} y={-110} width={200} height={110} rx={12} fill="#2A2B30" {...b} />
      <rect x={80} y={-90} width={70} height={70} rx={10} fill="#1A1B1F" {...b} />
      {f % 30 < 18 && <circle cx={-90} cy={-90} r={10} fill="#FF3B2F" />}
    </g>
  );
};

export const FondoRing: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#08080C" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={random(`fl${i}`) * W} cy={150 + random(`fy${i}`) * 400} r={4} fill="#F2F2F2" opacity={0.6} />)}
    <path d={`M200,${SUELO - 60} L1720,${SUELO - 60} L1600,600 L320,600 Z`} fill="#2E4A8A" {...b} />
    {[620, 680, 740].map((y, i) => <path key={i} d={`M300,${y} L1620,${y}`} stroke={i === 1 ? '#F2F2F2' : '#C8352B'} strokeWidth={8} />)}
    <rect x={300} y={560} width={24} height={330} fill="#D9B44A" />
    <rect x={1596} y={560} width={24} height={330} fill="#D9B44A" />
    <circle cx={960} cy={240} r={260} fill="#F2E6C8" opacity={0.08} />
  </g>
);

// Escenario de concierto con focos de colores.
export const FondoConcierto: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect width={W} height={H} fill="#07060C" />
      {[0, 1, 2, 3].map((i) => {
        const a = Math.sin(f / 30 + i) * 18;
        const x = 300 + i * 440;
        return <path key={i} d={`M${x},0 L${x - 60},0 L${x - 200 + a * 6},${SUELO} L${x + 140 + a * 6},${SUELO} Z`} fill={['#FF4FA3', '#4FD1FF', '#FFC14F', '#8E5BD8'][i]} opacity={0.12} />;
      })}
      <rect x={160} y={SUELO - 140} width={1600} height={140} fill="#1A1820" {...b} />
      <rect y={SUELO} width={W} height={H - SUELO} fill="#0A0A0E" />
    </g>
  );
};

// Mapa estilizado de Las Vegas con calles y puntos clave.
export const MapaVegas: React.FC<{ marcas?: { x: number; y: number; texto: string; aparece?: number }[]; ruta?: [number, number][]; avance?: number }> = ({ marcas = [], ruta, avance = 1 }) => {
  const f = useCurrentFrame();
  const largo = ruta ? ruta.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - ruta[i][0], p[1] - ruta[i][1]), 0) : 0;
  return (
    <g>
      <rect width={W} height={H} fill="#141B24" />
      {Array.from({ length: 12 }, (_, i) => <path key={`h${i}`} d={`M0,${i * 100} L${W},${i * 100}`} stroke="#22303F" strokeWidth={6} />)}
      {Array.from({ length: 20 }, (_, i) => <path key={`v${i}`} d={`M${i * 100},0 L${i * 100},${H}`} stroke="#22303F" strokeWidth={6} />)}
      <path d={`M700,0 L700,${H}`} stroke="#C9B27A" strokeWidth={26} />
      <path d={`M0,560 L${W},560`} stroke="#C9B27A" strokeWidth={22} />
      <path d={`M1180,0 L1180,${H}`} stroke="#8A7A5A" strokeWidth={14} />
      <text x={720} y={60} fill="#E8E2D4" transform="rotate(90 720 60)" style={{ fontFamily: letra.titulo, fontSize: 36 }}>LAS VEGAS BLVD (THE STRIP)</text>
      <text x={60} y={540} fill="#E8E2D4" style={{ fontFamily: letra.titulo, fontSize: 36 }}>E FLAMINGO RD</text>
      <text x={1200} y={60} fill="#E8E2D4" transform="rotate(90 1200 60)" style={{ fontFamily: letra.titulo, fontSize: 30 }}>KOVAL LN</text>
      {ruta && (
        <path d={`M${ruta.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={crimen.rojo} strokeWidth={10} strokeDasharray={`${largo * avance} ${largo}`} strokeLinecap="round" />
      )}
      {marcas.map((m, i) => {
        const o = Math.min(1, Math.max(0, (f - (m.aparece ?? 8 + i * 10)) / 10));
        return (
          <g key={i} opacity={o} transform={`translate(${m.x} ${m.y})`}>
            <circle r={36} fill={crimen.rojo} opacity={0.25} />
            <circle r={14} fill={crimen.rojo} stroke="#111" strokeWidth={4} />
            <rect x={-(m.texto.length * 15 + 30) / 2} y={-80} width={m.texto.length * 15 + 30} height={46} fill="rgba(10,10,13,0.85)" />
            <text x={0} y={-46} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: 38 }}>{m.texto}</text>
          </g>
        );
      })}
    </g>
  );
};

// Coche que se desplaza de x0 a x1 entre los fotogramas a y b.
export const CocheAnda: React.FC<{ x0: number; x1: number; y: number; color: string; a?: number; b?: number; escala?: number; espejo?: boolean; ventanilla?: [number, number]; ocupantes?: 'tupac' | 'conductor' }> = ({ x0, x1, y, color, a = 0, b = 90, escala = 1, espejo, ventanilla, ocupantes }) => {
  const f = useCurrentFrame();
  const t = b <= a ? 1 : Math.min(1, Math.max(0, (f - a) / (b - a)));
  const e = t * t * (3 - 2 * t);
  const v = ventanilla ? Math.min(1, Math.max(0, (f - ventanilla[0]) / Math.max(1, ventanilla[1] - ventanilla[0]))) : 0;
  return <Coche x={x0 + (x1 - x0) * e} y={y} color={color} escala={escala} espejo={espejo} ventanilla={v} ocupantes={ocupantes} />;
};

// Destellos blancos en pantalla (sustituyen cualquier imagen de violencia).
export const Destellos: React.FC<{ en: number[] }> = ({ en }) => {
  const f = useCurrentFrame();
  const o = en.reduce((m, k) => Math.max(m, f >= k && f < k + 4 ? 1 - (f - k) / 4 : 0), 0);
  return <rect width={W} height={H} fill="#FFF8E8" opacity={o * 0.85} />;
};

// Disco de vinilo con etiqueta (portadas inventadas, sin arte real).
export const Disco: React.FC<{ x: number; y: number; titulo: string; color?: string; escala?: number }> = ({ x, y, titulo, color = crimen.rojo, escala = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <rect x={-260} y={-260} width={520} height={520} fill="#1A1A20" {...b} />
      <g transform={`translate(120 0) rotate(${f * 3})`}>
        <circle r={230} fill="#0A0A0C" />
        {[200, 170, 140].map((r) => <circle key={r} r={r} fill="none" stroke="#26262B" strokeWidth={3} />)}
        <circle r={80} fill={color} />
        <circle r={10} fill="#0A0A0C" />
      </g>
      <rect x={-260} y={-260} width={300} height={520} fill="#24242C" {...b} />
      <text x={-110} y={10} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: Math.min(64, 520 / Math.max(4, titulo.length)), letterSpacing: 2 }}>{titulo}</text>
    </g>
  );
};

// Fondos de escena del estilo true crime (SVG 1920x1080). Planos, oscuros y con un punto de luz.
import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { crimen } from '../MarcaCrimen';
import { TINTA } from '../Personaje';
import { H, SUELO, W } from './base';

export type Hora = 'dia' | 'atardecer' | 'noche';
const CIELOS: Record<Hora, [string, string, string]> = {
  dia: ['#5E7E8E', '#9FB4B0', '#D9D2B8'],
  atardecer: ['#1A1726', '#5A2F3A', '#C2643E'],
  noche: ['#05070D', '#0E1626', '#1D2C40'],
};

const Cielo: React.FC<{ hora: Hora; id: string }> = ({ hora, id }) => {
  const [a, b, c] = CIELOS[hora];
  return (
    <>
      <defs>
        <linearGradient id={`cielo-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.6" stopColor={b} />
          <stop offset="0.85" stopColor={c} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#cielo-${id})`} />
      {hora === 'noche' &&
        Array.from({ length: 70 }, (_, i) => <circle key={i} cx={random(`es${i}`) * W} cy={random(`ey${i}`) * 500} r={random(`er${i}`) * 1.6 + 0.4} fill="#E8E2D4" opacity={0.5} />)}
    </>
  );
};

// Linea de arboles de selva generada con bultos aleatorios.
const LineaArboles: React.FC<{ base: number; alto: number; color: string; semilla: string; paso?: number }> = ({ base, alto, color, semilla, paso = 70 }) => {
  let d = `M-50,${H} L-50,${base}`;
  for (let x = -50; x <= W + 100; x += paso) {
    const h = alto * (0.55 + random(`${semilla}${x}`) * 0.45);
    d += ` Q${x + paso / 2},${base - h - 30} ${x + paso},${base - h * 0.7}`;
  }
  d += ` L${W + 100},${H} Z`;
  return <path d={d} fill={color} />;
};

const Palmera: React.FC<{ x: number; base: number; alto: number; color: string }> = ({ x, base, alto, color }) => (
  <g>
    <path d={`M${x},${base} Q${x + 18},${base - alto / 2} ${x + 8},${base - alto}`} stroke={color} strokeWidth={14} fill="none" />
    {[-150, -110, -60, -20, 30].map((a, i) => {
      const r = (a * Math.PI) / 180;
      return <path key={i} d={`M${x + 8},${base - alto} q${Math.cos(r) * 90},${Math.sin(r) * 50 - 20} ${Math.cos(r) * 160},${Math.sin(r) * 90 + 30}`} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

export const FondoSelva: React.FC<{ hora?: Hora; cabanas?: boolean; claro?: boolean }> = ({ hora = 'atardecer', cabanas = false, claro = true }) => {
  const oscuro = hora === 'noche';
  return (
    <g>
      <Cielo hora={hora} id={`selva-${hora}`} />
      <LineaArboles base={560} alto={160} color={oscuro ? '#0B1712' : '#1D3326'} semilla="s1" />
      <LineaArboles base={640} alto={130} color={oscuro ? '#08120D' : '#14261B'} semilla="s2" paso={90} />
      <Palmera x={180} base={700} alto={300} color={oscuro ? '#050B08' : '#0E1C14'} />
      <Palmera x={1720} base={690} alto={340} color={oscuro ? '#050B08' : '#0E1C14'} />
      <rect y={680} width={W} height={H - 680} fill={oscuro ? '#141A12' : '#3A3524'} />
      {claro && <ellipse cx={W / 2} cy={860} rx={900} ry={190} fill={oscuro ? '#1C2218' : '#5A4E33'} opacity={0.8} />}
      {cabanas &&
        [260, 520, 1380, 1640].map((x, i) => (
          <g key={i} transform={`translate(${x} ${700 - (i % 2) * 14})`}>
            <rect x={-80} y={-70} width={160} height={70} fill={oscuro ? '#2A2620' : '#6B5A40'} stroke={TINTA} strokeWidth={5} />
            <path d="M-100,-66 L0,-120 L100,-66 Z" fill={oscuro ? '#1A1714' : '#4A3E2C'} stroke={TINTA} strokeWidth={5} />
            <rect x={-18} y={-44} width={36} height={44} fill={TINTA} />
            {oscuro && <rect x={40} y={-50} width={22} height={18} fill="#E8B04A" opacity={0.7} />}
          </g>
        ))}
    </g>
  );
};

// Pabellon abierto de Jonestown: tejado, postes, bombillas y la silla al fondo.
export const FondoPabellon: React.FC<{ silla?: boolean; bancos?: boolean; hora?: Hora; vacio?: boolean }> = ({ silla = true, bancos = true, hora = 'noche' }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <FondoSelva hora={hora} claro={false} />
      <path d="M220,330 L1700,330 L1820,420 L100,420 Z" fill="#3B2F25" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <rect x={100} y={418} width={1720} height={22} fill="#2A211A" stroke={TINTA} strokeWidth={6} />
      {[150, 520, 960, 1400, 1770].map((x) => (
        <rect key={x} x={x - 14} y={438} width={28} height={SUELO - 438} fill="#2E241C" stroke={TINTA} strokeWidth={5} />
      ))}
      <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#2A2420" />
      <path d={`M120,456 Q540,500 960,470 Q1380,500 1800,456`} stroke="#141210" strokeWidth={4} fill="none" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 180 + i * 130;
        const y = 470 + Math.sin((i / 12) * Math.PI) * 22;
        const brillo = 0.75 + 0.25 * Math.sin(f / 7 + i * 1.3);
        return (
          <g key={i}>
            <circle cx={x} cy={y + 12} r={34} fill="#F2C46A" opacity={0.12 * brillo} />
            <circle cx={x} cy={y + 12} r={9} fill="#FBE3A0" opacity={brillo} />
          </g>
        );
      })}
      {silla && (
        <g transform="translate(960 640)">
          <rect x={-70} y={-170} width={140} height={190} rx={18} fill="#5A1F1C" stroke={TINTA} strokeWidth={6} />
          <rect x={-90} y={10} width={180} height={40} rx={8} fill="#4A1A17" stroke={TINTA} strokeWidth={6} />
        </g>
      )}
      {bancos &&
        [0, 1, 2].map((r) => (
          <rect key={r} x={240 - r * 40} y={760 + r * 60} width={1440 + r * 80} height={18} fill="#3A2E24" stroke={TINTA} strokeWidth={4} opacity={0.9} />
        ))}
    </g>
  );
};

export const FondoIglesia: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#3A2A20" />
    <rect width={W} height={H} fill="url(#luz-iglesia)" />
    <defs>
      <radialGradient id="luz-iglesia" cx="0.5" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#E9B66A" stopOpacity="0.35" />
        <stop offset="1" stopColor="#000" stopOpacity="0.4" />
      </radialGradient>
    </defs>
    {[300, 760, 1160, 1620].map((x) => (
      <g key={x}>
        <path d={`M${x - 70},520 L${x - 70},260 Q${x},170 ${x + 70},260 L${x + 70},520 Z`} fill="#F1D9A0" opacity={0.85} stroke={TINTA} strokeWidth={6} />
        <path d={`M${x},180 L${x},520 M${x - 70},360 L${x + 70},360`} stroke={TINTA} strokeWidth={5} />
        <path d={`M${x - 70},520 L${x + 70},520 L${x + 260},${SUELO} L${x - 180},${SUELO} Z`} fill="#F1D9A0" opacity={0.07} />
      </g>
    ))}
    <rect y={SUELO - 10} width={W} height={H - SUELO + 10} fill="#2A1D15" />
    <rect x={860} y={560} width={200} height={170} fill="#5A3A26" stroke={TINTA} strokeWidth={6} />
    <path d="M960,520 L960,560 M940,538 L980,538" stroke="#E9B66A" strokeWidth={6} />
  </g>
);

export const FondoCiudad: React.FC<{ hora?: Hora }> = ({ hora = 'noche' }) => (
  <g>
    <Cielo hora={hora} id={`ciudad-${hora}`} />
    <path d={`M0,700 Q300,610 620,660 T1300,640 T1920,620 L1920,${H} L0,${H} Z`} fill="#121A26" />
    {Array.from({ length: 34 }, (_, i) => {
      const x = 40 + i * 56;
      const h = 120 + random(`ed${i}`) * 300;
      return (
        <g key={i}>
          <rect x={x} y={760 - h} width={50} height={h} fill="#18202D" stroke="#0A0D14" strokeWidth={3} />
          {Array.from({ length: Math.floor(h / 40) }, (_, k) =>
            random(`v${i}-${k}`) > 0.55 ? <rect key={k} x={x + 12 + (k % 2) * 16} y={760 - h + 16 + k * 36} width={9} height={14} fill="#E8B04A" opacity={0.7} /> : null,
          )}
        </g>
      );
    })}
    <path d="M1180,760 L1220,330 L1260,760 Z" fill="#1E2735" stroke="#0A0D14" strokeWidth={3} />
    <rect y={760} width={W} height={H - 760} fill="#151B24" />
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#20262E" />
  </g>
);

export const FondoCampo: React.FC = () => (
  <g>
    <Cielo hora="atardecer" id="campo" />
    <path d={`M0,640 Q400,540 900,620 T1920,580 L1920,${H} L0,${H} Z`} fill="#3D3B2A" />
    <path d={`M0,740 Q500,660 1100,720 T1920,700 L1920,${H} L0,${H} Z`} fill="#4E4730" />
    {Array.from({ length: 18 }, (_, i) => (
      <ellipse key={i} cx={100 + i * 110} cy={640 - Math.sin(i) * 40} rx={40} ry={70} fill="#1D2A1C" />
    ))}
    {Array.from({ length: 24 }, (_, i) => (
      <rect key={i} x={i * 84} y={820} width={10} height={60} fill="#2E2418" />
    ))}
    <path d="M0,836 L1920,836 M0,858 L1920,858" stroke="#2E2418" strokeWidth={6} />
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#3E3826" />
  </g>
);

const Avioneta: React.FC<{ x: number; y: number; escala: number; grande?: boolean }> = ({ x, y, escala, grande }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M-160,-10 Q-150,-40 -60,-42 L150,-38 Q190,-30 196,-6 L190,10 L-150,10 Z" fill="#D9D4C8" stroke={TINTA} strokeWidth={6} />
    <path d={grande ? 'M-40,-44 L-20,-60 L120,-60 L130,-44 Z' : 'M-30,-44 L-20,-54 L80,-54 L86,-44 Z'} fill="#C8C2B4" stroke={TINTA} strokeWidth={5} />
    <path d="M150,-38 L190,-110 L214,-110 L196,-30 Z" fill="#B3261E" stroke={TINTA} strokeWidth={5} />
    {[-110, -70, -30, 10, 50].slice(0, grande ? 5 : 3).map((wx) => <rect key={wx} x={wx} y={-30} width={22} height={16} rx={4} fill="#3A4656" />)}
    <circle cx={-80} cy={16} r={14} fill={TINTA} />
    <circle cx={110} cy={16} r={14} fill={TINTA} />
  </g>
);

export const FondoPista: React.FC<{ hora?: Hora; aviones?: boolean }> = ({ hora = 'atardecer', aviones = true }) => (
  <g>
    <FondoSelva hora={hora} claro={false} />
    <path d={`M760,690 L1160,690 L1700,${H} L220,${H} Z`} fill="#6B5636" opacity={0.95} />
    <path d={`M960,700 L960,${H}`} stroke="#8A7550" strokeWidth={6} strokeDasharray="30 40" />
    <rect y={680} width={W} height={20} fill="#1A2418" opacity={0.6} />
    {aviones && (
      <>
        <Avioneta x={600} y={760} escala={1.3} grande />
        <Avioneta x={1380} y={740} escala={0.8} />
      </>
    )}
  </g>
);

export const FondoOficina: React.FC<{ hora?: Hora }> = ({ hora = 'dia' }) => (
  <g>
    <rect width={W} height={H} fill={hora === 'noche' ? '#1B1E24' : '#3C4049'} />
    <rect x={1180} y={140} width={560} height={420} fill={hora === 'noche' ? '#0E1626' : '#C9D4DA'} stroke={TINTA} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={1180} y={150 + i * 34} width={560} height={14} fill="#2A2D33" opacity={0.85} />
    ))}
    {hora !== 'noche' && <path d="M1180,150 L1740,150 L1400,980 L620,980 Z" fill="#F1E3C0" opacity={0.06} />}
    <rect x={260} y={700} width={1400} height={40} fill="#4A3A2C" stroke={TINTA} strokeWidth={6} />
    <rect x={300} y={740} width={40} height={SUELO - 740} fill="#3A2C20" />
    <rect x={1580} y={740} width={40} height={SUELO - 740} fill="#3A2C20" />
    <g transform="translate(420 700)">
      <path d="M0,0 L0,-120 L60,-170" stroke={TINTA} strokeWidth={10} fill="none" />
      <path d="M30,-190 L110,-150 L80,-120 Z" fill="#2E5A3A" stroke={TINTA} strokeWidth={5} />
      <circle cx={0} cy={0} r={30} fill="#2E5A3A" stroke={TINTA} strokeWidth={5} />
    </g>
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#2A2C30" />
  </g>
);

export const FondoTribunal: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#3A2A1E" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={0} width={190} height={H} fill="#43301F" stroke="#2A1D12" strokeWidth={6} />)}
    <rect x={560} y={420} width={800} height={260} fill="#5A3E26" stroke={TINTA} strokeWidth={8} />
    <rect x={540} y={400} width={840} height={36} fill="#6B4A2E" stroke={TINTA} strokeWidth={6} />
    <circle cx={960} cy={250} r={90} fill="#C9A86A" opacity={0.25} stroke="#C9A86A" strokeWidth={6} />
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#2A1D12" />
  </g>
);

export const FondoCementerio: React.FC = () => (
  <g>
    <Cielo hora="dia" id="cementerio" />
    <rect width={W} height={H} fill="#1C2430" opacity={0.45} />
    <path d={`M0,620 Q500,520 1000,580 T1920,560 L1920,${H} L0,${H} Z`} fill="#3A4A38" />
    <path d={`M0,760 Q600,700 1200,740 T1920,720 L1920,${H} L0,${H} Z`} fill="#2E3C2C" />
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse key={i} cx={150 + i * 280} cy={560 - (i % 3) * 20} rx={80} ry={120} fill="#1E2A1E" />
    ))}
    <rect x={560} y={560} width={800} height={200} rx={8} fill="#8E8C86" stroke={TINTA} strokeWidth={6} />
    {Array.from({ length: 14 }, (_, r) => (
      <rect key={r} x={600 + (r % 2) * 380} y={590 + Math.floor(r / 2) * 22} width={340} height={8} fill="#5E5C56" />
    ))}
    <rect y={SUELO - 6} width={W} height={H - SUELO + 6} fill="#26321F" />
  </g>
);

// Escenario oscuro con un foco: para presentar personajes, discursos o momentos aislados.
export const FondoFoco: React.FC<{ color?: string; x?: number }> = ({ color = '#F2E6C8', x = 960 }) => (
  <g>
    <rect width={W} height={H} fill={crimen.negro} />
    <path d={`M${x - 90},0 L${x + 90},0 L${x + 420},${SUELO} L${x - 420},${SUELO} Z`} fill={color} opacity={0.08} />
    <ellipse cx={x} cy={SUELO} rx={430} ry={60} fill={color} opacity={0.12} />
    <rect y={SUELO} width={W} height={H - SUELO} fill="#101014" />
  </g>
);

export const FondoNegro: React.FC = () => <rect width={W} height={H} fill={crimen.negro} />;

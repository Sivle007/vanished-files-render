import React from 'react';
import { random, useCurrentFrame } from 'remotion';

// Leo y Marisol: presentadores ORIGINALES del canal, en 2D semirrealista (proporciones humanas, sombreado plano a dos tonos).
// No se basan en ningún personaje de Rockstar ni en personas reales.
export type Expr = 'normal' | 'emocionado' | 'esceptico' | 'sorprendido' | 'derrotado' | 'orgulloso';
export type Acc = 'pc' | 'cinta' | 'maleta' | 'gorro' | 'premio';

const T = { stroke: '#1a0f14', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// Boca: abre y cierra mientras habla, con variación pseudoaleatoria para que no parezca un metrónomo.
const useBoca = (habla: boolean) => {
  const f = useCurrentFrame();
  if (!habla) return 0;
  const silaba = Math.floor(f / 3);
  const base = 0.35 + 0.65 * random(`b${silaba}`);
  const pausa = random(`p${Math.floor(f / 14)}`) < 0.12 ? 0.1 : 1;
  return base * pausa;
};

const Cara: React.FC<{ expr: Expr; abre: number; piel: string; sombra: string; mujer?: boolean }> = ({ expr, abre, piel, sombra, mujer }) => {
  const f = useCurrentFrame();
  const parpadeo = f % 97 > 92 ? 0.15 : 1;
  const ojoAlto = (expr === 'sorprendido' || expr === 'emocionado' ? 13 : expr === 'derrotado' ? 8 : 11) * parpadeo;
  // Cejas: [dentro, fuera] para cada lado, en y relativa.
  const cejas: Record<Expr, [number, number, number, number]> = {
    normal: [-34, -36, -36, -34],
    emocionado: [-44, -42, -42, -44],
    esceptico: [-30, -32, -46, -40],
    sorprendido: [-48, -44, -44, -48],
    derrotado: [-42, -30, -30, -42],
    orgulloso: [-30, -38, -38, -30],
  };
  const [ci1, co1, co2, ci2] = cejas[expr];
  const ojo = (x: number) => (
    <g>
      <ellipse cx={x} cy={-18} rx={12} ry={ojoAlto} fill="#fbf7f2" {...T} strokeWidth={2.5} />
      <circle cx={x + (expr === 'esceptico' ? 3 : 0)} cy={-17} r={Math.min(7, ojoAlto * 0.65)} fill="#3b2516" />
      <circle cx={x + 2} cy={-20} r={2.2} fill="#fff" />
    </g>
  );
  let boca: React.ReactNode;
  const ancho = 22;
  if (abre > 0.05) {
    boca = <ellipse cx={0} cy={34} rx={ancho * (0.7 + abre * 0.3)} ry={4 + abre * 13} fill="#5a1f22" {...T} strokeWidth={2.5} />;
  } else if (expr === 'emocionado' || expr === 'orgulloso') {
    boca = <path d={`M-${ancho} 28 Q 0 ${expr === 'emocionado' ? 52 : 42} ${ancho} ${expr === 'orgulloso' ? 24 : 28} Z`} fill="#fbf7f2" {...T} strokeWidth={2.5} />;
  } else if (expr === 'sorprendido') {
    boca = <ellipse cx={0} cy={36} rx={9} ry={12} fill="#5a1f22" {...T} strokeWidth={2.5} />;
  } else if (expr === 'derrotado') {
    boca = <path d={`M-${ancho - 4} 40 Q 0 26 ${ancho - 4} 40`} fill="none" {...T} strokeWidth={4} />;
  } else if (expr === 'esceptico') {
    boca = <path d={`M-${ancho - 4} 34 L ${ancho - 2} 30`} fill="none" {...T} strokeWidth={4} />;
  } else {
    boca = <path d={`M-${ancho - 4} 32 Q 0 40 ${ancho - 4} 32`} fill="none" {...T} strokeWidth={4} />;
  }
  return (
    <g>
      {ojo(-24)}
      {ojo(24)}
      <path d={`M-40 ${co1} Q -26 ${(co1 + ci1) / 2 - 5} -10 ${ci1}`} fill="none" stroke={mujer ? '#2a1a12' : '#1f140d'} strokeWidth={mujer ? 5 : 7} strokeLinecap="round" />
      <path d={`M10 ${ci2} Q 26 ${(co2 + ci2) / 2 - 5} 40 ${co2}`} fill="none" stroke={mujer ? '#2a1a12' : '#1f140d'} strokeWidth={mujer ? 5 : 7} strokeLinecap="round" />
      <path d="M2 -8 Q 8 10 0 14 Q -4 16 -8 13" fill="none" stroke={sombra} strokeWidth={3.5} strokeLinecap="round" />
      {boca}
      {mujer && <path d={`M-${ancho - 2} 31 Q 0 ${abre > 0.05 ? 26 : 29} ${ancho - 2} 31`} fill="none" stroke="#a8434f" strokeWidth={2} opacity={0.6} />}
      <ellipse cx={-38} cy={14} rx={9} ry={5} fill="#e98a7a" opacity={expr === 'emocionado' ? 0.45 : 0.18} />
      <ellipse cx={38} cy={14} rx={9} ry={5} fill="#e98a7a" opacity={expr === 'emocionado' ? 0.45 : 0.18} />
      <ellipse cx={0} cy={0} rx={0} ry={0} fill={piel} />
    </g>
  );
};

const Accesorio: React.FC<{ acc?: Acc; lado: 1 | -1 }> = ({ acc, lado }) => {
  const f = useCurrentFrame();
  if (!acc) return null;
  switch (acc) {
    case 'pc':
      return (
        <g transform="translate(0 70) rotate(-4)">
          <rect x={-95} y={-60} width={190} height={130} rx={6} fill="#c9a36a" {...T} />
          <path d="M-95 -60 L -70 -85 L 115 -85 L 95 -60 Z" fill="#dcb980" {...T} />
          <rect x={-70} y={-40} width={140} height={80} rx={6} fill="#2a2440" {...T} />
          <text x={0} y={14} textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={46} fill="#29e0ff">PC</text>
          <text x={0} y={60} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={16} fill="#5a3b1a">CARTÓN</text>
        </g>
      );
    case 'cinta': {
      const largo = 120 + Math.abs(Math.sin(f / 15)) * 120;
      return (
        <g transform="translate(-40 60)">
          <rect x={-40} y={-30} width={70} height={60} rx={14} fill="#ffd23f" {...T} />
          <rect x={30} y={-6} width={largo} height={14} fill="#fff1a8" {...T} strokeWidth={2} />
          {Array.from({ length: Math.floor(largo / 12) }, (_, i) => <line key={i} x1={36 + i * 12} y1={-6} x2={36 + i * 12} y2={i % 5 ? 0 : 4} stroke="#1a0f14" strokeWidth={2} />)}
        </g>
      );
    }
    case 'maleta':
      return (
        <g transform={`translate(${lado * 150} 120)`}>
          <rect x={-70} y={-60} width={140} height={110} rx={14} fill="#c0392b" {...T} />
          <path d="M-26 -60 L -26 -82 L 26 -82 L 26 -60" fill="none" {...T} strokeWidth={8} />
          <rect x={-70} y={-12} width={140} height={10} fill="#8e2a20" />
          <circle cx={30} cy={20} r={10} fill="#ffd23f" />
        </g>
      );
    case 'premio':
      return (
        <g transform="translate(0 40)">
          <path d="M-40 -60 L 40 -60 L 34 -10 Q 0 20 -34 -10 Z" fill="#ffd23f" {...T} />
          <rect x={-8} y={4} width={16} height={30} fill="#ffd23f" {...T} />
          <rect x={-34} y={32} width={68} height={16} rx={4} fill="#ff8a3d" {...T} />
        </g>
      );
    default:
      return null;
  }
};

export const Presentador: React.FC<{ quien: 'leo' | 'marisol'; expr: Expr; habla: boolean; acc?: Acc; alto: number }> = ({ quien, expr, habla, acc, alto }) => {
  const f = useCurrentFrame();
  const abre = useBoca(habla);
  const respira = Math.sin(f / 22 + (quien === 'leo' ? 0 : 1.5)) * 3;
  const gesto = habla ? Math.sin(f / 9) * 4 : 0;
  const inclina = expr === 'derrotado' ? 6 : expr === 'esceptico' ? (quien === 'leo' ? -4 : 4) : gesto * 0.4;
  const escala = alto / 620;
  if (quien === 'leo') {
    const piel = '#c68a62';
    const sombra = '#a2694a';
    return (
      <svg width={420 * escala} height={alto} viewBox="-210 -420 420 620" style={{ overflow: 'visible' }}>
        <g transform={`translate(0 ${respira})`}>
          {/* Torso con camisa hawaiana */}
          <path d="M-150 200 Q -160 40 -110 0 Q -70 -22 -30 -26 L 30 -26 Q 70 -22 110 0 Q 160 40 150 200 Z" fill="#2f6fd6" {...T} />
          <path d="M-150 200 Q -158 60 -118 10 L -100 200 Z" fill="#2558ad" />
          {[[-90, 40], [-60, 110], [-110, 150], [70, 30], [100, 100], [60, 160], [-20, 70], [20, 140]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} rx={7} ry={4} transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 9} ${Math.sin((a * Math.PI) / 180) * 9})`} fill="#f4f0e6" />)}
              <circle r={4} fill="#ffd23f" />
            </g>
          ))}
          <path d="M-30 -26 L 0 30 L 30 -26" fill={piel} {...T} />
          <path d="M-30 -26 L -48 20 L -8 12 Z M30 -26 L 48 20 L 8 12 Z" fill="#2558ad" {...T} strokeWidth={2.5} />
          {/* Brazos */}
          <path d={`M-118 20 Q -150 110 -110 ${150 + gesto} L -60 ${130 + gesto} Q -80 80 -84 30 Z`} fill="#2f6fd6" {...T} />
          <path d={`M118 20 Q 150 110 110 ${150 - gesto} L 60 ${130 - gesto} Q 80 80 84 30 Z`} fill="#2f6fd6" {...T} />
          <ellipse cx={-70} cy={140 + gesto} rx={22} ry={18} fill={piel} {...T} />
          <ellipse cx={70} cy={140 - gesto} rx={22} ry={18} fill={piel} {...T} />
          {!acc && (
            <g transform={`translate(-50 ${110 + gesto}) rotate(-12)`}>
              <rect x={-36} y={-46} width={72} height={92} rx={4} fill="#fff7d6" {...T} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M-24 ${-30 + i * 18} q 10 -6 20 0 t 24 0`} stroke="#7b2ff7" strokeWidth={2} fill="none" />)}
            </g>
          )}
          <Accesorio acc={acc} lado={-1} />
          {/* Cuello y cabeza */}
          <path d="M-24 -30 L -22 -70 L 22 -70 L 24 -30 Q 0 -14 -24 -30 Z" fill={sombra} {...T} />
          <g transform={`translate(0 -150) rotate(${inclina})`}>
            <ellipse cx={-62} cy={0} rx={12} ry={18} fill={piel} {...T} />
            <ellipse cx={62} cy={0} rx={12} ry={18} fill={piel} {...T} />
            <path d="M-60 -40 Q -64 50 -20 78 Q 0 88 20 78 Q 64 50 60 -40 Q 60 -96 0 -98 Q -60 -96 -60 -40 Z" fill={piel} {...T} />
            <path d="M-60 -40 Q -64 50 -20 78 Q -44 40 -46 -20 Z" fill={sombra} opacity={0.55} />
            <path d="M-52 20 Q -50 70 0 82 Q 50 70 52 20 Q 40 54 0 58 Q -40 54 -52 20 Z" fill="#2b1d14" opacity={0.35} />
            <path d="M-62 -40 Q -64 -70 -50 -78 L 50 -78 Q 64 -70 62 -40 Q 40 -56 0 -56 Q -40 -56 -62 -40 Z" fill="#241710" />
            {acc === 'gorro' ? (
              <path d="M-66 -64 L 0 -170 L 66 -64 Z" fill="#cfd6df" {...T} />
            ) : (
              <g>
                <path d="M-64 -60 Q -62 -118 0 -120 Q 62 -118 64 -60 Z" fill="#1fb5a8" {...T} />
                <path d="M-64 -62 L 98 -62 Q 104 -50 92 -48 L -64 -50 Z" fill="#17897f" {...T} />
                <circle cx={0} cy={-118} r={6} fill="#17897f" />
              </g>
            )}
            <Cara expr={expr} abre={abre} piel={piel} sombra={sombra} />
          </g>
        </g>
      </svg>
    );
  }
  const piel = '#d9a07a';
  const sombra = '#b8805c';
  return (
    <svg width={420 * escala} height={alto} viewBox="-210 -420 420 620" style={{ overflow: 'visible' }}>
      <g transform={`translate(0 ${respira})`}>
        {/* Melena por detrás */}
        <g transform={`translate(0 -150) rotate(${inclina})`}>
          <path d="M-78 -40 Q -96 80 -70 150 Q -40 170 0 160 Q 40 170 70 150 Q 96 80 78 -40 Q 70 -110 0 -112 Q -70 -110 -78 -40 Z" fill="#3a2318" />
        </g>
        {/* Camiseta blanca y chaqueta vaquera */}
        <path d="M-140 200 Q -150 50 -100 6 Q -64 -18 -26 -22 L 26 -22 Q 64 -18 100 6 Q 150 50 140 200 Z" fill="#4a78b8" {...T} />
        <path d="M-140 200 Q -148 70 -108 14 L -92 200 Z" fill="#3c64a0" />
        <path d="M-44 -18 L 44 -18 L 40 200 L -40 200 Z" fill="#f6f2ec" {...T} />
        <path d="M-26 -22 Q 0 10 26 -22" fill={piel} {...T} />
        <path d="M-44 -18 L -70 60 L -40 200 M44 -18 L 70 60 L 40 200" fill="none" stroke="#2f5288" strokeWidth={5} />
        {[-60, 60].map((x) => <rect key={x} x={x - 14} y={70} width={28} height={22} rx={3} fill="#3c64a0" {...T} strokeWidth={2} />)}
        <path d={`M-108 20 Q -138 110 -100 ${150 + gesto} L -56 ${132 + gesto} Q -72 84 -76 32 Z`} fill="#4a78b8" {...T} />
        <path d={`M108 20 Q 138 110 100 ${150 - gesto} L 56 ${132 - gesto} Q 72 84 76 32 Z`} fill="#4a78b8" {...T} />
        <ellipse cx={-66} cy={142 + gesto} rx={19} ry={16} fill={piel} {...T} />
        <ellipse cx={66} cy={142 - gesto} rx={19} ry={16} fill={piel} {...T} />
        {!acc && (
          <g transform={`translate(54 ${112 - gesto}) rotate(10)`}>
            <rect x={-46} y={-56} width={92} height={112} rx={6} fill="#3dff9a" {...T} />
            <rect x={-46} y={-56} width={92} height={18} rx={4} fill="#2bc77a" {...T} strokeWidth={2} />
            <circle cx={16} cy={18} r={18} fill="none" stroke="#0b6b3f" strokeWidth={4} />
            <path d="M6 18 L 14 26 L 28 8" stroke="#0b6b3f" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        )}
        <Accesorio acc={acc} lado={1} />
        <path d="M-20 -28 L -18 -66 L 18 -66 L 20 -28 Q 0 -14 -20 -28 Z" fill={sombra} {...T} />
        <g transform={`translate(0 -150) rotate(${inclina})`}>
          <path d="M-54 -36 Q -58 46 -18 74 Q 0 82 18 74 Q 58 46 54 -36 Q 54 -90 0 -92 Q -54 -90 -54 -36 Z" fill={piel} {...T} />
          <path d="M-54 -36 Q -58 46 -18 74 Q -40 38 -42 -16 Z" fill={sombra} opacity={0.5} />
          <circle cx={-56} cy={22} r={7} fill="none" stroke="#ffd23f" strokeWidth={3} />
          <circle cx={56} cy={22} r={7} fill="none" stroke="#ffd23f" strokeWidth={3} />
          <Cara expr={expr} abre={abre} piel={piel} sombra={sombra} mujer />
          {/* Gafas redondas */}
          <circle cx={-24} cy={-18} r={21} fill="#ffffff22" stroke="#1a0f14" strokeWidth={4} />
          <circle cx={24} cy={-18} r={21} fill="#ffffff22" stroke="#1a0f14" strokeWidth={4} />
          <line x1={-3} y1={-20} x2={3} y2={-20} stroke="#1a0f14" strokeWidth={4} />
          {/* Flequillo y raya */}
          <path d="M-58 -30 Q -62 -96 0 -98 Q 62 -96 58 -30 Q 50 -64 18 -74 Q 0 -60 -10 -74 Q -44 -66 -58 -30 Z" fill="#3a2318" {...T} strokeWidth={2.5} />
        </g>
      </g>
    </svg>
  );
};

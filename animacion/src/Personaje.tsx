// Personaje del canal: cabeza redonda grande, extremidades finas con contorno, ropa de colores planos y cara expresiva.
// Se dibuja en SVG con los pies en (0,0); mide unas 680 unidades de alto. Todo es parametrico para animarlo despues.
import React from 'react';

export const TINTA = '#26262B';
export const PIELES = { clara: '#F4F1EA', media: '#E2B98F', morena: '#B07A50', oscura: '#6E4A33' } as const;

export type Expresion = 'neutral' | 'sonrisa' | 'triste' | 'enfado' | 'miedo' | 'sorpresa' | 'serio' | 'preocupado';
export type Pose = 'quieto' | 'senalar' | 'cabeza' | 'cara' | 'alto' | 'hablar' | 'bolsillos' | 'brazosArriba';
export type Pelo = 'ninguno' | 'mechones' | 'corto' | 'raya' | 'tupe' | 'flequillo' | 'melena' | 'entradas' | 'canoso' | 'afro' | 'rapado';

export type DatosPersonaje = {
  id: string;
  piel?: string;
  pelo?: Pelo;
  colorPelo?: string;
  camisa?: { color: string; manga?: 'corta' | 'larga'; chaqueta?: boolean };
  pantalon?: { color: string; tipo?: 'corto' | 'largo' | 'falda' };
  zapatos?: string;
  expresion?: Expresion;
  pose?: Pose;
  barba?: 'bigote' | 'barba';
  gafasSol?: boolean;
  // Panuelo atado a la frente (color) y cadena al cuello.
  bandana?: string;
  cadena?: boolean;
  gafas?: boolean;
  corbata?: string;
  bufanda?: string;
  objeto?: 'libreta' | 'camara' | 'maletin' | 'micro' | 'carpeta' | 'linterna';
  // Para animar: mirada (-1..1), parpadeo (0 abierto..1 cerrado), respiracion (0..1).
  mirada?: number;
  parpadeo?: number;
  respiracion?: number;
  // Fase del paso al andar (radianes, avanza con el tiempo). Sin definir = de pie.
  paso?: number;
  // Inclinacion de la cabeza en grados y fase del gesto de los brazos (para que nunca esten quietos del todo).
  cabeceo?: number;
  gesto?: number;
};

const CABEZA_Y = -540;
const R_CABEZA = 104;
const HOMBRO_Y = -395;
const CADERA_Y = -215;
const L_BRAZO = 118;
const L_ANTEBRAZO = 108;

type Brazo = { a1: number; a2: number; mano?: 'puno' | 'dedo' | 'palma' | 'oculta' };
const POSES: Record<Pose, { izq: Brazo; der: Brazo; detrasCabeza?: boolean; delanteCara?: boolean }> = {
  quieto: { izq: { a1: 8, a2: -4 }, der: { a1: 8, a2: -4 } },
  bolsillos: { izq: { a1: 4, a2: -18, mano: 'oculta' }, der: { a1: 4, a2: -18, mano: 'oculta' } },
  senalar: { izq: { a1: 8, a2: -4 }, der: { a1: 150, a2: 25, mano: 'dedo' } },
  cabeza: { izq: { a1: 128, a2: 112, mano: 'oculta' }, der: { a1: 128, a2: 112, mano: 'oculta' }, detrasCabeza: true },
  cara: { izq: { a1: 8, a2: -4 }, der: { a1: 118, a2: 112, mano: 'palma' }, delanteCara: true },
  alto: { izq: { a1: 8, a2: -4 }, der: { a1: 36, a2: 84, mano: 'palma' } },
  hablar: { izq: { a1: 10, a2: 20 }, der: { a1: 22, a2: 62 } },
  brazosArriba: { izq: { a1: 160, a2: 10, mano: 'palma' }, der: { a1: 160, a2: 10, mano: 'palma' } },
};

// Direccion de un segmento: angulo 0 = hacia abajo; positivo = hacia fuera del cuerpo.
const dir = (grados: number, lado: number): [number, number] => {
  const a = (grados * Math.PI) / 180;
  return [lado * Math.sin(a), Math.cos(a)];
};

function puntosBrazo(lado: number, b: Brazo, respiracion: number) {
  const h: [number, number] = [lado * 60, HOMBRO_Y - respiracion * 4];
  const d1 = dir(b.a1, lado);
  const codo: [number, number] = [h[0] + d1[0] * L_BRAZO, h[1] + d1[1] * L_BRAZO];
  const d2 = dir(b.a1 + b.a2, lado);
  const mano: [number, number] = [codo[0] + d2[0] * L_ANTEBRAZO, codo[1] + d2[1] * L_ANTEBRAZO];
  return { h, codo, mano, d2 };
}

// Linea con contorno: trazo oscuro grueso debajo y relleno encima.
const Trazo: React.FC<{ puntos: [number, number][]; relleno: string; ancho: number }> = ({ puntos, relleno, ancho }) => {
  const p = puntos.map((q) => q.join(',')).join(' ');
  return (
    <>
      <polyline points={p} fill="none" stroke={TINTA} strokeWidth={ancho + 12} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={p} fill="none" stroke={relleno} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
};

const Mano: React.FC<{ en: [number, number]; d: [number, number]; tipo?: Brazo['mano']; piel: string; lado: number }> = ({ en, d, tipo = 'puno', piel, lado }) => {
  if (tipo === 'oculta') return null;
  const [x, y] = en;
  if (tipo === 'palma') {
    const ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI + 90;
    return (
      <g transform={`translate(${x} ${y}) rotate(${ang})`}>
        <path d="M-20,8 C-24,-14 -20,-30 -14,-44 M-6,6 L-6,-52 M6,6 L6,-50 M17,6 C19,-12 18,-30 16,-40" stroke={TINTA} strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d="M-20,8 C-24,-14 -20,-30 -14,-44 M-6,6 L-6,-52 M6,6 L6,-50 M17,6 C19,-12 18,-30 16,-40" stroke={piel} strokeWidth={11} strokeLinecap="round" fill="none" />
        <ellipse cx={0} cy={8} rx={25} ry={22} fill={piel} stroke={TINTA} strokeWidth={6} />
        <path d={`M${-lado * 22},10 L${-lado * 38},-12`} stroke={TINTA} strokeWidth={20} strokeLinecap="round" />
        <path d={`M${-lado * 22},10 L${-lado * 38},-12`} stroke={piel} strokeWidth={9} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {tipo === 'dedo' && <Trazo puntos={[[x, y], [x + d[0] * 46, y + d[1] * 46]]} relleno={piel} ancho={11} />}
      <circle cx={x} cy={y} r={20} fill={piel} stroke={TINTA} strokeWidth={6} />
    </g>
  );
};

const Cara: React.FC<{ e: Expresion; mirada: number; parpadeo: number; gafasSol?: boolean; gafas?: boolean }> = ({ e, mirada, parpadeo, gafasSol, gafas }) => {
  const y = CABEZA_Y + 4;
  const mx = mirada * 10;
  const ojoAlto = 15 * (1 - parpadeo) + 1.5;
  const cejas: Record<Expresion, string> = {
    neutral: 'M-58,-50 Q-40,-58 -22,-52 M22,-52 Q40,-58 58,-50',
    sonrisa: 'M-58,-52 Q-40,-64 -22,-54 M22,-54 Q40,-64 58,-52',
    triste: 'M-58,-46 Q-40,-50 -24,-62 M24,-62 Q40,-50 58,-46',
    enfado: 'M-60,-62 L-22,-46 M22,-46 L60,-62',
    miedo: 'M-58,-56 Q-40,-72 -24,-66 M24,-66 Q40,-72 58,-56',
    sorpresa: 'M-58,-64 Q-40,-80 -22,-66 M22,-66 Q40,-80 58,-64',
    serio: 'M-58,-52 L-22,-50 M22,-50 L58,-52',
    preocupado: 'M-58,-50 Q-40,-50 -24,-62 M22,-56 Q40,-62 58,-54',
  };
  const bocas: Record<Expresion, React.ReactNode> = {
    neutral: <path d="M-22,48 Q0,54 22,48" />,
    sonrisa: <path d="M-36,38 Q0,72 38,36" />,
    triste: <path d="M-28,60 Q0,40 28,60" />,
    enfado: <path d="M-24,54 L24,54" />,
    miedo: <ellipse cx={0} cy={54} rx={16} ry={20} fill={TINTA} />,
    sorpresa: <ellipse cx={0} cy={54} rx={18} ry={24} fill={TINTA} />,
    serio: <path d="M-20,52 L20,52" />,
    preocupado: <path d="M-26,56 Q-10,46 4,54 T28,50" />,
  };
  return (
    <g transform={`translate(0 ${y})`} stroke={TINTA} strokeWidth={6} strokeLinecap="round" fill="none">
      {!gafasSol && (
        <>
          <ellipse cx={-38 + mx} cy={-12} rx={9} ry={ojoAlto} fill={TINTA} stroke="none" />
          <ellipse cx={38 + mx} cy={-12} rx={9} ry={ojoAlto} fill={TINTA} stroke="none" />
          <path d={cejas[e]} />
        </>
      )}
      {gafas && !gafasSol && (
        <g strokeWidth={5}>
          <circle cx={-38} cy={-12} r={24} />
          <circle cx={38} cy={-12} r={24} />
          <path d="M-14,-14 L14,-14" />
        </g>
      )}
      {gafasSol && (
        <g>
          <path d={cejas[e]} />
          <rect x={-70} y={-34} width={58} height={40} rx={14} fill="#121214" />
          <rect x={12} y={-34} width={58} height={40} rx={14} fill="#121214" />
          <path d="M-12,-20 L12,-20" />
          <path d="M-60,-26 L-46,-26" stroke="#5B6470" strokeWidth={4} />
          <path d="M22,-26 L36,-26" stroke="#5B6470" strokeWidth={4} />
        </g>
      )}
      {bocas[e]}
    </g>
  );
};

// Pelo: cada estilo es una zona (en coordenadas de la cabeza, centro 0,0) recortada con el circulo de la cabeza,
// mas volumenes que sobresalen. Sirve para distinguir a cada persona real con rasgos sencillos.
const R_PELO = R_CABEZA + 7;
const ZONAS: Partial<Record<Pelo, string>> = {
  corto: 'M-140,-200 L140,-200 L140,-20 L104,-26 Q70,-60 30,-58 Q0,-70 -30,-60 Q-70,-62 -104,-26 L-140,-20 Z',
  raya: 'M-140,-200 L140,-200 L140,-10 L104,-14 Q96,-58 50,-66 Q0,-72 -36,-56 Q-60,-44 -80,-60 Q-96,-40 -104,-14 L-140,-10 Z',
  tupe: 'M-140,-200 L140,-200 L140,20 L106,20 L100,-30 Q60,-62 10,-60 Q-50,-62 -100,-30 L-106,20 L-140,20 Z',
  flequillo: 'M-140,-200 L140,-200 L140,60 L100,60 L96,-30 Q60,-46 20,-44 Q-20,-50 -60,-42 Q-90,-40 -96,-30 L-100,60 L-140,60 Z',
  melena: 'M-140,-200 L140,-200 L140,40 L100,40 Q96,-20 80,-50 Q40,-74 -10,-66 Q-60,-70 -84,-46 Q-98,-20 -100,40 L-140,40 Z',
  entradas: 'M-140,-80 L-70,-74 Q-84,-30 -90,10 L-140,10 Z M140,-80 L70,-74 Q84,-30 90,10 L140,10 Z',
  canoso: 'M-140,-200 L140,-200 L140,-20 L100,-30 Q60,-66 0,-66 Q-60,-66 -100,-30 L-140,-20 Z',
  afro: 'M-140,-200 L140,-200 L140,0 L104,-10 Q70,-62 0,-62 Q-70,-62 -104,-10 L-140,0 Z',
  rapado: 'M-140,-200 L140,-200 L140,-30 L104,-30 Q60,-66 0,-64 Q-60,-66 -104,-30 L-140,-30 Z',
};

const PeloDetras: React.FC<{ pelo: Pelo; color: string }> = ({ pelo, color }) => {
  const borde = { stroke: TINTA, strokeWidth: 6 };
  return (
    <g transform={`translate(0 ${CABEZA_Y})`}>
      {(pelo === 'melena' || pelo === 'flequillo') && (
        <path d={pelo === 'melena' ? 'M-116,-20 Q-130,110 -96,140 L96,140 Q130,110 116,-20 Z' : 'M-118,-10 Q-124,80 -104,104 L104,104 Q124,80 118,-10 Z'} fill={color} {...borde} />
      )}
      {pelo === 'afro' && (
        <g>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 118} cy={-30 + Math.sin(a) * 112} r={34} fill={color} {...borde} />;
          })}
          <circle cx={0} cy={-30} r={128} fill={color} />
        </g>
      )}
    </g>
  );
};

const PeloDelante: React.FC<{ pelo: Pelo; color: string; id: string }> = ({ pelo, color, id }) => {
  if (pelo === 'ninguno') return null;
  if (pelo === 'mechones')
    return (
      <g stroke={TINTA} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d={`M-14,${CABEZA_Y - R_CABEZA} Q-30,${CABEZA_Y - R_CABEZA - 36} -46,${CABEZA_Y - R_CABEZA - 40}`} />
        <path d={`M2,${CABEZA_Y - R_CABEZA} Q4,${CABEZA_Y - R_CABEZA - 40} 14,${CABEZA_Y - R_CABEZA - 50}`} />
        <path d={`M18,${CABEZA_Y - R_CABEZA + 2} Q30,${CABEZA_Y - R_CABEZA - 26} 34,${CABEZA_Y - R_CABEZA - 34}`} />
      </g>
    );
  const zona = ZONAS[pelo];
  if (!zona) return null;
  return (
    <g transform={`translate(0 ${CABEZA_Y})`}>
      <defs>
        <clipPath id={`cab-${id}`}><circle r={R_PELO} /></clipPath>
        <clipPath id={`zona-${id}`}><path d={zona} /></clipPath>
      </defs>
      <path d={zona} fill={color} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" clipPath={`url(#cab-${id})`} />
      <circle r={R_PELO} fill="none" stroke={TINTA} strokeWidth={6} clipPath={`url(#zona-${id})`} />
      {pelo === 'tupe' && (
        <>
          <path d="M-100,-46 C-118,-122 -54,-150 14,-146 C84,-142 122,-108 102,-46 Q70,-80 20,-74 Q-40,-90 -100,-46 Z" fill={color} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-60,-112 Q0,-128 70,-100" stroke="#6A6A76" strokeWidth={5} fill="none" /><path d="M-40,-120 Q10,-104 40,-74" stroke="#6A6A76" strokeWidth={4} fill="none" />
        </>
      )}
      {pelo === 'raya' && <path d="M-36,-56 Q-44,-90 -40,-108" stroke={TINTA} strokeWidth={5} fill="none" opacity={0.7} />}
      {pelo === 'melena' && <path d="M-20,-108 Q-30,-80 -40,-66" stroke={TINTA} strokeWidth={5} fill="none" opacity={0.6} />}
      {pelo === 'canoso' &&
        [-88, -64, -40, -14, 14, 40, 64, 88].map((x, i) => <circle key={i} cx={x} cy={-40 - Math.sqrt(Math.max(0, 9000 - x * x)) * 0.32} r={19} fill={color} stroke={TINTA} strokeWidth={5} />)}
      {pelo === 'rapado' && <path d={zona} fill="#000" opacity={0.08} clipPath={`url(#cab-${id})`} />}
    </g>
  );
};

const Barba: React.FC<{ tipo: 'bigote' | 'barba'; color: string }> = ({ tipo, color }) => (
  <g transform={`translate(0 ${CABEZA_Y + 4})`}>
    {tipo === 'barba' && <path d="M-92,10 Q-86,96 0,100 Q86,96 92,10 Q60,60 0,62 Q-60,60 -92,10 Z" fill={color} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />}
    <path d="M-40,34 Q-20,22 0,30 Q20,22 40,34 Q20,42 0,36 Q-20,42 -40,34 Z" fill={color} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

const Objeto: React.FC<{ tipo: NonNullable<DatosPersonaje['objeto']>; en: [number, number] }> = ({ tipo, en }) => {
  const [x, y] = en;
  const borde = { stroke: TINTA, strokeWidth: 6 };
  if (tipo === 'libreta') return <g transform={`translate(${x + 4} ${y - 8}) rotate(-8)`}><rect x={-30} y={-40} width={60} height={78} rx={4} fill="#E8E2D4" {...borde} /><path d="M-18,-20 H18 M-18,-4 H18 M-18,12 H10" stroke="#8A8478" strokeWidth={4} /></g>;
  if (tipo === 'carpeta') return <g transform={`translate(${x + 6} ${y - 10}) rotate(-6)`}><rect x={-44} y={-56} width={88} height={110} rx={4} fill="#C9A86A" {...borde} /><rect x={-20} y={-30} width={40} height={14} fill="#B3261E" /></g>;
  if (tipo === 'maletin') return <g transform={`translate(${x} ${y + 44})`}><rect x={-46} y={-30} width={92} height={64} rx={8} fill="#5A3F2C" {...borde} /><path d="M-16,-30 V-44 H16 V-30" fill="none" {...borde} /></g>;
  if (tipo === 'camara') return <g transform={`translate(${x + 10} ${y - 30})`}><rect x={-56} y={-34} width={112} height={68} rx={10} fill="#3A3D44" {...borde} /><circle cx={0} cy={0} r={22} fill="#1B1D22" {...borde} /><rect x={-40} y={-50} width={32} height={18} rx={4} fill="#3A3D44" {...borde} /></g>;
  if (tipo === 'micro') return <g transform={`translate(${x} ${y - 40}) rotate(-20)`}><rect x={-7} y={0} width={14} height={60} rx={6} fill="#3A3D44" {...borde} /><circle cx={0} cy={-6} r={18} fill="#6B7079" {...borde} /></g>;
  return <g transform={`translate(${x + 10} ${y - 6}) rotate(-70)`}><rect x={-12} y={-50} width={24} height={64} rx={6} fill="#3A3D44" {...borde} /><path d="M-18,-58 L18,-58 L12,-48 L-12,-48 Z" fill="#E8E2D4" {...borde} /></g>;
};

export const Personaje: React.FC<DatosPersonaje & { x?: number; y?: number; escala?: number; espejo?: boolean }> = (p) => {
  const {
    id, piel = PIELES.clara, pelo = 'ninguno', colorPelo = '#2E2A28', camisa = { color: '#2B2B30', manga: 'corta' }, pantalon = { color: '#4A6A94', tipo: 'largo' },
    zapatos = '#F1EEE6', expresion = 'neutral', pose = 'quieto', mirada = 0, parpadeo = 0, respiracion = 0, x = 0, y = 0, escala = 1, espejo = false,
  } = p;
  const datosPose = POSES[pose];
  const andando = p.paso !== undefined;
  const vaiven = andando ? Math.sin(p.paso!) : 0;
  const g = p.gesto;
  const habla = pose === 'hablar' || pose === 'senalar' || pose === 'alto';
  const balanceo = (b: Brazo, s: number): Brazo => {
    if (andando && b.a1 < 30) return { ...b, a1: b.a1 + 6 + s * vaiven * 14 };
    if (g === undefined || pose === 'cabeza' || pose === 'cara') return b;
    // Gesto: el brazo que habla se mueve mas; el otro apenas oscila.
    const fuerte = habla && s < 0;
    return { ...b, a1: b.a1 + Math.sin(g + (s > 0 ? 1.7 : 0)) * (fuerte ? 9 : 3), a2: b.a2 + Math.sin(g * 1.3 + (s > 0 ? 0.6 : 0)) * (fuerte ? 18 : 4) };
  };
  const izq = puntosBrazo(-1, balanceo(datosPose.izq, 1), respiracion);
  const der = puntosBrazo(1, balanceo(datosPose.der, -1), respiracion);
  const pie = (lado: number) => ({ dx: (lado < 0 ? vaiven : -vaiven) * 40, alto: andando ? Math.max(0, (lado < 0 ? 1 : -1) * Math.cos(p.paso!)) * 16 : 0 });
  const bote = andando ? Math.abs(vaiven) * 7 : 0;
  const largo = camisa.manga === 'larga' || camisa.chaqueta;
  const pierna = (lado: number): [number, number][] => [[lado * 26, CADERA_Y], [lado * 34 + pie(lado).dx, -26 - pie(lado).alto]];
  const finPantalon = pantalon.tipo === 'corto' ? 0.42 : pantalon.tipo === 'falda' ? 0 : 0.93;

  const dibujarBrazo = (b: ReturnType<typeof puntosBrazo>, def: Brazo, lado: number) => (
    <g>
      <Trazo puntos={[b.h, b.codo, b.mano]} relleno={piel} ancho={12} />
      {largo ? (
        <Trazo puntos={[b.h, b.codo, [b.mano[0] - b.d2[0] * 22, b.mano[1] - b.d2[1] * 22]]} relleno={camisa.color} ancho={34} />
      ) : (
        <Trazo puntos={[b.h, [b.h[0] + (b.codo[0] - b.h[0]) * 0.5, b.h[1] + (b.codo[1] - b.h[1]) * 0.5]]} relleno={camisa.color} ancho={44} />
      )}
      <Mano en={b.mano} d={b.d2} tipo={def.mano} piel={piel} lado={lado} />
    </g>
  );
  const manoObjeto = datosPose.der.mano === 'oculta' ? null : der.mano;

  return (
    <g transform={`translate(${x} ${y}) scale(${espejo ? -escala : escala} ${escala})`}>
      <ellipse cx={0} cy={4} rx={110} ry={16} fill="#000" opacity={0.25} />
      <g transform={`translate(0 ${-bote})`}>
      {/* Piernas y pantalon */}
      <Trazo puntos={pierna(-1)} relleno={piel} ancho={12} />
      <Trazo puntos={pierna(1)} relleno={piel} ancho={12} />
      {pantalon.tipo === 'falda' ? (
        <path d={`M-58,${CADERA_Y - 30} L58,${CADERA_Y - 30} L80,${CADERA_Y + 110} L-80,${CADERA_Y + 110} Z`} fill={pantalon.color} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
      ) : (
        <>
          {[-1, 1].map((l) => {
            const [a, b] = pierna(l);
            return <Trazo key={l} puntos={[[a[0], a[1] - 20], [a[0] + (b[0] - a[0]) * finPantalon, a[1] + (b[1] - a[1]) * finPantalon]]} relleno={pantalon.color} ancho={50} />;
          })}
          <path d={`M-60,${CADERA_Y - 36} L60,${CADERA_Y - 36} L64,${CADERA_Y + 12} L-64,${CADERA_Y + 12} Z`} fill={pantalon.color} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M0,${CADERA_Y - 30} L0,${CADERA_Y + 30}`} stroke={TINTA} strokeWidth={4} opacity={0.6} />
        </>
      )}
      {/* Zapatos */}
      {[-1, 1].map((l) => (
        <path key={l} transform={`translate(${pie(l).dx} ${-pie(l).alto + bote})`} d={`M${l * 12},-30 Q${l * 12},-4 ${l * 20},0 L${l * 78},0 Q${l * 84},-18 ${l * 58},-28 Q${l * 36},-36 ${l * 12},-30 Z`} fill={zapatos} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
      ))}
      {datosPose.detrasCabeza && (
        <>
          {dibujarBrazo(izq, datosPose.izq, -1)}
          {dibujarBrazo(der, datosPose.der, 1)}
        </>
      )}
      {/* Torso */}
      <path
        d={`M-62,${HOMBRO_Y - 10 - respiracion * 4} Q0,${HOMBRO_Y - 22} 62,${HOMBRO_Y - 10 - respiracion * 4} L70,${CADERA_Y - 4} Q0,${CADERA_Y + 14} -70,${CADERA_Y - 4} Z`}
        fill={camisa.color}
        stroke={TINTA}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {camisa.chaqueta && (
        <g stroke={TINTA} strokeWidth={5} fill="none">
          <path d={`M-20,${HOMBRO_Y - 14} L-8,${HOMBRO_Y + 70} L0,${CADERA_Y}`} />
          <path d={`M20,${HOMBRO_Y - 14} L8,${HOMBRO_Y + 70}`} />
          <path d={`M-20,${HOMBRO_Y - 14} L0,${HOMBRO_Y + 40} L20,${HOMBRO_Y - 14}`} fill="#E8E2D4" />
        </g>
      )}
      {p.corbata && <path d={`M0,${HOMBRO_Y - 4} L-10,${HOMBRO_Y + 14} L-6,${HOMBRO_Y + 96} L0,${HOMBRO_Y + 110} L6,${HOMBRO_Y + 96} L10,${HOMBRO_Y + 14} Z`} fill={p.corbata} stroke={TINTA} strokeWidth={4} />}
      {/* Cuello */}
      <Trazo puntos={[[0, HOMBRO_Y - 14], [0, CABEZA_Y + R_CABEZA - 6]]} relleno={piel} ancho={14} />
      {p.cadena && <path d={`M-34,${HOMBRO_Y - 8} Q0,${HOMBRO_Y + 70} 34,${HOMBRO_Y - 8}`} stroke="#D9B44A" strokeWidth={7} fill="none" strokeDasharray="10 4" />}
      {p.bufanda && <path d={`M-48,${HOMBRO_Y - 22} Q0,${HOMBRO_Y + 10} 48,${HOMBRO_Y - 22} L44,${HOMBRO_Y - 2} Q0,${HOMBRO_Y + 30} -44,${HOMBRO_Y - 2} Z M18,${HOMBRO_Y + 4} L32,${HOMBRO_Y + 80} L12,${HOMBRO_Y + 78} Z`} fill={p.bufanda} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />}
      {!datosPose.detrasCabeza && dibujarBrazo(izq, datosPose.izq, -1)}
      {!datosPose.detrasCabeza && !datosPose.delanteCara && dibujarBrazo(der, datosPose.der, 1)}
      {p.objeto && manoObjeto && !datosPose.delanteCara && <Objeto tipo={p.objeto} en={manoObjeto} />}
      {/* Cabeza */}
      <g transform={`rotate(${p.cabeceo ?? 0} 0 ${CABEZA_Y + R_CABEZA})`}>
      <PeloDetras pelo={pelo} color={colorPelo} />
      <circle cx={0} cy={CABEZA_Y} r={R_CABEZA} fill={piel} stroke={TINTA} strokeWidth={7} />
      <Cara e={expresion} mirada={mirada} parpadeo={parpadeo} gafasSol={p.gafasSol} gafas={p.gafas} />
      <PeloDelante pelo={pelo} color={colorPelo} id={id} />
      {p.barba && <Barba tipo={p.barba} color={colorPelo} />}
      {p.bandana && (
        <g>
          <path d={`M${-R_CABEZA + 2},${CABEZA_Y - 52} Q0,${CABEZA_Y - 78} ${R_CABEZA - 2},${CABEZA_Y - 52} L${R_CABEZA - 6},${CABEZA_Y - 28} Q0,${CABEZA_Y - 52} ${-R_CABEZA + 6},${CABEZA_Y - 28} Z`} fill={p.bandana} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M${R_CABEZA - 10},${CABEZA_Y - 44} l34,-18 l6,22 Z M${R_CABEZA - 10},${CABEZA_Y - 40} l30,14 l-12,16 Z`} fill={p.bandana} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      </g>
      {datosPose.delanteCara && dibujarBrazo(der, datosPose.der, 1)}
      </g>
    </g>
  );
};

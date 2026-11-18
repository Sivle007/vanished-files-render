import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FUENTE_MARCA, FUENTE_TEXTO, FUENTE_TITULO, neon } from './estilo';

// ---------- Tipos de escena (lo que escriben los guiones en GTa6/videos/*.json) ----------
type Lado = { titulo: string; precio?: string; items: string[] };
export type Escena =
  | { tipo: 'portada'; titulo: string; sub: string }
  | { tipo: 'dato'; cifra: string; etiqueta: string; nota?: string }
  | { tipo: 'lista'; titulo: string; items: string[] }
  | { tipo: 'relojes'; titulo: string; filas: { lugar: string; hora: string; nota?: string }[] }
  | { tipo: 'consola'; titulo: string; etiqueta: string; progreso: number }
  | { tipo: 'almacen'; titulo: string; juego: number; consolas: { nombre: string; gb: number }[] }
  | { tipo: 'mapa'; titulo: string; foco: string | null }
  | { tipo: 'comparar'; izq: Lado; der: Lado }
  | { tipo: 'sello'; texto: string; color: 'verde' | 'rojo' | 'ambar'; frase: string }
  | { tipo: 'pareja'; titulo: string; sub: string; quien: 'ambos' | 'jason' | 'lucia' }
  | { tipo: 'linea'; hitos: { fecha: string; texto: string }[]; activo?: number }
  | { tipo: 'pregunta'; texto: string }
  | { tipo: 'cita'; texto: string; fuente: string }
  | { tipo: 'alerta'; texto: string; sub: string }
  | { tipo: 'flecha'; de: string; a: string; etiqueta: string }
  | { tipo: 'cierre'; texto: string };

// ---------- Ayudas de animación ----------
const useEntrada = (retraso = 0, rigidez = 120) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - retraso, fps, config: { damping: 14, stiffness: rigidez, mass: 0.8 } });
};

const Aparece: React.FC<{ retraso?: number; desde?: 'abajo' | 'izq' | 'der' | 'zoom'; children: React.ReactNode; style?: React.CSSProperties }> = ({ retraso = 0, desde = 'abajo', children, style }) => {
  const s = useEntrada(retraso);
  const t =
    desde === 'abajo' ? `translateY(${(1 - s) * 60}px)` : desde === 'izq' ? `translateX(${(s - 1) * 120}px)` : desde === 'der' ? `translateX(${(1 - s) * 120}px)` : `scale(${0.6 + s * 0.4})`;
  return <div style={{ opacity: Math.min(1, s * 1.4), transform: t, ...style }}>{children}</div>;
};

// Parpadeo de tubo de neón al encenderse.
const useParpadeo = (retraso = 0) => {
  const f = useCurrentFrame() - retraso;
  if (f < 0) return 0;
  if (f < 14) return [1, 0.2, 1, 0.1, 0.9, 1, 0.3, 1, 1, 0.6, 1, 1, 1, 1][f];
  return 0.92 + 0.08 * Math.sin(f / 5);
};

const Panel: React.FC<{ children: React.ReactNode; ancho?: number; color?: string; style?: React.CSSProperties }> = ({ children, ancho = 1300, color = C.cian, style }) => (
  <div style={{
    width: ancho, padding: '44px 60px', borderRadius: 28, background: 'rgba(12,6,34,0.78)', border: `3px solid ${color}`,
    boxShadow: `0 0 24px ${color}88, inset 0 0 30px ${color}22`, ...style,
  }}>
    {children}
  </div>
);

const Titular: React.FC<{ texto: string; color?: string; tam?: number; retraso?: number }> = ({ texto, color = C.rosa, tam = 92, retraso = 0 }) => {
  const o = useParpadeo(retraso);
  return (
    <div style={{ fontFamily: FUENTE_TITULO, fontSize: tam, color: C.blanco, letterSpacing: 2, textAlign: 'center', lineHeight: 1.02, opacity: o, textShadow: neon(color, 1.1), textTransform: 'uppercase' }}>
      {texto}
    </div>
  );
};

const Centro: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap, padding: '80px 120px' }}>{children}</AbsoluteFill>
);

const texto = (tam: number, color = C.blanco, peso = 700): React.CSSProperties => ({ fontFamily: FUENTE_TEXTO, fontSize: tam, color, fontWeight: peso, textAlign: 'center' });

// Reparte la aparición de n elementos en el primer 65 % del segmento.
const reparto = (n: number, duracion: number, i: number) => Math.round(10 + (i * (duracion * 0.65)) / Math.max(1, n));

// ---------- Escenas ----------
const Portada: React.FC<{ e: Extract<Escena, { tipo: 'portada' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const s = useEntrada(0, 90);
  return (
    <Centro gap={26}>
      <div style={{ transform: `scale(${0.7 + s * 0.3}) rotate(${-2 + Math.sin(f / 40) * 0.6}deg)` }}>
        <Titular texto={e.titulo} tam={150} />
      </div>
      <Aparece retraso={18}>
        <div style={{ ...texto(48, C.cian, 900), letterSpacing: 6, textTransform: 'uppercase', textShadow: `0 3px 0 #0b0820, 0 0 12px #0b0820, ${neon(C.cian, 0.4)}`, background: 'rgba(11,8,32,0.55)', padding: '6px 22px', borderRadius: 12 }}>{e.sub}</div>
      </Aparece>
    </Centro>
  );
};

const numeroAnimado = (cifra: string, p: number) => {
  const m = cifra.match(/^([^\d]*)(\d+)(.*)$/s);
  if (!m || cifra.includes(',') || cifra.includes('.') || cifra.includes('→')) return cifra;
  return `${m[1]}${Math.round(Number(m[2]) * p)}${m[3]}`;
};

const Dato: React.FC<{ e: Extract<Escena, { tipo: 'dato' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [4, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  const s = useEntrada(0, 140);
  return (
    <Centro gap={22}>
      <div style={{ transform: `scale(${0.5 + s * 0.5})`, fontFamily: FUENTE_TITULO, fontSize: 300, lineHeight: 1, color: C.blanco, textShadow: neon(C.rosa, 1.4), opacity: useParpadeo(0), whiteSpace: 'nowrap' }}>
        {numeroAnimado(e.cifra, p)}
      </div>
      <Aparece retraso={16}>
        <div style={{ ...texto(60, C.blanco, 900), textShadow: '0 4px 18px #000' }}>{e.etiqueta}</div>
      </Aparece>
      {e.nota && (
        <Aparece retraso={30}>
          <div style={{ ...texto(38, C.noche, 900), background: C.cian, padding: '10px 28px', borderRadius: 14, boxShadow: `0 0 26px ${C.cian}` }}>{e.nota}</div>
        </Aparece>
      )}
    </Centro>
  );
};

const Lista: React.FC<{ e: Extract<Escena, { tipo: 'lista' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  return (
    <Centro gap={34}>
      <Titular texto={e.titulo} tam={96} />
      <Panel ancho={1350}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {e.items.map((it, i) => {
            const r = reparto(e.items.length, duracion, i);
            const activo = f >= r && (i === e.items.length - 1 || f < reparto(e.items.length, duracion, i + 1) + 20);
            return (
              <Aparece key={i} retraso={r} desde="izq">
                <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: activo ? C.rosa : 'transparent', border: `3px solid ${C.rosa}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...texto(36, C.blanco, 900), boxShadow: activo ? neon(C.rosa, 0.4) : 'none' }}>
                    {i + 1}
                  </div>
                  <div style={{ ...texto(52, activo ? C.blanco : '#d9c8f0', 800), textAlign: 'left' }}>{it}</div>
                </div>
              </Aparece>
            );
          })}
        </div>
      </Panel>
    </Centro>
  );
};

const Flap: React.FC<{ valor: string; retraso: number }> = ({ valor, retraso }) => {
  const f = useCurrentFrame() - retraso;
  const chars = valor.split('');
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {chars.map((ch, i) => {
        const giro = f < 8 + i * 3;
        const mostrado = ch === ':' ? ':' : giro ? String((Math.max(0, f) * 7 + i * 3) % 10) : ch;
        return (
          <div key={i} style={{ width: ch === ':' ? 26 : 70, height: 100, background: ch === ':' ? 'transparent' : '#1a1036', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FUENTE_TITULO, fontSize: 80, color: C.amarillo, textShadow: neon(C.naranja, 0.5), borderBottom: ch === ':' ? 'none' : '2px solid #000' }}>
            {mostrado}
          </div>
        );
      })}
    </div>
  );
};

const Relojes: React.FC<{ e: Extract<Escena, { tipo: 'relojes' }>; duracion: number }> = ({ e, duracion }) => (
  <Centro gap={34}>
    <Titular texto={e.titulo} tam={96} color={C.cian} />
    <Panel ancho={1500} color={C.naranja}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {e.filas.map((fila, i) => {
          const r = reparto(e.filas.length, duracion, i);
          return (
            <Aparece key={i} retraso={r} desde="der">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ ...texto(54, C.blanco, 900), textAlign: 'left' }}>{fila.lugar}</div>
                  {fila.nota && <div style={{ ...texto(34, C.cian, 700), textAlign: 'left' }}>{fila.nota}</div>}
                </div>
                <Flap valor={fila.hora} retraso={r} />
              </div>
            </Aparece>
          );
        })}
      </div>
    </Panel>
  </Centro>
);

const Consola: React.FC<{ e: Extract<Escena, { tipo: 'consola' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [10, duracion * 0.9], [0, e.progreso], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Centro gap={20}>
      <svg width={1100} height={700} viewBox="0 0 1100 700">
        <rect x={150} y={40} width={800} height={460} rx={26} fill="#0d0826" stroke={C.cian} strokeWidth={6} />
        <rect x={180} y={70} width={740} height={400} rx={12} fill="#1a0f40" />
        <text x={550} y={200} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={84} fill={C.blanco}>{e.titulo}</text>
        <rect x={250} y={260} width={600} height={46} rx={23} fill="#2b1f5c" />
        <rect x={250} y={260} width={600 * p} height={46} rx={23} fill={C.rosa} />
        <text x={550} y={370} textAnchor="middle" fontFamily={FUENTE_TEXTO} fontWeight={900} fontSize={52} fill={C.amarillo}>{Math.round(p * 100)} %</text>
        <text x={550} y={430} textAnchor="middle" fontFamily={FUENTE_TEXTO} fontWeight={700} fontSize={34} fill={C.cian}>{e.etiqueta}</text>
        <rect x={500} y={500} width={100} height={60} fill="#0d0826" />
        <rect x={380} y={555} width={340} height={20} rx={10} fill={C.cian} opacity={0.8} />
        <rect x={830} y={480} width={90} height={190} rx={18} fill="#efe8ff" />
        <rect x={845} y={500} width={8} height={150} rx={4} fill={Math.floor(f / 15) % 2 ? C.cian : C.rosa} />
        <rect x={170} y={560} width={140} height={90} rx={40} fill="#efe8ff" />
        <circle cx={210} cy={600} r={12} fill="#1a0f40" />
        <circle cx={270} cy={600} r={12} fill="#1a0f40" />
      </svg>
    </Centro>
  );
};

const Almacen: React.FC<{ e: Extract<Escena, { tipo: 'almacen' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const max = Math.max(...e.consolas.map((c) => c.gb));
  return (
    <Centro gap={30}>
      <Titular texto={e.titulo} tam={84} color={C.cian} />
      <Panel ancho={1640}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {e.consolas.map((c, i) => {
            const r = reparto(e.consolas.length, duracion, i);
            const p = interpolate(f, [r, r + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const ancho = (c.gb / max) * 860;
            const juego = (e.juego / max) * 860 * p;
            const pct = Math.round((e.juego / c.gb) * 100);
            return (
              <Aparece key={i} retraso={r} desde="izq">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ ...texto(38, C.blanco, 800), width: 340, textAlign: 'left' }}>{c.nombre}</div>
                  <div style={{ position: 'relative', width: 1100, height: 56 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: ancho, height: 56, borderRadius: 12, background: '#2b1f5c', border: `2px solid ${C.cian}` }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, width: juego, height: 56, borderRadius: 12, background: C.rosa, boxShadow: `0 0 18px ${C.rosa}` }} />
                    <div style={{ position: 'absolute', left: ancho + 16, top: 4, ...texto(34, C.amarillo, 900), whiteSpace: 'nowrap' }}>{c.gb} GB · {pct}%</div>
                  </div>
                </div>
              </Aparece>
            );
          })}
          <div style={{ ...texto(30, '#d9c8f0', 600) }}>Rosa: lo que ocupa GTA 6 ({e.juego} GB) · cifras aproximadas</div>
        </div>
      </Panel>
    </Centro>
  );
};

// Mapa ilustrado y APROXIMADO de Leonida, redibujado a mano en el estilo del canal tomando como guía
// la reconstrucción hecha por fans a partir de los tráileres. No es el mapa oficial.
// Coordenadas tomadas sobre la referencia (472x642) y pasadas al lienzo del mapa (1100x1040).
const P = (x: number, y: number) => [167 + x * 1.62, y * 1.62] as const;
const trazo = (pts: number[][]) => {
  const q = pts.map(([x, y]) => P(x, y));
  // Curva suave que pasa por el punto medio de cada lado.
  const m = (a: readonly number[], b: readonly number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M ${m(q[q.length - 1], q[0]).join(' ')}`;
  q.forEach((p, i) => { d += ` Q ${p.join(' ')} ${m(p, q[(i + 1) % q.length]).join(' ')}`; });
  return d + ' Z';
};
const COSTA = trazo([[215, 12], [245, 18], [275, 40], [305, 70], [335, 105], [360, 140], [380, 180], [395, 215], [410, 250], [418, 290], [420, 330], [415, 370], [405, 410], [385, 445], [360, 475], [330, 500], [305, 525], [285, 548], [265, 562], [245, 548], [225, 520], [205, 495], [185, 465], [168, 430], [150, 395], [128, 362], [110, 328], [98, 296], [90, 262], [86, 225], [90, 185], [103, 140], [123, 95], [150, 58], [180, 28]]);
const BARRERA = trazo([[430, 232], [440, 236], [452, 300], [452, 360], [446, 412], [436, 410], [440, 350], [438, 290]]);
const CAYO_GRANDE = trazo([[66, 578], [100, 556], [160, 560], [212, 578], [208, 606], [150, 624], [88, 616]]);
const ISLAS: [number, number, number, number][] = [[60, 190, 9, 20], [44, 252, 7, 22], [78, 128, 10, 14], [118, 62, 12, 9], [232, 574, 10, 6], [254, 566, 9, 5], [274, 556, 8, 5], [292, 548, 7, 4], [470 - 20, 455, 6, 10]];
const LAGOS: [number, number, number, number][] = [[330, 165, 26, 30], [210, 372, 22, 12]];

export const ZONAS: Record<string, { nombre: string; x: number; y: number; color: string }> = {
  kalaga: { nombre: 'Mount Kalaga', x: P(250, 92)[0], y: P(250, 92)[1], color: C.verde },
  ambrosia: { nombre: 'Ambrosia', x: P(318, 200)[0], y: P(318, 200)[1], color: C.amarillo },
  port: { nombre: 'Port Gellhorn', x: P(118, 285)[0], y: P(118, 285)[1], color: C.naranja },
  grass: { nombre: 'Grassrivers', x: P(250, 318)[0], y: P(250, 318)[1], color: '#7dffb0' },
  vice: { nombre: 'Vice City', x: P(365, 335)[0], y: P(365, 335)[1], color: C.rosa },
  keys: { nombre: 'Leonida Keys', x: P(150, 588)[0], y: P(150, 588)[1], color: C.cian },
};

export const MapaLeonida: React.FC<{ foco: string | null; escala?: number; fijo?: boolean }> = ({ foco, escala = 1, fijo }) => {
  const actual = useCurrentFrame();
  const f = fijo ? 900 : actual;
  const dibujo = interpolate(f, [0, 40], [0, 1], { extrapolateRight: 'clamp' });
  const z = foco ? ZONAS[foco] : null;
  const zoomS = spring({ frame: f - 8, fps: 30, config: { damping: 18 } });
  const zoom = z ? 1 + zoomS * 0.5 : 1;
  const tx = z ? (550 - z.x) * zoomS * 0.5 : 0;
  const ty = z ? (520 - z.y) * zoomS * 0.5 : 0;
  return (
    <svg width={1000 * escala} height={1040 * escala} viewBox="0 0 1100 1040" style={{ overflow: 'hidden', borderRadius: 30, border: `3px solid ${C.cian}55` }}>
      <defs>
        <pattern id="olas" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q 10 12 20 20 T 40 20" stroke={C.cian} strokeOpacity={0.18} fill="none" strokeWidth={2} />
        </pattern>
      </defs>
      <rect width={1100} height={1040} fill="#0a0626" />
      <rect width={1100} height={1040} fill="url(#olas)" />
      <g transform={`translate(${550 + tx} ${520 + ty}) scale(${zoom}) translate(-550 -520)`}>
        <path d={COSTA} fill="#1c1048" stroke={C.cian} strokeWidth={5} strokeDasharray={5000} strokeDashoffset={5000 * (1 - dibujo)} />
        {[BARRERA, CAYO_GRANDE].map((d, i) => <path key={i} d={d} fill="#1c1048" stroke={C.cian} strokeWidth={3} opacity={dibujo} />)}
        {ISLAS.map(([x, y, rx, ry], i) => {
          const [cx, cy] = P(x, y);
          return <ellipse key={i} cx={cx} cy={cy} rx={rx * 1.62} ry={ry * 1.62} fill="#1c1048" stroke={C.cian} strokeWidth={3} opacity={dibujo} />;
        })}
        {LAGOS.map(([x, y, rx, ry], i) => {
          const [cx, cy] = P(x, y);
          return <ellipse key={i} cx={cx} cy={cy} rx={rx * 1.62} ry={ry * 1.62} fill="#13306a" stroke={C.cian} strokeWidth={2} opacity={0.8 * dibujo} />;
        })}
        <path d={`M ${P(212, 590).join(' ')} Q ${P(250, 570).join(' ')} ${P(292, 548).join(' ')}`} stroke={C.cian} strokeWidth={2} strokeDasharray="8 8" fill="none" opacity={0.6 * dibujo} />
        {Object.entries(ZONAS).map(([id, zz], i) => {
          const activo = id === foco;
          const s = spring({ frame: f - 20 - i * 5, fps: 30, config: { damping: 12 } });
          const pulso = activo ? 1 + 0.25 * Math.abs(Math.sin(f / 8)) : 1;
          return (
            <g key={id} opacity={foco && !activo ? 0.35 : 1} transform={`translate(${zz.x} ${zz.y}) scale(${s / zoom})`}>
              <circle r={activo ? 26 * pulso : 16} fill={zz.color} opacity={0.35} />
              <circle r={activo ? 13 : 9} fill={zz.color} />
              <text y={-30} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={activo ? 56 : 38} fill={C.blanco} stroke="#0b0820" strokeWidth={8} paintOrder="stroke">{zz.nombre}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const Mapa: React.FC<{ e: Extract<Escena, { tipo: 'mapa' }> }> = ({ e }) => (
  <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60 }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,4,26,0.6)' }} />
    <div style={{ position: 'relative' }}><MapaLeonida foco={e.foco} escala={0.9} /></div>
    <div style={{ position: 'relative', width: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Titular texto={e.titulo} tam={108} color={e.foco ? ZONAS[e.foco].color : C.rosa} />
      <Aparece retraso={20}>
        <div style={{ ...texto(30, '#d9c8f0', 600) }}>Redibujado a partir del mapa de los fans · aproximado, no oficial</div>
      </Aparece>
    </div>
  </AbsoluteFill>
);

const Columna: React.FC<{ l: Lado; color: string; retraso: number }> = ({ l, color, retraso }) => (
  <Aparece retraso={retraso} desde={retraso ? 'der' : 'izq'}>
    <Panel ancho={720} color={color} style={{ minHeight: 560 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 84, color: C.blanco, textShadow: neon(color) }}>{l.titulo}</div>
        {l.precio ? <div style={{ fontFamily: FUENTE_TITULO, fontSize: 110, color: C.amarillo, textShadow: neon(C.naranja, 0.6) }}>{l.precio}</div> : null}
        {l.items.map((it, i) => (
          <Aparece key={i} retraso={retraso + 14 + i * 9}>
            <div style={{ ...texto(42, C.blanco, 800) }}>• {it}</div>
          </Aparece>
        ))}
      </div>
    </Panel>
  </Aparece>
);

const Comparar: React.FC<{ e: Extract<Escena, { tipo: 'comparar' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const vs = useParpadeo(12);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 70 }}>
      <Columna l={e.izq} color={C.cian} retraso={0} />
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 120, color: C.blanco, textShadow: neon(C.rosa), opacity: vs, transform: `scale(${1 + 0.04 * Math.sin(f / 6)})` }}>VS</div>
      <Columna l={e.der} color={C.rosa} retraso={Math.min(30, Math.round(duracion * 0.25))} />
    </AbsoluteFill>
  );
};

const Sello: React.FC<{ e: Extract<Escena, { tipo: 'sello' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const col = e.color === 'verde' ? C.verde : e.color === 'rojo' ? C.rojo : C.amarillo;
  const s = spring({ frame: f - 4, fps: 30, config: { damping: 9, stiffness: 200 } });
  const escala = interpolate(s, [0, 1], [2.6, 1]);
  const temblor = f > 4 && f < 14 ? Math.sin(f * 3) * 6 : 0;
  const tam = e.texto.length > 14 ? 120 : 170;
  return (
    <Centro gap={50}>
      <div style={{ transform: `translate(${temblor}px, 0) scale(${escala}) rotate(-7deg)`, opacity: Math.min(1, s * 2), border: `12px solid ${col}`, borderRadius: 24, padding: '20px 60px', fontFamily: FUENTE_TITULO, fontSize: tam, color: col, textShadow: neon(col, 0.8), boxShadow: `0 0 40px ${col}88, inset 0 0 40px ${col}55`, background: 'rgba(10,5,30,0.6)', whiteSpace: 'nowrap' }}>
        {e.texto}
      </div>
      <Aparece retraso={22}>
        <div style={{ ...texto(56, C.blanco, 900), textShadow: '0 4px 20px #000', maxWidth: 1500 }}>{e.frase}</div>
      </Aparece>
    </Centro>
  );
};

// Jason y Lucía dibujados por el canal en estilo cartoon plano (fan art propio, no arte oficial).
// Se reconocen por la ropa: él camiseta de tirantes blanca y cargo verde; ella top rosa de manga larga y vaqueros morados.
export const PersonajeGTA: React.FC<{ quien: 'jason' | 'lucia'; x: number; brillo: string }> = ({ quien, x, brillo }) => {
  const f = useCurrentFrame();
  const resp = Math.sin(f / 18) * 3;
  const borde = { stroke: '#0b0820', strokeWidth: 5, strokeLinejoin: 'round' as const };
  if (quien === 'jason') {
    const piel = '#c98d6b';
    return (
      <g transform={`translate(${x} 0)`} style={{ filter: `drop-shadow(0 0 14px ${brillo})` }}>
        <path d="M-72 -322 L -8 -322 L -14 -18 L -66 -18 Z" fill="#56622f" {...borde} />
        <path d="M8 -322 L 72 -322 L 66 -18 L 14 -18 Z" fill="#56622f" {...borde} />
        <rect x={-66} y={-210} width={36} height={46} rx={6} fill="#47512a" {...borde} strokeWidth={3} />
        <rect x={30} y={-210} width={36} height={46} rx={6} fill="#47512a" {...borde} strokeWidth={3} />
        <rect x={-80} y={-26} width={70} height={26} rx={10} fill="#2a1e14" {...borde} />
        <rect x={10} y={-26} width={70} height={26} rx={10} fill="#2a1e14" {...borde} />
        <rect x={-74} y={-336} width={148} height={18} rx={4} fill="#2a1e14" {...borde} strokeWidth={3} />
        <g transform={`translate(0 ${resp})`}>
          <path d="M-88 -548 Q -126 -520 -116 -430 L -108 -340 L -80 -340 L -84 -432 L -72 -500 Z" fill={piel} {...borde} />
          <path d="M88 -548 Q 126 -520 116 -430 L 108 -340 L 80 -340 L 84 -432 L 72 -500 Z" fill={piel} {...borde} />
          <path d="M-86 -548 Q -40 -566 -24 -560 Q 0 -520 24 -560 Q 40 -566 86 -548 L 74 -330 L -74 -330 Z" fill="#f1ede4" {...borde} />
          <path d="M-22 -556 Q 0 -500 22 -556" fill="none" stroke="#d9c27a" strokeWidth={4} />
          <rect x={-20} y={-596} width={40} height={44} fill={piel} {...borde} strokeWidth={4} />
          <ellipse cx={0} cy={-640} rx={50} ry={60} fill={piel} {...borde} />
          <path d="M-46 -632 Q -42 -580 0 -578 Q 42 -580 46 -632 Q 30 -604 0 -602 Q -30 -604 -46 -632 Z" fill="#3b2a20" opacity={0.6} />
          <path d="M-52 -650 Q -56 -712 0 -712 Q 56 -712 52 -650 Q 36 -684 0 -682 Q -36 -684 -52 -650 Z" fill="#2b1d14" {...borde} strokeWidth={4} />
          <rect x={-26} y={-650} width={12} height={8} rx={3} fill="#1a1010" />
          <rect x={14} y={-650} width={12} height={8} rx={3} fill="#1a1010" />
          <path d="M-32 -664 L -12 -660 M 12 -660 L 32 -664" stroke="#1a1010" strokeWidth={6} strokeLinecap="round" />
          <path d="M-12 -606 Q 0 -602 12 -606" stroke="#5a3324" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  }
  const piel = '#a9704e';
  return (
    <g transform={`translate(${x} 0)`} style={{ filter: `drop-shadow(0 0 14px ${brillo})` }}>
      <path d="M-56 -300 L -6 -300 L -12 -22 L -50 -22 Z" fill="#5b4b9e" {...borde} />
      <path d="M6 -300 L 56 -300 L 50 -22 L 12 -22 Z" fill="#5b4b9e" {...borde} />
      {[[-34, -250, 14, 22], [-28, -150, 10, 18], [-36, -80, 12, 16], [30, -230, 12, 20], [34, -120, 14, 18], [26, -60, 10, 14]].map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? '#8a7bd1' : '#3e2f78'} />
      ))}
      <ellipse cx={-34} cy={-14} rx={34} ry={16} fill="#f6f2ff" {...borde} strokeWidth={4} />
      <ellipse cx={34} cy={-14} rx={34} ry={16} fill="#f6f2ff" {...borde} strokeWidth={4} />
      <g transform={`translate(0 ${resp})`}>
        <path d="M-60 -340 L 60 -340 L 58 -296 L -58 -296 Z" fill={piel} {...borde} strokeWidth={4} />
        <path d="M-72 -508 Q -104 -484 -100 -404 L -94 -326 L -72 -326 L -74 -412 L -60 -470 Z" fill="#e2468f" {...borde} />
        <path d="M72 -508 Q 104 -484 100 -404 L 94 -326 L 72 -326 L 74 -412 L 60 -470 Z" fill="#e2468f" {...borde} />
        <circle cx={-84} cy={-316} r={14} fill={piel} {...borde} strokeWidth={3} />
        <circle cx={84} cy={-316} r={14} fill={piel} {...borde} strokeWidth={3} />
        <path d="M-72 -510 Q 0 -526 72 -510 L 60 -340 L -60 -340 Z" fill="#e2468f" {...borde} />
        <rect x={-16} y={-548} width={32} height={42} fill={piel} {...borde} strokeWidth={4} />
        <ellipse cx={0} cy={-596} rx={60} ry={64} fill="#2a1a14" />
        {[[0, -672, 26], [-22, -690, 18], [22, -690, 18], [0, -706, 16], [-34, -668, 14], [34, -668, 14]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#2a1a14" />)}
        <ellipse cx={0} cy={-588} rx={42} ry={52} fill={piel} {...borde} />
        <path d="M-44 -600 Q -46 -650 0 -652 Q 46 -650 44 -600 Q 30 -630 0 -628 Q -30 -630 -44 -600 Z" fill="#2a1a14" />
        <path d="M-42 -604 Q -60 -560 -48 -520" stroke="#2a1a14" strokeWidth={10} fill="none" strokeLinecap="round" />
        <rect x={-22} y={-598} width={11} height={8} rx={3} fill="#1a1010" />
        <rect x={11} y={-598} width={11} height={8} rx={3} fill="#1a1010" />
        <path d="M-28 -610 L -10 -608 M 10 -608 L 28 -610" stroke="#1a1010" strokeWidth={5} strokeLinecap="round" />
        <path d="M-10 -556 Q 0 -552 10 -556" stroke="#8a2e48" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

const Pareja: React.FC<{ e: Extract<Escena, { tipo: 'pareja' }> }> = ({ e }) => {
  const sJ = useEntrada(0);
  const sL = useEntrada(8);
  const jason = e.quien !== 'lucia';
  const lucia = e.quien !== 'jason';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <svg width={1000} height={740} viewBox="-500 -730 1000 740" style={{ position: 'absolute', bottom: 0 }}>
        <circle cx={0} cy={-330} r={330} fill={C.rosa} opacity={0.14} />
        {jason && <g opacity={sJ} transform={`translate(${(1 - sJ) * -200} 0)`}><PersonajeGTA quien="jason" x={lucia ? -130 : 0} brillo={C.cian} /></g>}
        {lucia && <g opacity={sL} transform={`translate(${(1 - sL) * 200} 0)`}><PersonajeGTA quien="lucia" x={jason ? 130 : 0} brillo={C.rosa} /></g>}
      </svg>
      <div style={{ position: 'absolute', top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Titular texto={e.titulo} tam={120} color={e.quien === 'jason' ? C.cian : C.rosa} />
        <Aparece retraso={16}>
          <div style={{ ...texto(46, C.amarillo, 900), textShadow: '0 4px 18px #000' }}>{e.sub}</div>
        </Aparece>
      </div>
    </AbsoluteFill>
  );
};

const Linea: React.FC<{ e: Extract<Escena, { tipo: 'linea' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const n = e.hitos.length;
  const ancho = 1500;
  const paso = ancho / Math.max(1, n - 1);
  const progreso = interpolate(f, [5, duracion * 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const actual = e.activo ?? Math.min(n - 1, Math.floor(progreso * n));
  const relleno = e.activo !== undefined ? interpolate(f, [5, 35], [0, actual * paso], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) : progreso * ancho;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: ancho, height: 520 }}>
        <div style={{ position: 'absolute', left: 0, top: 250, width: ancho, height: 8, background: '#3a2a70', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 0, top: 250, width: relleno, height: 8, background: C.rosa, borderRadius: 4, boxShadow: `0 0 18px ${C.rosa}` }} />
        {e.hitos.map((h, i) => {
          const r = e.activo !== undefined ? i * 6 : reparto(n, duracion, i);
          const on = i === actual;
          const pasado = i <= actual;
          const arriba = i % 2 === 0;
          return (
            <div key={i} style={{ position: 'absolute', left: i * paso, top: 254, transform: 'translate(-50%, -50%)' }}>
              <Aparece retraso={r} desde="zoom">
                <div style={{ width: on ? 54 : 36, height: on ? 54 : 36, borderRadius: '50%', background: pasado ? C.rosa : '#3a2a70', border: `4px solid ${C.blanco}`, boxShadow: on ? neon(C.rosa, 0.8) : 'none' }} />
              </Aparece>
              <div style={{ position: 'absolute', left: '50%', top: arriba ? -200 : 70, transform: 'translateX(-50%)', width: 440 }}>
                <Aparece retraso={r + 6}>
                  <div style={{ fontFamily: FUENTE_TITULO, fontSize: on ? 72 : 56, color: on ? C.amarillo : C.blanco, textAlign: 'center', textShadow: on ? neon(C.naranja, 0.6) : '0 3px 10px #000' }}>{h.fecha}</div>
                  <div style={{ ...texto(on ? 36 : 30, on ? C.blanco : '#d9c8f0', 800), textShadow: '0 3px 12px #000' }}>{h.texto}</div>
                </Aparece>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Pregunta: React.FC<{ e: Extract<Escena, { tipo: 'pregunta' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  return (
    <Centro gap={10}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 420, lineHeight: 1, color: C.blanco, textShadow: neon(C.cian, 1.4), opacity: useParpadeo(0), transform: `rotate(${Math.sin(f / 20) * 5}deg)` }}>?</div>
      <Titular texto={e.texto} tam={100} retraso={10} />
    </Centro>
  );
};

const Cita: React.FC<{ e: Extract<Escena, { tipo: 'cita' }>; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [6, Math.max(20, Math.min(duracion * 0.5, 80))], [0, e.texto.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Centro gap={30}>
      <Panel ancho={1500} color={C.rosa}>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 110, color: C.blanco, textAlign: 'center', textShadow: neon(C.rosa, 0.6) }}>
          “{e.texto.slice(0, n)}<span style={{ opacity: Math.floor(f / 8) % 2 }}>|</span>”
        </div>
      </Panel>
      <Aparece retraso={30}>
        <div style={{ ...texto(40, C.cian, 800) }}>— {e.fuente}</div>
      </Aparece>
    </Centro>
  );
};

const Alerta: React.FC<{ e: Extract<Escena, { tipo: 'alerta' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const flash = Math.floor(f / 10) % 2 === 0;
  return (
    <Centro gap={30}>
      <div style={{ position: 'absolute', inset: 0, background: C.rojo, opacity: flash ? 0.12 : 0.04 }} />
      <svg width={300} height={270} viewBox="0 0 300 270">
        <path d="M150 10 L 290 255 L 10 255 Z" fill={flash ? C.rojo : '#a01818'} stroke={C.blanco} strokeWidth={10} strokeLinejoin="round" />
        <rect x={138} y={80} width={24} height={100} rx={10} fill={C.blanco} />
        <circle cx={150} cy={215} r={15} fill={C.blanco} />
      </svg>
      <Titular texto={e.texto} tam={110} color={C.rojo} />
      <Aparece retraso={14}>
        <div style={{ ...texto(50, C.blanco, 900), textShadow: '0 4px 18px #000' }}>{e.sub}</div>
      </Aparece>
    </Centro>
  );
};

const Flecha: React.FC<{ e: Extract<Escena, { tipo: 'flecha' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [16, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const caja = (t: string, col: string) => (
    <div style={{ fontFamily: FUENTE_TITULO, fontSize: 92, color: C.blanco, padding: '40px 60px', border: `5px solid ${col}`, borderRadius: 26, boxShadow: `0 0 30px ${col}`, background: 'rgba(12,6,34,0.8)', textShadow: neon(col, 0.6) }}>{t}</div>
  );
  return (
    <Centro gap={50}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Aparece desde="izq">{caja(e.de, C.cian)}</Aparece>
        <svg width={300} height={120} viewBox="0 0 300 120">
          <line x1={10} y1={60} x2={10 + 240 * p} y2={60} stroke={C.amarillo} strokeWidth={14} strokeLinecap="round" />
          {p > 0.9 && <path d="M230 20 L 290 60 L 230 100" stroke={C.amarillo} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <Aparece retraso={30} desde="der">{caja(e.a, C.rosa)}</Aparece>
      </div>
      <Aparece retraso={40}>
        <div style={{ ...texto(52, C.amarillo, 900), textShadow: '0 4px 18px #000' }}>{e.etiqueta}</div>
      </Aparece>
    </Centro>
  );
};

export const LogoNeon: React.FC<{ tam?: number }> = ({ tam = 140 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.9 }}>
    <div style={{ fontFamily: FUENTE_MARCA, fontSize: tam, color: C.blanco, textShadow: neon(C.rosa, 1.2), transform: 'rotate(-6deg)' }}>Mapa</div>
    <div style={{ fontFamily: FUENTE_TITULO, fontSize: tam * 0.72, color: C.blanco, letterSpacing: tam * 0.12, textShadow: neon(C.cian, 1.1), marginTop: tam * 0.05 }}>NEÓN</div>
  </div>
);

const Cierre: React.FC<{ e: Extract<Escena, { tipo: 'cierre' }> }> = ({ e }) => {
  const f = useCurrentFrame();
  const clic = f > 70 && f < 82;
  return (
    <Centro gap={44}>
      <Titular texto={e.texto} tam={110} />
      <Aparece retraso={20} desde="zoom">
        <div style={{ background: 'rgba(11,8,32,0.7)', padding: '20px 50px', borderRadius: 30 }}><LogoNeon tam={120} /></div>
      </Aparece>
      <Aparece retraso={40}>
        <div style={{ ...texto(54, clic ? C.rosa : C.blanco, 900), background: clic ? C.blanco : C.rosa, padding: '20px 60px', borderRadius: 18, boxShadow: `0 0 30px ${C.rosa}`, transform: `scale(${clic ? 0.94 : 1})` }}>
          {f > 82 ? 'SUSCRITO ✓' : 'SUSCRÍBETE'}
        </div>
      </Aparece>
    </Centro>
  );
};

export const EscenaGTA: React.FC<{ e: Escena; duracion: number }> = ({ e, duracion }) => {
  switch (e.tipo) {
    case 'portada': return <Portada e={e} />;
    case 'dato': return <Dato e={e} />;
    case 'lista': return <Lista e={e} duracion={duracion} />;
    case 'relojes': return <Relojes e={e} duracion={duracion} />;
    case 'consola': return <Consola e={e} duracion={duracion} />;
    case 'almacen': return <Almacen e={e} duracion={duracion} />;
    case 'mapa': return <Mapa e={e} />;
    case 'comparar': return <Comparar e={e} duracion={duracion} />;
    case 'sello': return <Sello e={e} />;
    case 'pareja': return <Pareja e={e} />;
    case 'linea': return <Linea e={e} duracion={duracion} />;
    case 'pregunta': return <Pregunta e={e} />;
    case 'cita': return <Cita e={e} duracion={duracion} />;
    case 'alerta': return <Alerta e={e} />;
    case 'flecha': return <Flecha e={e} />;
    case 'cierre': return <Cierre e={e} />;
  }
};

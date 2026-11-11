// Escenas reutilizables para los episodios. Cada una recibe su duracion en fotogramas y se anima sola.
import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { color, fuente } from './estilo';
import { MARCOS, TIERRA } from './tierra';
import { ALTO, ANCHO, Aurora, Barco, Cielo, Dato, Estrellas, HORIZONTE, Lienzo, MarHelado, Marinero, Nieve } from './elementos';

type ConDuracion = { duracion: number };
const fijo = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const avance = (frame: number, desde: number, hasta: number) => interpolate(frame, [desde, hasta], [0, 1], fijo);

// Fondos -------------------------------------------------------------------------------------------

// Suelo de tierra nevada para las escenas con personas caminando (en vez del mar helado).
const TierraNevada: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="tierra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4F6E7F" />
        <stop offset="1" stopColor="#1C2F3E" />
      </linearGradient>
    </defs>
    <path d={`M0,${HORIZONTE - 30} C300,${HORIZONTE - 70} 520,${HORIZONTE - 10} 820,${HORIZONTE - 45} S1400,${HORIZONTE - 5} 1920,${HORIZONTE - 60} L1920,${ALTO} L0,${ALTO} Z`} fill="#2B4557" />
    <path d={`M0,${HORIZONTE} C400,${HORIZONTE - 25} 900,${HORIZONTE + 20} 1300,${HORIZONTE - 10} S1750,${HORIZONTE + 10} 1920,${HORIZONTE} L1920,${ALTO} L0,${ALTO} Z`} fill="url(#tierra)" />
    {Array.from({ length: 14 }, (_, i) => {
      const y = HORIZONTE + 40 + random(`ty${i}`) * (ALTO - HORIZONTE - 60);
      const x = random(`tx${i}`) * ANCHO;
      const largo = 120 + random(`tl${i}`) * 260;
      return <path key={i} d={`M${x},${y} q${largo / 2},-10 ${largo},0`} fill="none" stroke={color.blanco} strokeOpacity={0.12 + random(`to${i}`) * 0.12} strokeWidth={3} />;
    })}
    {Array.from({ length: 9 }, (_, i) => (
      <ellipse key={i} cx={random(`rx${i}`) * ANCHO} cy={HORIZONTE + 60 + random(`ry${i}`) * 300} rx={8 + random(`rw${i}`) * 18} ry={5 + random(`rh${i}`) * 8} fill={color.noche} opacity={0.55} />
    ))}
  </g>
);

export type TipoFondo = 'crepusculo' | 'noche' | 'polar' | 'oscuro' | 'aurora' | 'amanecer' | 'tormenta';
const TONOS: Record<TipoFondo, [string, string, string]> = {
  crepusculo: [color.noche, color.azul, '#B8693F'],
  noche: [color.noche, color.profundo, color.azul],
  polar: [color.noche, color.profundo, color.hielo],
  oscuro: [color.noche, color.noche, color.profundo],
  aurora: ['#040B18', '#0C2B3C', '#2FA57F'],
  amanecer: ['#120A24', '#3B2152', '#E2784C'],
  tormenta: ['#04060C', '#111A28', '#2E3F55'],
};
// Colores de aurora por fondo: la de "aurora" mezcla verdes y violetas intensos.
const AURORAS: Partial<Record<TipoFondo, [string, string, string]>> = {
  aurora: ['#38D39F', '#8E5BD8', '#2FB5C9'],
  amanecer: ['#C46AA8', '#E79A5B', '#7A5BC4'],
};

// Permite cambiar el fondo de cualquier escena desde el plan sin tocar la escena: <ConFondo tipo="aurora">.
const FondoForzado = React.createContext<TipoFondo | null>(null);
export const ConFondo: React.FC<{ tipo: TipoFondo; children: React.ReactNode }> = ({ tipo, children }) => (
  <FondoForzado.Provider value={tipo}>{children}</FondoForzado.Provider>
);

const Fondo: React.FC<{ tipo: TipoFondo; mar?: boolean; tierra?: boolean; nieve?: number }> = ({ tipo: propio, mar = true, tierra = false, nieve = 60 }) => {
  const frame = useCurrentFrame();
  const forzado = React.useContext(FondoForzado);
  const tipo = propio === 'oscuro' ? propio : forzado ?? propio;
  const [a, m, b] = TONOS[tipo];
  // En la tormenta, un relampago corto cada 5 segundos.
  const relampago = tipo === 'tormenta' ? interpolate(frame % 150, [0, 2, 8], [0.5, 0.25, 0], fijo) : 0;
  return (
    <>
      <Cielo id={`fondo-${tipo}`} arriba={a} medio={m} brillo={b} />
      <Estrellas semilla={tipo} cantidad={tipo === 'tormenta' ? 20 : 90} />
      {tipo !== 'oscuro' && tipo !== 'tormenta' && <Aurora intensidad={tipo === 'aurora' ? 1.5 : tipo === 'polar' ? 0.8 : 0.5} colores={AURORAS[tipo]} />}
      {tierra ? <TierraNevada /> : mar && <MarHelado deriva={0.3} />}
      {nieve > 0 && <Nieve cantidad={tipo === 'tormenta' ? nieve * 2.5 : nieve} velocidad={tipo === 'tormenta' ? 2.2 : 0.6} />}
      {relampago > 0 && <rect width={ANCHO} height={ALTO} fill="#DDE8F0" opacity={relampago} />}
    </>
  );
};

// Texto grande centrado para frases clave.
const Rotulo: React.FC<{ texto: string; sub?: string; y?: number; aparece?: number }> = ({ texto, sub, y = 0, aparece = 6 }) => {
  const frame = useCurrentFrame();
  const o = avance(frame, aparece, aparece + 12);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateY(${y + (1 - o) * 16}px)`, opacity: o, textAlign: 'center', color: color.blanco }}>
      <div style={{ fontFamily: fuente.titulo, fontSize: 92, fontWeight: 700, textShadow: '0 6px 30px rgba(0,0,0,0.6)', padding: '0 120px' }}>{texto}</div>
      {sub && <div style={{ fontFamily: fuente.texto, fontSize: 30, letterSpacing: 8, fontWeight: 800, color: color.ambar, marginTop: 14 }}>{sub}</div>}
    </AbsoluteFill>
  );
};

export const Frase: React.FC<ConDuracion & { texto: string; sub?: string; fondo?: TipoFondo }> = ({ texto, sub, fondo = 'noche' }) => (
  <>
    <Lienzo>
      <Fondo tipo={fondo} />
    </Lienzo>
    <Rotulo texto={texto} sub={sub} />
  </>
);

// Mapas estilizados ----------------------------------------------------------------------------------

// Proyeccion de coordenadas reales (latitud, longitud) a la vista del mapa.
type Vista = keyof typeof MARCOS;
export function punto(vista: Vista, lat: number, lon: number) {
  const m = MARCOS[vista];
  return { x: ((lon - m.lonMin) / (m.lonMax - m.lonMin)) * ANCHO, y: ((m.latMax - lat) / (m.latMax - m.latMin)) * ALTO };
}

// Curva suave (Catmull-Rom) que pasa por una lista de puntos geograficos.
export function ruta(vista: Vista, puntos: [number, number][]) {
  const p = puntos.map(([lat, lon]) => punto(vista, lat, lon));
  const n = (v: number) => v.toFixed(1);
  let d = `M${n(p[0].x)},${n(p[0].y)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i], b = p[i], c = p[i + 1], e = p[i + 2] ?? c;
    const c1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 };
    const c2 = { x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 };
    d += ` C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(c.x)},${n(c.y)}`;
  }
  return d;
}

type Marca = { x: number; y: number; texto?: string; tipo?: 'punto' | 'barco' | 'cruz' | 'pregunta'; aparece?: number; colorMarca?: string };
type Ruta = { d: string; desde?: number; hasta?: number; colorRuta?: string; discontinua?: boolean };

export const Mapa: React.FC<ConDuracion & { vista: Vista; rutas?: Ruta[]; marcas?: Marca[]; etiquetas?: { x: number; y: number; texto: string }[]; hueco?: { x: number; y: number }; dato?: { etiqueta: string; valor: string } }> = ({
  duracion, vista, rutas = [], marcas = [], etiquetas = [], hueco, dato,
}) => {
  const frame = useCurrentFrame();
  const tierra = TIERRA[vista];
  return (
    <>
      <Lienzo>
        <rect width={ANCHO} height={ALTO} fill="#08131F" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1={0} x2={ANCHO} y1={i * 95} y2={i * 95} stroke={color.hielo} strokeOpacity={0.07} />
        ))}
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`v${i}`} y1={0} y2={ALTO} x1={i * 96} x2={i * 96} stroke={color.hielo} strokeOpacity={0.07} />
        ))}
        {tierra.map((d, i) => (
          <path key={i} d={d} fill="#1A3247" stroke={color.hieloClaro} strokeOpacity={0.45} strokeWidth={2} />
        ))}
        {hueco && (
          <ellipse cx={hueco.x} cy={hueco.y} rx={150} ry={90} fill="none" stroke={color.ambar} strokeWidth={4} strokeDasharray="12 10" opacity={0.5 + 0.5 * Math.sin(frame / 8)} />
        )}
        {rutas.map((r, i) => {
          const largo = 2600;
          const p = avance(frame, (r.desde ?? 0.05) * duracion, (r.hasta ?? 0.7) * duracion);
          return (
            <path key={i} d={r.d} fill="none" stroke={r.colorRuta ?? color.ambar} strokeWidth={5} strokeLinecap="round"
              strokeDasharray={r.discontinua ? '16 12' : `${largo}`} strokeDashoffset={r.discontinua ? 0 : largo * (1 - p)} opacity={r.discontinua ? p : 1} />
          );
        })}
        {marcas.map((m, i) => {
          const o = avance(frame, (m.aparece ?? 0.15) * duracion, (m.aparece ?? 0.15) * duracion + 10);
          const pulso = 1 + 0.25 * Math.sin(frame / 7 + i);
          const c = m.colorMarca ?? color.ambar;
          return (
            <g key={i} opacity={o} transform={`translate(${m.x} ${m.y})`}>
              {(m.tipo ?? 'punto') === 'punto' && (
                <>
                  <circle r={10} fill={c} />
                  <circle r={26 * pulso} fill="none" stroke={c} strokeWidth={3} opacity={0.6} />
                </>
              )}
              {m.tipo === 'barco' && <Barco x={0} y={0} escala={0.18} tono={c} />}
              {m.tipo === 'cruz' && (
                <g stroke={color.rojo} strokeWidth={9} strokeLinecap="round">
                  <line x1={-22} y1={-22} x2={22} y2={22} />
                  <line x1={22} y1={-22} x2={-22} y2={22} />
                </g>
              )}
              {m.tipo === 'pregunta' && (
                <text textAnchor="middle" dominantBaseline="central" fontFamily={fuente.titulo} fontSize={110} fill={c} transform={`scale(${pulso})`}>?</text>
              )}
              {m.texto && (
                <text x={0} y={m.tipo === 'barco' ? 50 : 52} textAnchor="middle" fontFamily={fuente.texto} fontWeight={800} fontSize={26} letterSpacing={3} fill={color.blanco}>{m.texto}</text>
              )}
            </g>
          );
        })}
        {etiquetas.map((e, i) => (
          <text key={i} x={e.x} y={e.y} textAnchor="middle" fontFamily={fuente.texto} fontWeight={500} fontSize={30} letterSpacing={10} fill={color.hieloClaro} opacity={0.75}>{e.texto}</text>
        ))}
        <text x={ANCHO - 110} y={ALTO - 60} textAnchor="end" fontFamily={fuente.texto} fontSize={18} fill={color.hieloClaro} opacity={0.45}>Approximate positions · Natural Earth</text>
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

// Puntos de referencia reales (posiciones aproximadas).
export const GEO = {
  barcosAbandonados: [70.08, -98.38] as [number, number], // posicion escrita en la nota: 70°05'N 98°23'W
  victoryPoint: [69.62, -98.25] as [number, number],
  terrorBay: [68.92, -98.92] as [number, number],
  erebus: [68.25, -98.85] as [number, number],
  backRiver: [67.25, -95.6] as [number, number],
  beechey: [74.72, -91.85] as [number, number],
  baffin: [73.0, -66.0] as [number, number],
  kwi: [69.0, -97.5] as [number, number],
};

// Personas, retratos y fichas --------------------------------------------------------------------------

// Con "imagen" muestra el retrato de archivo (public/retratos/<imagen>.jpg) tintado con la paleta del canal.
export const Retrato: React.FC<ConDuracion & { nombre: string; cargo?: string; imagen?: string; apagado?: boolean; dato?: { etiqueta: string; valor: string } }> = ({
  duracion, nombre, cargo, imagen, apagado = false, dato,
}) => {
  const frame = useCurrentFrame();
  const o = avance(frame, 4, 18);
  const gris = apagado ? interpolate(frame, [duracion * 0.3, duracion * 0.8], [1, 0.35], fijo) : 1;
  const zoom = interpolate(frame, [0, duracion], [1.04, 1.16]);
  const deriva = interpolate(frame, [0, duracion], [10, -10]);
  return (
    <>
      <Lienzo>
        <Fondo tipo="oscuro" mar={false} nieve={40} />
        {!imagen && (
          <g opacity={o * gris} transform={`translate(${ANCHO / 2} 470)`}>
            <ellipse rx={230} ry={290} fill={color.profundo} stroke={color.ambar} strokeWidth={6} />
            <circle cx={0} cy={-60} r={95} fill={color.hielo} opacity={0.55} />
            <path d="M-170,250 C-170,110 -90,60 0,60 C90,60 170,110 170,250 Z" fill={color.hielo} opacity={0.55} />
          </g>
        )}
      </Lienzo>
      {imagen && (
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 170, opacity: o * gris }}>
          <div style={{ width: 460, height: 580, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${color.ambar}`, boxShadow: `0 0 60px ${color.ambar}33` }}>
            <Img
              src={staticFile(`retratos/${imagen}.jpg`)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', transform: `scale(${zoom}) translateY(${deriva}px)`, filter: 'grayscale(1) sepia(0.35) contrast(1.08) brightness(0.92)' }}
            />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90, opacity: o, textAlign: 'center' }}>
        <div style={{ fontFamily: fuente.titulo, fontSize: 64, fontWeight: 700, color: color.blanco }}>{nombre}</div>
        {cargo && <div style={{ fontFamily: fuente.texto, fontSize: 26, letterSpacing: 8, fontWeight: 800, color: color.ambar, marginTop: 8 }}>{cargo}</div>}
      </AbsoluteFill>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={10} />}
    </>
  );
};

export const Fichas: React.FC<ConDuracion & { tarjetas: { titulo: string; sub?: string; resaltada?: boolean; apagada?: boolean }[] }> = ({ duracion, tarjetas }) => {
  const frame = useCurrentFrame();
  // Cada tarjeta se ilumina por turnos para que la escena no se quede quieta.
  const turno = Math.floor((frame / Math.max(1, duracion)) * tarjetas.length * 1.5) % tarjetas.length;
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" mar={false} nieve={40} />
      </Lienzo>
      <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
        {tarjetas.map((t, i) => {
          const o = avance(frame, 6 + i * 10, 18 + i * 10);
          const activa = !t.apagada && i === turno && frame > 30;
          const flota = Math.sin(frame / 20 + i * 1.3) * 6;
          return (
            <div key={i} style={{
              opacity: o * (t.apagada ? 0.35 : 1), transform: `translateY(${(1 - o) * 30 + flota}px) scale(${activa ? 1.06 : 1})`, width: 420, padding: '40px 30px', borderRadius: 18, textAlign: 'center',
              background: 'rgba(6,11,22,0.75)', border: `3px solid ${t.resaltada ? color.ambar : color.hielo}`, boxShadow: t.resaltada ? `0 0 40px ${color.ambar}55` : 'none',
            }}>
              {t.sub && <div style={{ fontFamily: fuente.texto, fontSize: 24, letterSpacing: 6, fontWeight: 800, color: color.ambar }}>{t.sub}</div>}
              <div style={{ fontFamily: fuente.titulo, fontSize: 50, fontWeight: 700, color: color.blanco, marginTop: 10 }}>{t.titulo}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </>
  );
};

export const Multitud: React.FC<ConDuracion & { total: number; apagar: number; etiqueta: string; inicial: number; final: number; colorValor?: string }> = ({
  duracion, total, apagar, etiqueta, inicial, final, colorValor,
}) => {
  const frame = useCurrentFrame();
  const p = avance(frame, duracion * 0.2, duracion * 0.75);
  const apagados = Math.round(p * apagar);
  const columnas = 19;
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" mar={false} nieve={40} />
        {Array.from({ length: total }, (_, i) => {
          const x = ANCHO / 2 + ((i % columnas) - (columnas - 1) / 2) * 72;
          const y = 360 + Math.floor(i / columnas) * 82;
          const apagado = i >= total - apagados;
          return <Marinero key={i} x={x} y={y} escala={1.15} relleno={apagado ? color.hielo : color.blanco} opacidad={apagado ? 0.18 : 1} />;
        })}
      </Lienzo>
      <Dato etiqueta={etiqueta} valor={String(Math.round(interpolate(p, [0, 1], [inicial, final])))} x={90} y={80} aparece={4} colorValor={colorValor} />
    </>
  );
};

export const Marcha: React.FC<ConDuracion & { figuras?: number; trineo?: boolean; desvanecer?: boolean; fondo?: TipoFondo; dato?: { etiqueta: string; valor: string } }> = ({
  duracion, figuras = 9, trineo = true, desvanecer = false, fondo = 'polar', dato,
}) => {
  const frame = useCurrentFrame();
  const x0 = interpolate(frame, [0, duracion], [380, 760]);
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} tierra nieve={150} />
        <g transform={`translate(${x0} 820)`}>
          {trineo && (
            <g>
              <path d="M-40,-30 L180,-30 L150,0 L-20,0 Z" fill={color.noche} />
              <rect x={-50} y={2} width={240} height={6} rx={3} fill={color.noche} />
              <line x1={180} y1={-20} x2={260} y2={-28} stroke={color.noche} strokeWidth={3} />
            </g>
          )}
          {Array.from({ length: figuras }, (_, i) => {
            const paso = Math.sin(frame / 6 + i) * 3;
            const o = desvanecer ? interpolate(frame, [duracion * (0.25 + i * 0.05), duracion * (0.35 + i * 0.05)], [1, 0.12], fijo) : 1;
            return <Marinero key={i} x={270 + i * 70} y={paso} escala={1.6} relleno={color.noche} opacidad={o} />;
          })}
        </g>
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Encuentro: React.FC<ConDuracion & { cerca?: boolean; dato?: { etiqueta: string; valor: string } }> = ({ duracion, cerca = false, dato }) => {
  const frame = useCurrentFrame();
  const llega = interpolate(frame, [0, duracion * 0.6], [cerca ? 760 : 300, cerca ? 860 : 700], fijo);
  const e = cerca ? 2.4 : 2;
  return (
    <>
      <Lienzo>
        <Fondo tipo="crepusculo" tierra nieve={90} />
        <path d={`M1100,${HORIZONTE + 120} a110,90 0 0,1 220,0 Z`} fill={color.hieloClaro} opacity={0.35} />
        <g transform={`translate(0 ${cerca ? 900 : 860})`}>
          <Marinero x={llega} y={0} escala={e} relleno={color.noche} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${(cerca ? 1080 : 1180) + i * (cerca ? 90 : 60)} 0)`}>
              <Marinero x={0} y={0} escala={e} relleno="#2A2130" />
              <circle cx={0} cy={-34 * e} r={10 * e} fill="none" stroke="#2A2130" strokeWidth={5 * e} />
            </g>
          ))}
        </g>
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

// Lugares ------------------------------------------------------------------------------------------------

export const Barcos: React.FC<ConDuracion & { etiquetas?: boolean; alejar?: boolean; fondo?: TipoFondo; dato?: { etiqueta: string; valor: string } }> = ({
  duracion, etiquetas = false, alejar = false, fondo = 'crepusculo', dato,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duracion], [0, 1]);
  const escala = alejar ? interpolate(p, [0, 1], [1, 0.55]) : 1;
  const niebla = alejar ? interpolate(p, [0.3, 1], [0, 0.75], fijo) : 0;
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} nieve={60} />
        <Barco x={560 + p * 200} y={740} escala={0.85 * escala} />
        <Barco x={1260 + p * 160} y={725} escala={0.7 * escala} fase={1.3} />
        {etiquetas && (
          <g fontFamily={fuente.texto} fontWeight={800} fontSize={30} letterSpacing={6} fill={color.ambar} textAnchor="middle" opacity={avance(frame, 10, 22)}>
            <text x={560 + p * 200} y={500}>HMS EREBUS</text>
            <text x={1260 + p * 160} y={520}>HMS TERROR</text>
          </g>
        )}
        <rect width={ANCHO} height={ALTO} fill={color.profundo} opacity={niebla} />
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Puerto: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duracion], [0, 1]);
  return (
    <>
      <Lienzo>
        <Cielo id="puerto" arriba={color.noche} medio={color.azul} brillo="#C98B55" />
        <Estrellas cantidad={40} semilla="puerto" />
        <rect y={HORIZONTE} width={ANCHO} height={ALTO - HORIZONTE} fill={color.profundo} />
        <Barco x={980 + p * 420} y={720} escala={0.8} />
        <Barco x={1450 + p * 380} y={712} escala={0.62} fase={2} />
        <rect x={0} y={760} width={760} height={40} fill={color.noche} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={30 + i * 85} y={790} width={14} height={140} fill={color.noche} />)}
        {Array.from({ length: 14 }, (_, i) => <Marinero key={i} x={60 + i * 48} y={758 + (i % 2) * 4} escala={1.3} relleno={color.noche} />)}
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Flota: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Fondo tipo="polar" nieve={80} />
        {Array.from({ length: 13 }, (_, i) => {
          const y = HORIZONTE + 10 + random(`fl${i}`) * 300;
          const e = 0.15 + (y - HORIZONTE) / 1100;
          const aparece = avance(frame, i * (duracion / 20), i * (duracion / 20) + 10);
          return <g key={i} opacity={aparece}><Barco x={100 + random(`fx${i}`) * 1720 + frame * 0.3} y={y} escala={e} fase={i} /></g>;
        })}
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Isla: React.FC<ConDuracion & { fantasmas?: boolean; foco?: boolean; dato?: { etiqueta: string; valor: string } }> = ({ fantasmas = false, foco = false, dato }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Fondo tipo="polar" nieve={90} />
        <path d="M520,720 C620,560 760,520 960,540 C1160,560 1300,600 1420,720 Z" fill="#14283A" />
        <path d="M520,720 C620,560 760,520 960,540 C1160,560 1300,600 1420,720" fill="none" stroke={color.hieloClaro} strokeOpacity={0.5} strokeWidth={3} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${820 + i * 90},640 l40,-50 l40,50 Z`} fill="none" stroke={color.hieloClaro} strokeOpacity={0.5} strokeWidth={3} />)}
        {fantasmas && (
          <g opacity={0.35 + 0.15 * Math.sin(frame / 10)}>
            <g stroke={color.hieloClaro} strokeDasharray="8 8" fill="none"><Barco x={1560} y={760} escala={0.5} tono="transparent" /></g>
            <Barco x={1560} y={760} escala={0.5} tono={color.hielo} />
          </g>
        )}
        {foco && <circle cx={960} cy={600} r={140 + 20 * Math.sin(frame / 8)} fill="none" stroke={color.ambar} strokeWidth={4} strokeDasharray="14 10" />}
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Tumbas: React.FC<ConDuracion & { nombres?: string[] }> = ({ nombres }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" nieve={70} />
        {[0, 1, 2].map((i) => {
          const x = 620 + i * 340;
          return (
            <g key={i} opacity={avance(frame, 4 + i * 8, 16 + i * 8)}>
              <path d={`M${x - 55},860 L${x - 55},640 Q${x},590 ${x + 55},640 L${x + 55},860 Z`} fill="#22384A" stroke={color.hieloClaro} strokeOpacity={0.5} strokeWidth={3} />
              <rect x={x - 90} y={850} width={180} height={18} rx={8} fill={color.noche} />
            </g>
          );
        })}
      </Lienzo>
      {nombres && (
        <AbsoluteFill>
          {nombres.map((n, i) => (
            <div key={n} style={{ position: 'absolute', top: 560, left: 620 + i * 340 - 170, width: 340, textAlign: 'center', opacity: avance(frame, 12 + i * 14, 24 + i * 14), fontFamily: fuente.texto, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: color.blanco }}>
              {n}
            </div>
          ))}
          <div style={{ position: 'absolute', top: 920, width: '100%', textAlign: 'center', fontFamily: fuente.texto, fontSize: 28, letterSpacing: 8, color: color.ambar, opacity: avance(frame, 60, 72) }}>WINTER 1845–46</div>
        </AbsoluteFill>
      )}
    </>
  );
};

export const Memorial: React.FC<ConDuracion> = () => (
  <Lienzo>
    <Fondo tipo="crepusculo" nieve={50} />
    <circle cx={960} cy={720} r={260} fill={color.ambar} opacity={0.07} />
    {[[960, 860, 300, 80], [960, 780, 230, 76], [960, 704, 160, 72], [960, 632, 90, 64]].map(([x, y, w, h], i) => (
      <rect key={i} x={x - w / 2} y={y - h} width={w} height={h} rx={22} fill="#2C4558" stroke={color.hieloClaro} strokeOpacity={0.5} strokeWidth={3} />
    ))}
  </Lienzo>
);

export const BarcoCongelado: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ dato }) => (
  <>
    <Lienzo>
      <Fondo tipo="crepusculo" nieve={120} />
      <Barco x={1150} y={740} escala={0.5} tono="#0A1220" />
      <path d="M950,745 L1350,745 L1330,760 L970,760 Z" fill={color.hieloClaro} opacity={0.5} />
    </Lienzo>
    {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
  </>
);

export const Fox: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duracion], [600, 980]);
  return (
    <>
      <Lienzo>
        <Fondo tipo="polar" nieve={80} />
        <g>
          <rect x={x - 10} y={540} width={26} height={110} fill={color.noche} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={x + 4 - ((frame * 1.5 + i * 40) % 160) * 0.8} cy={520 - ((frame * 1.5 + i * 40) % 160) * 0.9} r={18 + ((frame + i * 40) % 160) / 6} fill={color.hieloClaro} opacity={0.25 * (1 - ((frame * 1.5 + i * 40) % 160) / 160)} />
          ))}
          <Barco x={x} y={740} escala={0.7} />
        </g>
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Cairn: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ dato }) => {
  const frame = useCurrentFrame();
  const brillo = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" nieve={90} />
        {Array.from({ length: 16 }, (_, i) => {
          const fila = i < 6 ? 0 : i < 11 ? 1 : i < 14 ? 2 : 3;
          const enFila = [0, 6, 11, 14][fila];
          const n = [6, 5, 3, 2][fila];
          const x = 960 + (i - enFila - (n - 1) / 2) * 80;
          const y = 820 - fila * 62;
          return <ellipse key={i} cx={x} cy={y} rx={46} ry={34} fill="#2A3C4C" stroke={color.hieloClaro} strokeOpacity={0.35} />;
        })}
        <rect x={930} y={700} width={60} height={22} rx={10} fill="#8A9AA6" />
        <circle cx={960} cy={711} r={60} fill={color.ambar} opacity={0.18 * brillo} />
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Londres: React.FC<ConDuracion & { dato?: { etiqueta: string; valor: string } }> = ({ dato }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Cielo id="londres" arriba={color.noche} medio="#1B2433" brillo="#3B3A44" />
        <path d="M0,820 L0,700 L120,700 L120,640 L200,640 L200,700 L330,700 L330,600 L360,560 L390,600 L390,700 L560,700 L560,660 L640,660 L640,700 L760,700 C760,560 900,520 960,520 C1020,520 1160,560 1160,700 L1290,700 L1290,620 L1330,620 L1330,700 L1500,700 L1500,650 L1620,650 L1620,700 L1920,700 L1920,820 Z" fill={color.noche} />
        <rect x={950} y={450} width={20} height={70} fill={color.noche} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={140 + i * 150} y={740} width={16} height={22} fill={color.ambar} opacity={0.4 + 0.3 * Math.sin(frame / 15 + i)} />)}
        <rect y={820} width={ANCHO} height={ALTO - 820} fill="#0A111C" />
        {Array.from({ length: 160 }, (_, i) => {
          const x = (random(`ll${i}`) * ANCHO + frame * 2) % ANCHO;
          const y = (random(`ly${i}`) * ALTO + frame * 22) % ALTO;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke={color.hieloClaro} strokeOpacity={0.35} strokeWidth={2} />;
        })}
      </Lienzo>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Contraste: React.FC<ConDuracion> = () => (
  <>
    <AbsoluteFill style={{ clipPath: 'inset(0 50% 0 0)' }}>
      <Encuentro duracion={300} cerca />
    </AbsoluteFill>
    <AbsoluteFill style={{ clipPath: 'inset(0 0 0 50%)' }}>
      <Londres duracion={300} />
    </AbsoluteFill>
    <AbsoluteFill style={{ left: '50%', width: 4, background: color.ambar }} />
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 70, fontFamily: fuente.texto, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: color.ambar }}>
      <div style={{ width: '50%', textAlign: 'center' }}>THE ARCTIC</div>
      <div style={{ width: '50%', textAlign: 'center' }}>LONDON</div>
    </AbsoluteFill>
  </>
);

// Objetos y documentos ------------------------------------------------------------------------------------

export const Cubiertos: React.FC<ConDuracion> = () => {
  const frame = useCurrentFrame();
  const brillo = avance(frame, 10, 30);
  return (
    <Lienzo>
      <Fondo tipo="oscuro" mar={false} nieve={30} />
      <g transform="translate(820 540) rotate(-12)">
        <rect x={-14} y={-60} width={28} height={300} rx={14} fill="#B9C3C9" />
        {[-30, -10, 10, 30].map((x) => <rect key={x} x={x - 5} y={-200} width={10} height={150} rx={5} fill="#B9C3C9" />)}
        <circle cx={0} cy={190} r={22} fill="none" stroke={color.ambar} strokeWidth={5} opacity={brillo} />
      </g>
      <g transform="translate(1100 540) rotate(10)">
        <rect x={-14} y={-40} width={28} height={290} rx={14} fill="#B9C3C9" />
        <ellipse cx={0} cy={-110} rx={62} ry={90} fill="#B9C3C9" />
        <circle cx={0} cy={200} r={22} fill="none" stroke={color.ambar} strokeWidth={5} opacity={brillo} />
      </g>
      <circle cx={960} cy={540} r={420} fill={color.ambar} opacity={0.06 * brillo} />
    </Lienzo>
  );
};

export const Papel: React.FC<ConDuracion & {
  titulo?: string; sub?: string; manuscrito?: string; margen?: string; marca?: 'tachado' | 'circulo'; fecha?: string; dato?: { etiqueta: string; valor: string };
}> = ({ duracion, titulo, sub, manuscrito, margen, marca, fecha, dato }) => {
  const frame = useCurrentFrame();
  const o = avance(frame, 2, 14);
  const lineas = avance(frame, 8, duracion * 0.6);
  const margenO = avance(frame, duracion * 0.2, duracion * 0.5);
  const marcaP = avance(frame, duracion * 0.45, duracion * 0.7);
  return (
    <>
      <Lienzo>
        <Fondo tipo="oscuro" mar={false} nieve={30} />
      </Lienzo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          opacity: o,
          transform: `translateX(${interpolate(frame, [0, duracion], [-50, 50])}px) rotate(${interpolate(frame, [0, duracion], [-3.5, -1])}deg) scale(${interpolate(frame, [0, duracion], [0.95, 1.1])})`,
          width: 760, height: 900, background: '#E6DCC4', borderRadius: 6,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)', padding: '70px 70px', position: 'relative', overflow: 'hidden', fontFamily: fuente.titulo, color: '#2B241B',
        }}>
          {titulo && <div style={{ fontSize: 30, letterSpacing: 6, fontFamily: fuente.texto, fontWeight: 800, textAlign: 'center' }}>{titulo}</div>}
          {sub && <div style={{ fontSize: 46, textAlign: 'center', marginTop: 16, fontWeight: 700 }}>{sub}</div>}
          {fecha && <div style={{ fontSize: 32, marginTop: 30, fontStyle: 'italic' }}>{fecha}</div>}
          <div style={{ marginTop: 30 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ height: 6, borderRadius: 3, background: '#5C4F3D', opacity: 0.35, margin: '26px 0', width: `${Math.max(0, Math.min(1, lineas * 12 - i)) * (60 + random(`pl${i}`) * 35)}%` }} />
            ))}
          </div>
          {/* Franja de luz que recorre el documento, como quien lo lee. */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: 90, top: interpolate(frame % 150, [0, 150], [120, 820]), background: `linear-gradient(180deg, transparent, ${color.ambar}22, transparent)` }} />
          {manuscrito && (
            <div style={{ position: 'absolute', left: 70, bottom: 160, fontSize: 70, fontStyle: 'italic', color: '#1F3A5A', opacity: avance(frame, duracion * 0.25, duracion * 0.45) }}>{manuscrito}</div>
          )}
          {margen && (
            <div style={{ position: 'absolute', right: 26, top: 80, bottom: 80, width: 110, writingMode: 'vertical-rl', fontSize: 30, fontStyle: 'italic', color: '#7A2E22', opacity: margenO, overflow: 'hidden' }}>{margen}</div>
          )}
          {marca === 'tachado' && (
            <div style={{ position: 'absolute', left: 40, right: 40, top: '50%', height: 12, background: color.rojo, transform: `rotate(-24deg) scaleX(${marcaP})`, transformOrigin: 'left' }} />
          )}
          {marca === 'circulo' && (
            <div style={{ position: 'absolute', left: 50, bottom: 120, width: 420, height: 150, border: `8px solid ${color.rojo}`, borderRadius: '50%', opacity: marcaP }} />
          )}
        </div>
      </AbsoluteFill>
      {dato && <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />}
    </>
  );
};

export const Anios: React.FC<ConDuracion & { anios: string[]; pie?: string }> = ({ duracion, anios, pie }) => {
  const frame = useCurrentFrame();
  const porAnio = duracion / anios.length;
  const i = Math.min(anios.length - 1, Math.floor(frame / porAnio));
  const local = frame - i * porAnio;
  const o = interpolate(local, [0, 8, porAnio - 8, porAnio], [0, 1, 1, i === anios.length - 1 ? 1 : 0], fijo);
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" nieve={80} />
      </Lienzo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ opacity: o, transform: `scale(${0.94 + 0.06 * o})`, fontFamily: fuente.titulo, fontSize: 260, fontWeight: 700, color: color.blanco, textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>{anios[i]}</div>
        {pie && <div style={{ fontFamily: fuente.texto, fontSize: 34, letterSpacing: 10, fontWeight: 800, color: color.ambar }}>{pie}</div>}
      </AbsoluteFill>
    </>
  );
};

export const Iconos: React.FC<ConDuracion & { items: { icono: 'frio' | 'enfermedad' | 'hambre' | 'lata' | 'pregunta'; texto: string }[] }> = ({ duracion, items }) => {
  const frame = useCurrentFrame();
  const dibujo = (icono: string) => {
    switch (icono) {
      case 'frio':
        return <g stroke={color.hieloClaro} strokeWidth={8} strokeLinecap="round">{[0, 60, 120].map((r) => <line key={r} x1={0} y1={-60} x2={0} y2={60} transform={`rotate(${r})`} />)}</g>;
      case 'enfermedad':
        return <g fill="none" stroke={color.rojo} strokeWidth={8}><circle r={50} /><line x1={-30} y1={0} x2={30} y2={0} /><line x1={0} y1={-30} x2={0} y2={30} /></g>;
      case 'hambre':
        return <g fill="none" stroke={color.hieloClaro} strokeWidth={8}><ellipse rx={65} ry={22} cy={20} /><path d="M-60,15 C-55,-40 55,-40 60,15" /></g>;
      case 'lata':
        return <g fill="none" stroke={color.ambar} strokeWidth={8}><rect x={-45} y={-60} width={90} height={120} rx={10} /><line x1={-45} y1={-35} x2={45} y2={-35} /><line x1={-45} y1={35} x2={45} y2={35} /></g>;
      default:
        return <text textAnchor="middle" dominantBaseline="central" fontSize={140} fontFamily={fuente.titulo} fill={color.ambar}>?</text>;
    }
  };
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" mar={false} nieve={40} />
      </Lienzo>
      <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 60 }}>
        {items.map((it, i) => {
          const o = avance(frame, 6 + i * 14, 18 + i * 14);
          // Tras aparecer, cada tarjeta se destaca por turnos y la ultima queda resaltada.
          const turno = Math.min(items.length - 1, Math.floor(interpolate(frame, [duracion * 0.35, duracion * 0.9], [0, items.length], fijo)));
          const activa = frame > duracion * 0.35 && i === turno;
          const flota = Math.sin(frame / 18 + i) * 6;
          return (
            <div key={i} style={{ opacity: o * (frame > duracion * 0.35 && !activa ? 0.55 : 1), transform: `translateY(${(1 - o) * 30 + flota}px) scale(${activa ? 1.1 : 1})`, width: 320, height: 380, borderRadius: 20, background: 'rgba(6,11,22,0.75)', border: `3px solid ${activa ? color.ambar : color.hielo}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
              <svg width={200} height={180} viewBox="-100 -90 200 180">{dibujo(it.icono)}</svg>
              <div style={{ fontFamily: fuente.texto, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: color.blanco }}>{it.texto}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </>
  );
};

export const Cierre: React.FC<ConDuracion & { titulo: string; lineas: string[] }> = ({ titulo, lineas }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Fondo tipo="crepusculo" nieve={110} />
      </Lienzo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: color.blanco }}>
        <div style={{ fontFamily: fuente.texto, letterSpacing: 14, fontSize: 30, fontWeight: 800, color: color.ambar, opacity: avance(frame, 4, 16) }}>VANISHED FILES</div>
        <div style={{ fontFamily: fuente.titulo, fontSize: 110, fontWeight: 700, margin: '12px 0 30px', opacity: avance(frame, 10, 24) }}>{titulo}</div>
        {lineas.map((l, i) => (
          <div key={l} style={{ fontFamily: fuente.texto, fontSize: 34, letterSpacing: 6, fontWeight: 500, opacity: avance(frame, 30 + i * 14, 44 + i * 14), margin: 6 }}>{l}</div>
        ))}
      </AbsoluteFill>
    </>
  );
};

export { Fondo };

// Planos de "expediente": titulos, documentos, recortes, notas, contadores, cinta, velas, balanza, tablero y cronologia.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { loadFont as cargarMano } from '@remotion/google-fonts/Caveat';
import { crimen, letra } from '../MarcaCrimen';
import { TINTA } from '../Personaje';
import { Acabado, Camara, ConDuracion, H, Mov, Polvo, Svg, W, ap, fijo, lineal } from './base';

const mano = cargarMano('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;

// Mesa de investigacion: madera oscura con un circulo de luz de flexo.
export const Mesa: React.FC<{ children?: React.ReactNode; luz?: [number, number] }> = ({ children, luz = [50, 45] }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${luz[0]}% ${luz[1]}%, #4A3A2A 0%, #241B14 45%, #0C0A08 85%)` }}>
    <Svg>
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M0,${i * 80 + 20} Q${W / 2},${i * 80 + (random(`veta${i}`) - 0.5) * 40} ${W},${i * 80 + 30}`} stroke="#000" strokeOpacity={0.12} strokeWidth={3} fill="none" />
      ))}
    </Svg>
    {children}
  </AbsoluteFill>
);

const Papel: React.FC<{ x: number; y: number; w: number; h: number; giro?: number; color?: string; children?: React.ReactNode; entra?: number }> = ({ x, y, w, h, giro = 0, color = crimen.papel, children, entra = 1 }) => (
  <div
    style={{
      position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, background: color,
      boxShadow: '0 30px 60px rgba(0,0,0,0.6)', transform: `translateY(${(1 - entra) * 80}px) rotate(${giro + (1 - entra) * 8}deg) scale(${0.96 + entra * 0.04})`, opacity: entra,
      backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(circle at 80% 90%, rgba(80,50,20,0.25), transparent 50%)',
    }}
  >
    {children}
  </div>
);

// Sello de goma que cae con golpe.
export const SelloGoma: React.FC<{ texto: string; desde: number; x: number; y: number; giro?: number; color?: string; tam?: number }> = ({ texto, desde, x, y, giro = -12, color = crimen.rojo, tam = 64 }) => {
  const f = useCurrentFrame();
  const t = ap(f, desde, desde + 6);
  if (f < desde) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${giro}deg) scale(${2.2 - t * 1.2})`, opacity: Math.min(1, t * 1.4) * 0.9 }}>
      <div style={{ fontFamily: letra.titulo, fontSize: tam, letterSpacing: 6, color, border: `6px solid ${color}`, padding: '4px 22px', borderRadius: 8, mixBlendMode: 'multiply' }}>{texto}</div>
    </div>
  );
};

// Titulo de capitulo o rotulo grande sobre negro.
export const Rotulo: React.FC<ConDuracion & { texto: string; sub?: string; sello?: string; fondo?: 'negro' | 'papel' }> = ({ duracion, texto, sub, sello, fondo = 'negro' }) => {
  const f = useCurrentFrame();
  const o = ap(f, 2, 14);
  const letras = Math.floor(lineal(f, 10, 10 + (sub?.length ?? 0) * 1.3) * (sub?.length ?? 0));
  const contenido = (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ opacity: o, transform: `scale(${1.08 - o * 0.08})` }}>
        <div style={{ fontFamily: letra.titulo, fontSize: 150, letterSpacing: 8, lineHeight: 1, color: fondo === 'negro' ? crimen.hueso : TINTA }}>{texto}</div>
        {sub && <div style={{ fontFamily: letra.maquina, fontSize: 40, marginTop: 18, color: fondo === 'negro' ? crimen.rojo : '#7A2A22' }}>{sub.slice(0, letras)}</div>}
      </div>
      {sello && <SelloGoma texto={sello} desde={Math.round(duracion * 0.35)} x={1400} y={300} />}
    </AbsoluteFill>
  );
  return fondo === 'papel' ? (
    <Mesa>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.05] }}>
        <Papel x={960} y={540} w={1500} h={760} giro={-1}>{contenido}</Papel>
      </Camara>
      <Acabado />
    </Mesa>
  ) : (
    <AbsoluteFill style={{ background: crimen.negro }}>
      <Svg><Polvo cantidad={40} /></Svg>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.04] }}>{contenido}</Camara>
      <Acabado />
    </AbsoluteFill>
  );
};

// Recorte de periodico estilizado (sin cabeceras reales).
export const Recorte: React.FC<ConDuracion & { titular: string; sub?: string; fecha?: string; dibujo?: React.ReactNode; sello?: string; tachar?: boolean }> = ({ duracion, titular, sub, fecha, dibujo, sello, tachar }) => {
  const f = useCurrentFrame();
  const entra = ap(f, 0, 16);
  return (
    <Mesa>
      <Camara duracion={duracion} mov={{ zoom: [1.02, 1.12], foco: [50, 40] }}>
        <Papel x={960} y={540} w={1100} h={820} giro={-2} color="#D8CFB8" entra={entra}>
          <div style={{ padding: '40px 60px', color: '#1A1A1A' }}>
            <div style={{ fontFamily: letra.maquina, fontSize: 22, borderBottom: '3px solid #1A1A1A', paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>THE DAILY RECORD</span>
              <span>{fecha}</span>
            </div>
            <div style={{ fontFamily: letra.titulo, fontSize: 104, lineHeight: 0.95, marginTop: 20, position: 'relative' }}>
              {titular}
              {tachar && <div style={{ position: 'absolute', left: 0, top: '45%', height: 12, background: crimen.rojo, width: `${ap(f, duracion * 0.5, duracion * 0.5 + 12) * 100}%` }} />}
            </div>
            {sub && <div style={{ fontFamily: letra.maquina, fontSize: 30, marginTop: 14 }}>{sub}</div>}
            <div style={{ display: 'flex', gap: 30, marginTop: 24 }}>
              <div style={{ width: 420, height: 300, background: '#2A2A2A', position: 'relative', overflow: 'hidden', filter: 'grayscale(1) contrast(1.2)' }}>
                <svg viewBox="0 0 420 300" width={420} height={300}>
                  <rect width={420} height={300} fill="#3A3A3A" />
                  {dibujo}
                </svg>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.4px)', backgroundSize: '6px 6px', opacity: 0.35 }} />
              </div>
              <div style={{ flex: 1 }}>
                {Array.from({ length: 11 }, (_, i) => <div key={i} style={{ height: 10, background: '#3A3A3A', opacity: 0.5, marginBottom: 14, width: i % 4 === 3 ? '60%' : '100%' }} />)}
              </div>
            </div>
          </div>
        </Papel>
        {sello && <SelloGoma texto={sello} desde={Math.round(duracion * 0.4)} x={1250} y={760} />}
      </Camara>
      <Acabado />
    </Mesa>
  );
};

// Nota o documento escrito a mano o a maquina, que aparece letra a letra.
export const Nota: React.FC<ConDuracion & { texto: string; tipo?: 'mano' | 'maquina'; cabecera?: string; firma?: string; sello?: string; subrayar?: boolean; tam?: number }> = ({
  duracion, texto, tipo = 'mano', cabecera, firma, sello, subrayar, tam,
}) => {
  const f = useCurrentFrame();
  const entra = ap(f, 0, 14);
  const n = Math.floor(lineal(f, 12, Math.min(duracion * 0.6, 12 + texto.length * 1.4)) * texto.length);
  const fuente = tipo === 'mano' ? mano : letra.maquina;
  return (
    <Mesa>
      <Camara duracion={duracion} mov={{ zoom: [1.02, 1.14], foco: [50, 45] }}>
        <Papel x={960} y={540} w={tipo === 'mano' ? 900 : 1100} h={tipo === 'mano' ? 560 : 760} giro={tipo === 'mano' ? 3 : -1.5} color={tipo === 'mano' ? '#EDE6D2' : crimen.papel} entra={entra}>
          <div style={{ padding: '50px 70px', color: tipo === 'mano' ? '#1C2A4A' : '#1A1A1A' }}>
            {cabecera && <div style={{ fontFamily: letra.maquina, fontSize: 26, borderBottom: '2px solid #1A1A1A', paddingBottom: 10, marginBottom: 24 }}>{cabecera}</div>}
            <div style={{ fontFamily: fuente, fontSize: tam ?? (tipo === 'mano' ? 76 : 40), lineHeight: 1.25, whiteSpace: 'pre-wrap', textDecoration: subrayar && n >= texto.length ? `underline ${crimen.rojo}` : 'none' }}>
              {texto.slice(0, n)}
              {tipo === 'maquina' && n < texto.length && f % 16 < 8 && <span>▌</span>}
            </div>
            {firma && <div style={{ fontFamily: mano, fontSize: 48, marginTop: 30, opacity: ap(f, duracion * 0.6, duracion * 0.6 + 10) }}>{firma}</div>}
          </div>
        </Papel>
        {sello && <SelloGoma texto={sello} desde={Math.round(duracion * 0.55)} x={1340} y={760} />}
      </Camara>
      <Acabado />
    </Mesa>
  );
};

// Pregunta del capitulo: interrogacion roja grande y texto.
export const Pregunta: React.FC<ConDuracion & { texto: string; sub?: string }> = ({ duracion, texto, sub }) => {
  const f = useCurrentFrame();
  const o = ap(f, 4, 16);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #241417, ${crimen.negro} 70%)`, justifyContent: 'center', alignItems: 'center' }}>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.08] }}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', fontFamily: letra.titulo, fontSize: 900, color: crimen.rojo, opacity: 0.16 * o, transform: `rotate(${-6 + o * 6}deg)` }}>?</div>
          <div style={{ fontFamily: letra.titulo, fontSize: 120, letterSpacing: 4, color: crimen.hueso, opacity: o, textAlign: 'center', padding: '0 160px', lineHeight: 1.05 }}>{texto}</div>
          {sub && <div style={{ fontFamily: letra.maquina, fontSize: 34, color: crimen.rojo, marginTop: 180, opacity: ap(f, 16, 26) }}>{sub}</div>}
        </AbsoluteFill>
      </Camara>
      <Acabado />
    </AbsoluteFill>
  );
};

// Golpe de giro: destello rojo, temblor y texto.
export const Giro: React.FC<ConDuracion & { texto: string }> = ({ duracion, texto }) => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 3, 10], [0.9, 0.4, 0], fijo);
  const temblor = f < 12 ? (random(`g${f}`) - 0.5) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: crimen.negro, justifyContent: 'center', alignItems: 'center' }}>
      <Camara duracion={duracion} mov={{ zoom: [1.1, 1] }}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateX(${temblor}px)` }}>
          <div style={{ fontFamily: letra.titulo, fontSize: 140, color: crimen.hueso, letterSpacing: 6, textShadow: `6px 0 0 ${crimen.rojo}` }}>{texto}</div>
        </AbsoluteFill>
      </Camara>
      <AbsoluteFill style={{ background: crimen.rojo, opacity: flash }} />
      <Acabado />
    </AbsoluteFill>
  );
};

// Contador grande que sube a saltos (por ejemplo 400 -> 909).
export const Contador: React.FC<ConDuracion & { pasos: number[]; etiqueta: string; prefijo?: string; color?: string }> = ({ duracion, pasos, etiqueta, prefijo = '', color = crimen.rojo }) => {
  const f = useCurrentFrame();
  const tramo = (duracion * 0.75) / Math.max(1, pasos.length - 1);
  const i = Math.min(pasos.length - 1, Math.floor(Math.max(0, f - 10) / tramo));
  const golpe = interpolate((f - 10) % tramo, [0, 6], [1.15, 1], fijo);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #1E1A1E, ${crimen.negro} 70%)`, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontFamily: letra.titulo, fontSize: 380, color, lineHeight: 0.9, transform: `scale(${golpe})` }}>{prefijo}{pasos[i]}</div>
      <div style={{ fontFamily: letra.maquina, fontSize: 44, color: crimen.hueso, marginTop: 20, opacity: ap(f, 6, 16) }}>{etiqueta}</div>
      <Acabado />
    </AbsoluteFill>
  );
};

// Casete grabando con forma de onda.
export const Cinta: React.FC<ConDuracion & { etiqueta?: string; texto?: string; onda?: boolean; parada?: boolean }> = ({ duracion, etiqueta = 'Q 042', texto, onda = true, parada }) => {
  const f = useCurrentFrame();
  const giro = parada ? 0 : f * 6;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #22232A, ${crimen.negro} 75%)` }}>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.12], foco: [50, 45] }}>
        <Svg>
          <g transform="translate(960 470)">
            <rect x={-420} y={-250} width={840} height={500} rx={30} fill="#2A2B30" stroke={TINTA} strokeWidth={8} />
            <rect x={-340} y={-200} width={680} height={150} rx={10} fill="#E8E2D4" />
            <text x={0} y={-110} textAnchor="middle" style={{ fontFamily: mano, fontSize: 80 }} fill="#1C2A4A">{etiqueta}</text>
            <rect x={-260} y={-20} width={520} height={160} rx={70} fill="#15161A" />
            {[-150, 150].map((cx) => (
              <g key={cx} transform={`translate(${cx} 60) rotate(${giro})`}>
                <circle r={58} fill="#3A3B40" stroke="#0A0A0C" strokeWidth={6} />
                {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-6} y={-46} width={12} height={22} fill="#0A0A0C" transform={`rotate(${a})`} />)}
                <circle r={16} fill="#E8E2D4" />
              </g>
            ))}
            <rect x={-150} y={44} width={300} height={32} fill="#5A3A26" opacity={0.8} />
          </g>
          {!parada && <circle cx={1520} cy={230} r={18} fill={crimen.rojo} opacity={f % 30 < 18 ? 1 : 0.2} />}
          {!parada && <text x={1550} y={244} style={{ fontFamily: letra.titulo, fontSize: 44 }} fill={crimen.hueso}>REC</text>}
          {onda && (
            <path
              d={Array.from({ length: 120 }, (_, i) => {
                const x = 360 + i * 10;
                const a = parada ? 2 : 10 + 60 * Math.abs(Math.sin(i * 0.5 + f * 0.4) * Math.sin(i * 0.13 + f * 0.07));
                return `${i ? 'L' : 'M'}${x},${880 - a} L${x + 5},${880 + a}`;
              }).join(' ')}
              stroke={crimen.rojo}
              strokeWidth={3}
              fill="none"
              opacity={0.8}
            />
          )}
        </Svg>
      </Camara>
      {texto && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 }}>
          <div style={{ fontFamily: letra.titulo, fontSize: 64, color: crimen.hueso, letterSpacing: 4, opacity: ap(f, 8, 18) }}>{texto}</div>
        </AbsoluteFill>
      )}
      <Acabado />
    </AbsoluteFill>
  );
};

// Velas con nombres que se apagan una a una (homenaje, sin violencia).
export const Velas: React.FC<ConDuracion & { nombres: string[]; apagar?: boolean }> = ({ duracion, nombres, apagar = true }) => {
  const f = useCurrentFrame();
  const n = nombres.length;
  return (
    <AbsoluteFill style={{ background: crimen.negro }}>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.06] }}>
        <Svg>
          {nombres.map((nombre, i) => {
            const x = 960 + (i - (n - 1) / 2) * 300;
            const fin = apagar ? (duracion * 0.35) + i * ((duracion * 0.45) / n) : 1e9;
            const llama = 1 - ap(f, fin, fin + 10);
            const vaiven = Math.sin(f / 4 + i) * 3;
            return (
              <g key={i}>
                <ellipse cx={x} cy={520} rx={130} ry={150} fill="#F2B45A" opacity={0.12 * llama} />
                <rect x={x - 30} y={560} width={60} height={200} rx={6} fill="#E8E2D4" stroke={TINTA} strokeWidth={5} />
                <path d={`M${x},${545 - 50 * llama} Q${x + 22 + vaiven},${548} ${x},${560} Q${x - 22 + vaiven},${548} ${x},${545 - 50 * llama}`} fill="#F7C85E" opacity={llama} />
                {llama < 1 && <path d={`M${x},545 q${10 + vaiven},-40 0,-${80 * (1 - llama)}`} stroke="#9AA" strokeWidth={4} fill="none" opacity={0.5 * (1 - llama)} />}
                <text x={x} y={830} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: 44, letterSpacing: 2 }}>{nombre}</text>
              </g>
            );
          })}
        </Svg>
      </Camara>
      <Acabado />
    </AbsoluteFill>
  );
};

// Balanza: dos platos con texto; se inclina hacia un lado.
export const Balanza: React.FC<ConDuracion & { izq: string; der: string; inclinar?: number }> = ({ duracion, izq, der, inclinar = 0 }) => {
  const f = useCurrentFrame();
  const a = inclinar ? inclinar * ap(f, duracion * 0.4, duracion * 0.7) : Math.sin(f / 18) * 6;
  const r = (a * Math.PI) / 180;
  const ext = 420;
  const pi: [number, number] = [960 - Math.cos(r) * ext, 380 - Math.sin(r) * ext];
  const pd: [number, number] = [960 + Math.cos(r) * ext, 380 + Math.sin(r) * ext];
  return (
    <Mesa luz={[50, 40]}>
      <Svg>
        <rect x={950} y={380} width={20} height={520} fill="#8A6A3A" stroke={TINTA} strokeWidth={5} />
        <rect x={820} y={890} width={280} height={40} rx={10} fill="#6B4E2A" stroke={TINTA} strokeWidth={5} />
        <line x1={pi[0]} y1={pi[1]} x2={pd[0]} y2={pd[1]} stroke="#C9A86A" strokeWidth={14} strokeLinecap="round" />
        {[pi, pd].map((p, i) => (
          <g key={i}>
            <path d={`M${p[0]},${p[1]} L${p[0] - 130},${p[1] + 260} M${p[0]},${p[1]} L${p[0] + 130},${p[1] + 260}`} stroke="#C9A86A" strokeWidth={4} />
            <path d={`M${p[0] - 170},${p[1] + 260} Q${p[0]},${p[1] + 330} ${p[0] + 170},${p[1] + 260} Z`} fill="#B08D4E" stroke={TINTA} strokeWidth={5} />
            <text x={p[0]} y={p[1] + 230} textAnchor="middle" fill={i ? crimen.rojo : crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: 64 }}>{i ? der : izq}</text>
          </g>
        ))}
        <circle cx={960} cy={380} r={22} fill="#C9A86A" stroke={TINTA} strokeWidth={5} />
      </Svg>
      <Acabado />
    </Mesa>
  );
};

// Tablero de corcho con notas e hilo rojo; un sello lo resuelve.
export const Tablero: React.FC<ConDuracion & { notas: string[]; sello?: string }> = ({ duracion, notas, sello }) => {
  const f = useCurrentFrame();
  const pos = notas.map((_, i) => [380 + (i % 3) * 580 + (random(`tb${i}`) - 0.5) * 80, 300 + Math.floor(i / 3) * 400 + (random(`tby${i}`) - 0.5) * 60]);
  return (
    <AbsoluteFill style={{ background: '#5A3E26' }}>
      <Camara duracion={duracion} mov={{ zoom: [1.12, 1.0] }}>
        <AbsoluteFill style={{ backgroundImage: 'radial-gradient(#4A321E 2px, transparent 2.5px)', backgroundSize: '14px 14px', opacity: 0.6 }} />
        <Svg>
          {pos.slice(1).map((p, i) => {
            const a = pos[i];
            const t = ap(f, 10 + i * 8, 24 + i * 8);
            return <line key={i} x1={a[0]} y1={a[1] - 80} x2={a[0] + (p[0] - a[0]) * t} y2={a[1] - 80 + (p[1] - a[1]) * t} stroke={crimen.rojo} strokeWidth={5} />;
          })}
        </Svg>
        {notas.map((n, i) => (
          <div key={i} style={{ position: 'absolute', left: pos[i][0] - 210, top: pos[i][1] - 120, width: 420, padding: 26, background: i % 2 ? '#E8E2D4' : '#E6D8A8', transform: `rotate(${(random(`tr${i}`) - 0.5) * 8}deg)`, boxShadow: '0 16px 30px rgba(0,0,0,0.5)', opacity: ap(f, i * 6, i * 6 + 10) }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: crimen.rojo, margin: '-12px auto 10px' }} />
            <div style={{ fontFamily: mano, fontSize: 56, color: '#1C2A4A', textAlign: 'center', lineHeight: 1.05 }}>{n}</div>
          </div>
        ))}
        {sello && <SelloGoma texto={sello} desde={Math.round(duracion * 0.55)} x={960} y={540} giro={-8} tam={110} />}
      </Camara>
      <Acabado />
    </AbsoluteFill>
  );
};

// Cronologia horizontal con hitos que se encienden.
export const Cronologia: React.FC<ConDuracion & { hitos: { fecha: string; texto: string }[]; activo?: number }> = ({ duracion, hitos, activo }) => {
  const f = useCurrentFrame();
  const n = hitos.length;
  const avance = lineal(f, 8, duracion * 0.8);
  const desplaz = Math.max(0, (n - 4) * 420 * avance);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${crimen.negro}, #16171C)` }}>
      <Svg>
        <g transform={`translate(${-desplaz} 0)`}>
          <line x1={200} y1={560} x2={200 + n * 420} y2={560} stroke={crimen.hueso} strokeOpacity={0.3} strokeWidth={6} />
          <line x1={200} y1={560} x2={200 + n * 420 * avance} y2={560} stroke={crimen.rojo} strokeWidth={6} />
          {hitos.map((h, i) => {
            const x = 360 + i * 420;
            const on = avance * n * 420 + 200 >= x || activo === i;
            return (
              <g key={i} opacity={on ? 1 : 0.35}>
                <circle cx={x} cy={560} r={on ? 20 : 12} fill={on ? crimen.rojo : crimen.hueso} />
                <text x={x} y={480} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.titulo, fontSize: 72 }}>{h.fecha}</text>
                <text x={x} y={650} textAnchor="middle" fill={crimen.hueso} style={{ fontFamily: letra.maquina, fontSize: 28 }}>{h.texto}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      <Acabado />
    </AbsoluteFill>
  );
};

// Pantalla partida con dos escenas y etiquetas (por ejemplo OUTSIDE / INSIDE).
export const Dividida: React.FC<ConDuracion & { izq: React.ReactNode; der: React.ReactNode; etiquetas: [string, string] }> = ({ duracion, izq, der, etiquetas }) => {
  const f = useCurrentFrame();
  const corte = interpolate(f, [0, 14], [100, 50], fijo);
  return (
    <AbsoluteFill style={{ background: crimen.negro }}>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - corte}% 0 0)` }}>{izq}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${corte}%)` }}>{der}</AbsoluteFill>
      <div style={{ position: 'absolute', left: `${corte}%`, top: 0, bottom: 0, width: 8, background: crimen.rojo, transform: 'translateX(-4px)' }} />
      {etiquetas.map((e, i) => (
        <div key={e} style={{ position: 'absolute', top: 60, [i ? 'right' : 'left']: 80, fontFamily: letra.titulo, fontSize: 70, color: crimen.hueso, background: 'rgba(10,10,13,0.75)', padding: '4px 22px', opacity: ap(f, 14, 24) }}>{e}</div>
      ))}
    </AbsoluteFill>
  );
};

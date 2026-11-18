import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FUENTE_TEXTO, FUENTE_TITULO, neon } from './estilo';

// Escenas del formato "¿Real o hype?": etiquetas de verificación, veredictos, fichas, esquema y marcador.
export type ClaveEtiqueta = 'confirmado' | 'visto' | 'interpretacion' | 'rumor' | 'deseo' | 'sindatos';
export const ETIQUETAS: Record<ClaveEtiqueta, { texto: string; color: string; desc: string }> = {
  confirmado: { texto: 'CONFIRMADO', color: '#3dff9a', desc: 'Lo dice Rockstar o Take-Two por escrito' },
  visto: { texto: 'SE VE EN LO OFICIAL', color: '#29b6ff', desc: 'Aparece en material oficial, sin explicar' },
  interpretacion: { texto: 'INTERPRETACIÓN', color: '#ffd23f', desc: 'Deducción nuestra o de la comunidad' },
  rumor: { texto: 'RUMOR', color: '#ff3b3b', desc: 'Medios o filtradores, sin confirmar' },
  deseo: { texto: 'DESEO', color: '#b06cff', desc: 'Lo que nos gustaría que pasara' },
  sindatos: { texto: 'NO ANUNCIADO', color: '#b9b4c9', desc: 'No hay información oficial' },
};
const ORDEN: ClaveEtiqueta[] = ['confirmado', 'visto', 'interpretacion', 'rumor', 'deseo'];

const tx = (tam: number, color = C.blanco, peso = 800): React.CSSProperties => ({ fontFamily: FUENTE_TEXTO, fontSize: tam, color, fontWeight: peso });

export const Sellito: React.FC<{ e: ClaveEtiqueta; tam?: number; rot?: number; style?: React.CSSProperties }> = ({ e, tam = 40, rot = -6, style }) => {
  const d = ETIQUETAS[e];
  return (
    <div style={{ display: 'inline-block', transform: `rotate(${rot}deg)`, border: `${Math.max(4, tam / 8)}px solid ${d.color}`, borderRadius: tam / 3, padding: `${tam * 0.15}px ${tam * 0.5}px`, fontFamily: FUENTE_TITULO, fontSize: tam, color: d.color, textShadow: neon(d.color, 0.4), background: 'rgba(10,5,30,0.75)', whiteSpace: 'nowrap', ...style }}>
      {d.texto}
    </div>
  );
};

export const Etiquetas: React.FC<{ desde?: number; hasta?: number; activa?: ClaveEtiqueta; duracion: number }> = ({ desde = 0, hasta = 5, activa, duracion }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nuevas = Math.max(1, hasta - desde);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 84, color: C.blanco, textShadow: neon(C.rosa) }}>LAS 5 ETIQUETAS</div>
      {ORDEN.map((k, i) => {
        const r = i < desde ? -100 : Math.round(8 + ((i - desde) * duracion * 0.75) / nuevas);
        const visible = i < hasta || (i < desde);
        const s = visible ? spring({ frame: f - r, fps, config: { damping: 12, stiffness: 160 } }) : 0;
        const on = activa ? activa === k : i >= desde && i < hasta && f >= r;
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 30, width: 1100, opacity: s * (activa && !on ? 0.35 : 1), transform: `translateX(${(1 - s) * -80}px) scale(${on && activa ? 1.06 : 1})` }}>
            <div style={{ width: 360, display: 'flex', justifyContent: 'center' }}><Sellito e={k} tam={44} rot={-4} /></div>
            <div style={{ ...tx(40), textShadow: '0 3px 12px #000' }}>{ETIQUETAS[k].desc}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Icono: React.FC<{ i?: string }> = ({ i }) => {
  if (i === 'trebol')
    return (
      <svg width={150} height={150} viewBox="-75 -75 150 150">
        {[0, 90, 180, 270].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 26} cy={Math.sin((a * Math.PI) / 180) * 26} r={26} fill={C.verde} stroke="#0b6b3f" strokeWidth={4} />)}
        <path d="M0 0 Q 10 40 30 66" stroke="#0b6b3f" strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
    );
  return null;
};

export const Veredicto: React.FC<{ afirmacion: string; etiqueta: ClaveEtiqueta | 'pendiente'; detalle?: string; fuente?: string; icono?: string }> = ({ afirmacion, etiqueta, detalle, fuente, icono }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sCard = spring({ frame: f, fps, config: { damping: 15 } });
  const sSello = spring({ frame: f - 14, fps, config: { damping: 9, stiffness: 220 } });
  const pendiente = etiqueta === 'pendiente';
  const col = pendiente ? C.rosa : ETIQUETAS[etiqueta].color;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${0.85 + sCard * 0.15})`, opacity: Math.min(1, sCard * 1.5), width: 1300, borderRadius: 34, border: `4px solid ${col}`, background: 'rgba(12,6,34,0.85)', boxShadow: `0 0 40px ${col}66`, padding: '40px 60px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>
        <div style={{ ...tx(32, '#d9c8f0', 900), letterSpacing: 8 }}>AFIRMACIÓN</div>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: afirmacion.length > 34 ? 76 : afirmacion.length > 20 ? 90 : 110, color: C.blanco, textAlign: 'center', lineHeight: 1.05, textShadow: '0 4px 0 #0b0820' }}>“{afirmacion}”</div>
        {icono && <Icono i={icono} />}
        {pendiente ? (
          <div style={{ fontFamily: FUENTE_TITULO, fontSize: 120, color: C.rosa, textShadow: neon(C.rosa), opacity: 0.6 + 0.4 * Math.abs(Math.sin(f / 8)) }}>¿?</div>
        ) : (
          <div style={{ transform: `scale(${interpolate(sSello, [0, 1], [2.4, 1])})`, opacity: Math.min(1, sSello * 2) }}>
            <Sellito e={etiqueta} tam={96} rot={-6} />
          </div>
        )}
        {detalle && !pendiente && <div style={{ ...tx(46, C.blanco, 900), textAlign: 'center', opacity: interpolate(f, [26, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>{detalle}</div>}
        {fuente && !pendiente && <div style={{ ...tx(28, '#bfb0dd', 700), opacity: interpolate(f, [30, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Fuente: {fuente}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const FichaEscena: React.FC<{ nombre: string; lineas: string[]; etiqueta: ClaveEtiqueta; fuente?: string; duracion: number }> = ({ nombre, lineas, etiqueta, fuente, duracion }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  const sSello = spring({ frame: f - Math.round(duracion * 0.7), fps, config: { damping: 9, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `rotate(-2deg) translateY(${(1 - s) * 120}px)`, opacity: Math.min(1, s * 1.4), width: 1180, minHeight: 640, background: '#f1e6cc', borderRadius: 14, boxShadow: '0 30px 60px #000a', padding: '50px 70px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -34, left: 60, width: 260, height: 50, background: '#e3d2a9', borderRadius: '14px 14px 0 0' }} />
        <div style={{ ...tx(30, '#7a6a4a', 900), letterSpacing: 8 }}>EXPEDIENTE · PERFIL OFICIAL</div>
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 104, color: '#1a1226', marginTop: 8 }}>{nombre}</div>
        <div style={{ height: 6, background: C.rosa, width: 200, margin: '10px 0 26px' }} />
        {lineas.map((l, i) => {
          const r = Math.round(10 + (i * duracion * 0.55) / lineas.length);
          return (
            <div key={i} style={{ ...tx(46, '#2a2236', 800), margin: '10px 0', opacity: interpolate(f, [r, r + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateX(${interpolate(f, [r, r + 8], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
              ▸ {l}
            </div>
          );
        })}
        {fuente && <div style={{ ...tx(26, '#7a6a4a', 700), marginTop: 26 }}>Fuente: {fuente}</div>}
        <div style={{ position: 'absolute', right: 50, top: 60, transform: `scale(${interpolate(sSello, [0, 1], [2.4, 1])})`, opacity: Math.min(1, sSello * 2) }}>
          <Sellito e={etiqueta} tam={56} rot={10} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FichasEscena: React.FC<{ titulo: string; items: { nombre: string; rasgo: string }[]; progresivo?: boolean; duracion: number }> = ({ titulo, items, progresivo, duracion }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = items.length > 4 ? 3 : 2;
  const paso = progresivo ? (duracion * 0.8) / items.length : 6;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 84, color: C.blanco, textShadow: neon(C.rosa) }}>{titulo}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 480px)`, gap: 28 }}>
        {items.map((it, i) => {
          const r = Math.round(8 + i * paso);
          const s = spring({ frame: f - r, fps, config: { damping: 13 } });
          const activo = progresivo && f >= r && (i === items.length - 1 || f < Math.round(8 + (i + 1) * paso));
          const col = [C.cian, C.rosa, C.amarillo][i % 3];
          return (
            <div key={i} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 60}px) scale(${activo ? 1.05 : 1})`, background: '#f1e6cc', borderRadius: 14, borderLeft: `14px solid ${col}`, padding: '24px 30px', boxShadow: activo ? `0 0 34px ${col}` : '0 12px 30px #0008' }}>
              <div style={{ fontFamily: FUENTE_TITULO, fontSize: 56, color: '#1a1226' }}>{it.nombre}</div>
              <div style={{ ...tx(34, '#3a3048', 800) }}>{it.rasgo}</div>
            </div>
          );
        })}
      </div>
      <div style={{ ...tx(26, '#d9c8f0', 700) }}>Según los perfiles oficiales · rockstargames.com</div>
    </AbsoluteFill>
  );
};

// Esquema propio y abstracto de Leónida: no calca ningún mapa (ni oficial ni de fans).
const PUNTOS = [
  { n: 'Monte Kalaga', x: 520, y: 150, c: C.verde },
  { n: 'Port Gellhorn', x: 300, y: 270, c: C.naranja },
  { n: 'Ambrosía', x: 640, y: 290, c: C.amarillo },
  { n: 'Grassrivers', x: 470, y: 470, c: '#7dffb0' },
  { n: 'Vice City', x: 720, y: 560, c: C.rosa },
  { n: 'Cayos de Leónida', x: 470, y: 760, c: C.cian },
];
export const EsquemaEscena: React.FC<{ nota?: string; duracion: number }> = ({ nota, duracion }) => {
  const f = useCurrentFrame();
  const dib = interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <svg width={1000} height={880} viewBox="0 0 1000 880">
        <rect x={150} y={70} width={720} height={640} rx={260} fill="#1c1048" stroke={C.cian} strokeWidth={6} strokeDasharray="3000" strokeDashoffset={3000 * (1 - dib)} />
        {[[420, 780], [520, 800], [600, 790]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={40} ry={16} fill="#1c1048" stroke={C.cian} strokeWidth={4} opacity={dib} />)}
        {PUNTOS.map((p, i) => {
          const r = Math.round(14 + (i * duracion * 0.6) / PUNTOS.length);
          const s = spring({ frame: f - r, fps: 30, config: { damping: 11 } });
          return (
            <g key={p.n} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
              <circle r={26} fill={p.c} opacity={0.3} />
              <circle r={13} fill={p.c} />
              <text y={-34} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={46} fill={C.blanco} stroke="#0b0820" strokeWidth={8} paintOrder="stroke">{p.n}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ ...tx(32, C.amarillo, 900), textShadow: '0 3px 12px #000' }}>{nota ?? 'LEÓNIDA · zonas nombradas por Rockstar'}</div>
      <div style={{ ...tx(24, '#d9c8f0', 700) }}>Esquema del canal: posiciones orientativas, no es un mapa</div>
    </AbsoluteFill>
  );
};

export const MarcadorEscena: React.FC<{ filas: { texto: string; etiqueta: ClaveEtiqueta }[]; revelar: 'nada' | 'progresivo' | 'todo'; puntos?: string; duracion: number }> = ({ filas, revelar, puntos, duracion }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 }}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 84, color: C.blanco, textShadow: neon(C.amarillo) }}>EL MARCADOR DE LEO</div>
      {filas.map((fl, i) => {
        const r = revelar === 'todo' ? -100 : revelar === 'nada' ? 99999 : Math.round(10 + (i * duracion * 0.85) / filas.length);
        const s = spring({ frame: f - r, fps, config: { damping: 9, stiffness: 220 } });
        return (
          <div key={i} style={{ width: 1200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(12,6,34,0.85)', border: '3px solid #3a2a70', borderRadius: 18, padding: '14px 30px' }}>
            <div style={{ ...tx(44, C.blanco, 900) }}>{fl.texto}</div>
            <div style={{ minWidth: 380, display: 'flex', justifyContent: 'flex-end' }}>
              {f >= r ? <div style={{ transform: `scale(${interpolate(s, [0, 1], [2, 1])})` }}><Sellito e={fl.etiqueta} tam={40} rot={-4} /></div> : <div style={{ fontFamily: FUENTE_TITULO, fontSize: 48, color: '#5a4a8a' }}>???</div>}
            </div>
          </div>
        );
      })}
      {puntos && (
        <div style={{ fontFamily: FUENTE_TITULO, fontSize: 130, color: C.rojo, textShadow: neon(C.rojo), transform: `scale(${spring({ frame: f - 4, fps, config: { damping: 8 } })})` }}>{puntos}</div>
      )}
    </AbsoluteFill>
  );
};

export const PlatoEscena: React.FC<{ titulo: string }> = ({ titulo }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 70, padding: '20px 60px', borderRadius: 26, border: `5px solid ${C.rosa}`, background: 'rgba(12,6,34,0.8)', boxShadow: `0 0 40px ${C.rosa}88`, fontFamily: FUENTE_TITULO, fontSize: 110, color: C.blanco, textShadow: neon(C.rosa, 0.9 + 0.1 * Math.sin(f / 6)) }}>{titulo}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 210, background: 'linear-gradient(180deg, #2a1650, #120a2a)', borderTop: `6px solid ${C.cian}`, boxShadow: `0 -10px 40px ${C.cian}55` }} />
    </AbsoluteFill>
  );
};

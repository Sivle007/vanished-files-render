// Segunda tanda de escenas: planos de detalle y recursos para preguntas y giros de la historia.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { color, fuente } from './estilo';
import { ALTO, ANCHO, Barco, Dato, HORIZONTE, Lienzo, Marinero } from './elementos';
import { Fondo, TipoFondo } from './escenas';

type ConDuracion = { duracion: number };
type ConDato = { dato?: { etiqueta: string; valor: string } };
const fijo = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const avance = (frame: number, desde: number, hasta: number) => interpolate(frame, [desde, hasta], [0, 1], fijo);
const DatoOpcional: React.FC<ConDato> = ({ dato }) => (dato ? <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} /> : null);

// Barco grande en primer plano con faroles encendidos y la tripulacion en cubierta.
export const BarcoCerca: React.FC<ConDuracion & ConDato & { fondo?: TipoFondo; nombre?: string }> = ({ duracion, dato, fondo = 'aurora', nombre }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duracion], [880, 1040]);
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} nieve={70} />
        <g transform={`translate(${x} 760) scale(2.4)`}>
          <Barco x={0} y={0} escala={1} />
          {[-120, -80, -40, 0, 40, 80].map((mx, i) => (
            <Marinero key={i} x={mx} y={-2} escala={0.55} relleno={color.noche} />
          ))}
          {[-150, -60, 60].map((fx, i) => (
            <g key={fx}>
              <circle cx={fx} cy={-14} r={4} fill={color.ambar} opacity={0.7 + 0.3 * Math.sin(frame / 7 + i)} />
              <circle cx={fx} cy={-14} r={16} fill={color.ambar} opacity={0.18} />
            </g>
          ))}
        </g>
        {nombre && (
          <text x={x} y={150} textAnchor="middle" fontFamily={fuente.texto} fontWeight={800} fontSize={40} letterSpacing={10} fill={color.ambar} opacity={avance(frame, 8, 20)}>{nombre}</text>
        )}
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Interior de un camarote: madera, farol que se balancea y un ojo de buey con nieve.
export const Camarote: React.FC<ConDuracion & ConDato & { libro?: boolean }> = ({ duracion, dato, libro = true }) => {
  const frame = useCurrentFrame();
  const giro = Math.sin(frame / 22) * 7;
  const luz = 0.85 + 0.15 * Math.sin(frame / 5);
  return (
    <>
      <Lienzo zoom={interpolate(frame, [0, duracion], [1, 1.06])}>
        <rect width={ANCHO} height={ALTO} fill="#2A1A10" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={i * 120} y={0} width={116} height={ALTO} fill={i % 2 ? '#3A2416' : '#33200F'} />
        ))}
        <circle cx={1420} cy={380} r={150} fill="#0D1B2C" stroke="#8A6A3A" strokeWidth={22} />
        {Array.from({ length: 30 }, (_, i) => {
          const y = ((random(`cy${i}`) * 300 + frame * (1 + random(`cv${i}`))) % 300) + 230;
          const xx = 1300 + random(`cx${i}`) * 240;
          return Math.hypot(xx - 1420, y - 380) < 140 ? <circle key={i} cx={xx} cy={y} r={2 + random(`cr${i}`) * 2} fill={color.blanco} opacity={0.8} /> : null;
        })}
        <rect x={0} y={760} width={ANCHO} height={ALTO - 760} fill="#1C120A" />
        <rect x={420} y={700} width={900} height={40} rx={8} fill="#5A3A1E" />
        {libro && (
          <g transform="translate(700 690)">
            <rect x={0} y={-22} width={260} height={24} rx={4} fill="#6B2E22" />
            <rect x={8} y={-30} width={244} height={10} rx={3} fill="#E6DCC4" />
          </g>
        )}
        <g transform={`translate(1060 160) rotate(${giro})`}>
          <line x1={0} y1={0} x2={0} y2={300} stroke="#8A6A3A" strokeWidth={6} />
          <rect x={-40} y={300} width={80} height={110} rx={14} fill="#3B2A18" stroke="#C9A25A" strokeWidth={5} />
          <circle cx={0} cy={355} r={26} fill="#FFD27A" opacity={luz} />
        </g>
        <circle cx={1060} cy={520} r={520} fill="#F0A43A" opacity={0.12 * luz} />
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Placa de hielo que se agrieta alrededor del casco.
export const HieloRompiendo: React.FC<ConDuracion & ConDato> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  const p = avance(frame, 0, duracion * 0.8);
  const grietas = ['M960,640 L820,720 L700,700 L560,820', 'M960,640 L1080,760 L1240,740 L1380,880', 'M960,640 L940,820 L1000,980', 'M960,640 L760,560 L600,600', 'M960,640 L1180,580 L1360,620'];
  const temblor = Math.sin(frame * 1.7) * 2 * p;
  return (
    <>
      <Lienzo>
        <Fondo tipo="polar" mar={false} nieve={60} />
        <rect y={HORIZONTE - 60} width={ANCHO} height={ALTO} fill="#9FC9D6" opacity={0.85} />
        <rect y={HORIZONTE - 60} width={ANCHO} height={ALTO} fill="#DDEFF4" opacity={0.25} />
        <g transform={`translate(${temblor} 0)`}>
          <Barco x={960} y={660} escala={1.3} tono="#14202E" />
        </g>
        {grietas.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#1B3A4E" strokeWidth={6} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - Math.min(1, p * 1.4 - i * 0.1))} />
        ))}
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Linea del tiempo con fechas que se encienden en orden.
export const LineaTiempo: React.FC<ConDuracion & { hitos: { anio: string; texto: string }[]; activo?: number }> = ({ duracion, hitos, activo }) => {
  const frame = useCurrentFrame();
  const encendidos = activo ?? Math.floor(interpolate(frame, [10, duracion * 0.8], [0, hitos.length], fijo));
  const ancho = 1500;
  return (
    <>
      <Lienzo>
        <Fondo tipo="noche" mar={false} nieve={30} />
        <line x1={210} x2={210 + ancho * avance(frame, 0, 20)} y1={560} y2={560} stroke={color.hieloClaro} strokeOpacity={0.6} strokeWidth={4} />
      </Lienzo>
      <AbsoluteFill>
        {hitos.map((h, i) => {
          const x = 210 + (ancho / (hitos.length - 1)) * i;
          const on = activo !== undefined ? i === activo : i < encendidos;
          return (
            <div key={i} style={{ position: 'absolute', left: x - 120, width: 240, top: 500, textAlign: 'center', opacity: avance(frame, 6 + i * 6, 16 + i * 6) }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, margin: '0 auto', background: on ? color.ambar : color.profundo, border: `4px solid ${on ? color.ambar : color.hielo}`, boxShadow: on ? `0 0 30px ${color.ambar}` : 'none', transform: 'translateY(46px)' }} />
              <div style={{ marginTop: 70, fontFamily: fuente.titulo, fontSize: on ? 56 : 44, fontWeight: 700, color: on ? color.blanco : color.hieloClaro }}>{h.anio}</div>
              <div style={{ fontFamily: fuente.texto, fontSize: 20, letterSpacing: 4, fontWeight: 800, color: on ? color.ambar : color.hieloClaro, opacity: on ? 1 : 0.6 }}>{h.texto}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </>
  );
};

// Vista a traves de un catalejo: un circulo de imagen sobre negro que barre el horizonte.
export const Telescopio: React.FC<ConDuracion & { objetivo: 'barcos' | 'barco-helado' | 'cairn'; fondo?: TipoFondo }> = ({ duracion, objetivo, fondo = 'crepusculo' }) => {
  const frame = useCurrentFrame();
  const barrido = interpolate(frame, [0, duracion * 0.6], [-260, 0], fijo);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ clipPath: 'circle(30% at 50% 50%)', transform: `translateX(${barrido}px) scale(1.6)` }}>
        <Lienzo>
          <Fondo tipo={fondo} nieve={40} />
          {objetivo === 'barcos' && (
            <>
              <Barco x={880} y={705} escala={0.5} />
              <Barco x={1080} y={700} escala={0.4} fase={1.2} />
            </>
          )}
          {objetivo === 'barco-helado' && <Barco x={960} y={710} escala={0.55} tono="#0A1220" />}
          {objetivo === 'cairn' && Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={930 + (i % 3) * 30} cy={700 - Math.floor(i / 3) * 24} rx={22} ry={16} fill="#2A3C4C" />)}
        </Lienzo>
      </AbsoluteFill>
      <AbsoluteFill style={{ border: 'none', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '60vh', height: '60vh', borderRadius: '50%', boxShadow: `0 0 0 6px ${color.ambar}55 inset` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: 2, height: '60vh', background: `${color.hieloClaro}44` }} />
        <div style={{ position: 'absolute', height: 2, width: '60vh', background: `${color.hieloClaro}44` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Brujula con la aguja girando sin decidirse: "hacia donde fueron".
export const Brujula: React.FC<ConDuracion & ConDato> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  const aguja = Math.sin(frame / 9) * 70 + Math.sin(frame / 23) * 50 + interpolate(frame, [0, duracion], [0, 160]);
  return (
    <>
      <Lienzo>
        <Fondo tipo="amanecer" mar={false} nieve={40} />
        <g transform="translate(960 540)">
          <circle r={300} fill="#1B1426" stroke={color.ambar} strokeWidth={8} />
          <circle r={270} fill="none" stroke={color.ambar} strokeOpacity={0.3} strokeWidth={2} />
          {['N', 'E', 'S', 'W'].map((l, i) => (
            <text key={l} x={Math.sin((i * Math.PI) / 2) * 220} y={-Math.cos((i * Math.PI) / 2) * 220 + 18} textAnchor="middle" fontFamily={fuente.titulo} fontSize={56} fontWeight={700} fill={color.blanco}>{l}</text>
          ))}
          <g transform={`rotate(${aguja})`}>
            <path d="M0,-200 L22,0 L-22,0 Z" fill={color.rojo} />
            <path d="M0,200 L22,0 L-22,0 Z" fill={color.hieloClaro} />
            <circle r={16} fill={color.ambar} />
          </g>
        </g>
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Oso polar caminando despacio por el hielo: vida en un paisaje vacio.
export const Fauna: React.FC<ConDuracion & ConDato & { fondo?: TipoFondo }> = ({ duracion, dato, fondo = 'aurora' }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duracion], [520, 1100]);
  const paso = Math.sin(frame / 5) * 6;
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} tierra nieve={60} />
        <g transform={`translate(${x} 830) scale(1.6)`} fill="#E3ECEF">
          <ellipse cx={0} cy={-40} rx={80} ry={40} />
          <ellipse cx={78} cy={-58} rx={30} ry={22} />
          <circle cx={98} cy={-74} r={8} />
          <rect x={-60} y={-14} width={20} height={34 + paso} rx={8} />
          <rect x={-25} y={-14} width={20} height={34 - paso} rx={8} />
          <rect x={25} y={-14} width={20} height={34 + paso} rx={8} />
          <rect x={55} y={-14} width={20} height={34 - paso} rx={8} />
          <circle cx={104} cy={-60} r={3} fill={color.noche} />
        </g>
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Gran pregunta en pantalla: abre un bucle de la historia.
export const Pregunta: React.FC<ConDuracion & { texto: string; sub?: string; fondo?: TipoFondo }> = ({ texto, sub, fondo = 'tormenta' }) => {
  const frame = useCurrentFrame();
  const o = avance(frame, 3, 12);
  const pulso = 1 + 0.02 * Math.sin(frame / 6);
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} nieve={80} />
      </Lienzo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ opacity: o, transform: `scale(${(0.9 + 0.1 * o) * pulso})`, fontFamily: fuente.titulo, fontWeight: 700, fontSize: 110, color: color.blanco, textShadow: `0 0 40px ${color.rojo}88`, padding: '0 140px' }}>{texto}</div>
        {sub && <div style={{ opacity: avance(frame, 14, 26), fontFamily: fuente.texto, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: color.ambar, marginTop: 20 }}>{sub}</div>}
      </AbsoluteFill>
    </>
  );
};

// Giro: destello y temblor con una frase corta, para los momentos que cambian la historia.
export const Giro: React.FC<ConDuracion & { texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const destello = interpolate(frame, [0, 3, 12], [0.9, 0.5, 0], fijo);
  const temblor = interpolate(frame, [0, 14], [14, 0], fijo) * Math.sin(frame * 2.3);
  return (
    <AbsoluteFill style={{ background: '#1A0608' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${color.rojo}66, transparent 60%)` }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateX(${temblor}px)` }}>
        <div style={{ fontFamily: fuente.titulo, fontWeight: 700, fontSize: 130, color: color.blanco, textAlign: 'center', padding: '0 120px' }}>{texto}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#FFF', opacity: destello }} />
    </AbsoluteFill>
  );
};

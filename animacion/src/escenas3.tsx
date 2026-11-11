// Escenas de la Parte 2 de Franklin: ciencia, pecios y ADN.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { color, fuente } from './estilo';
import { ALTO, ANCHO, Barco, Dato, Lienzo } from './elementos';
import { Fondo } from './escenas';

type ConDuracion = { duracion: number };
type ConDato = { dato?: { etiqueta: string; valor: string } };
const fijo = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const avance = (frame: number, desde: number, hasta: number) => interpolate(frame, [desde, hasta], [0, 1], fijo);
const DatoOpcional: React.FC<ConDato> = ({ dato }) => (dato ? <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} /> : null);

// Estante con latas de conserva soldadas, iluminado por un farol.
export const Latas: React.FC<ConDuracion & ConDato & { resaltar?: boolean }> = ({ duracion, dato, resaltar = false }) => {
  const frame = useCurrentFrame();
  const luz = 0.85 + 0.15 * Math.sin(frame / 6);
  const marca = avance(frame, duracion * 0.35, duracion * 0.55);
  return (
    <>
      <Lienzo zoom={interpolate(frame, [0, duracion], [1, 1.08])}>
        <rect width={ANCHO} height={ALTO} fill="#24160C" />
        {[380, 640, 900].map((y) => <rect key={y} x={240} y={y} width={1440} height={22} rx={6} fill="#5A3A1E" />)}
        {[380, 640, 900].flatMap((y, f) =>
          Array.from({ length: 9 }, (_, i) => {
            const x = 300 + i * 150 + (f % 2) * 40;
            return (
              <g key={`${f}-${i}`}>
                <rect x={x} y={y - 150} width={100} height={150} rx={10} fill="#8C9399" />
                <rect x={x} y={y - 120} width={100} height={70} fill={['#7A2E22', '#2E4A6B', '#6B5A2E'][(i + f) % 3]} />
                <rect x={x} y={y - 150} width={100} height={10} rx={4} fill="#B9C3C9" />
                {resaltar && <rect x={x - 4} y={y - 152} width={108} height={14} rx={6} fill="none" stroke={color.ambar} strokeWidth={4} opacity={marca} />}
              </g>
            );
          }),
        )}
        <circle cx={1500} cy={300} r={500} fill="#F0A43A" opacity={0.12 * luz} />
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Laboratorio: tubos de muestra y una doble helice de ADN girando.
export const Laboratorio: React.FC<ConDuracion & ConDato> = ({ dato }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <defs>
          <linearGradient id="lab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B1E2B" />
            <stop offset="1" stopColor="#06121B" />
          </linearGradient>
        </defs>
        <rect width={ANCHO} height={ALTO} fill="url(#lab)" />
        {Array.from({ length: 26 }, (_, i) => {
          const y = 140 + i * 30;
          const fase = frame / 14 + i * 0.45;
          const a = 1300 + Math.sin(fase) * 160;
          const b = 1300 - Math.sin(fase) * 160;
          const delante = Math.cos(fase) > 0;
          return (
            <g key={i}>
              <line x1={a} y1={y} x2={b} y2={y} stroke={i % 2 ? '#38D39F' : '#8E5BD8'} strokeWidth={5} opacity={0.6} />
              <circle cx={a} cy={y} r={11} fill={delante ? '#5FD3E0' : '#2C6E80'} />
              <circle cx={b} cy={y} r={11} fill={delante ? '#2C6E80' : '#E79A5B'} />
            </g>
          );
        })}
        <rect x={120} y={760} width={900} height={24} rx={8} fill="#1E3646" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${200 + i * 110} 760)`}>
            <rect x={-20} y={-180} width={40} height={180} rx={18} fill="none" stroke={color.hieloClaro} strokeWidth={4} />
            <rect x={-16} y={-70 - random(`tl${i}`) * 60} width={32} height={66 + random(`tl${i}`) * 60} rx={14} fill={['#38D39F', '#8E5BD8', '#E79A5B', '#5FD3E0'][i % 4]} opacity={0.7 + 0.2 * Math.sin(frame / 10 + i)} />
          </g>
        ))}
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Fichas de los marineros identificados por ADN, que se iluminan una a una.
export const PanelADN: React.FC<ConDuracion & { nombres: { nombre: string; barco: string }[]; destacar?: number[] }> = ({ duracion, nombres, destacar }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <Fondo tipo="aurora" mar={false} nieve={30} />
      </Lienzo>
      <AbsoluteFill style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 34, padding: '0 180px' }}>
        {nombres.map((n, i) => {
          const o = avance(frame, 6 + i * ((duracion * 0.6) / nombres.length), 18 + i * ((duracion * 0.6) / nombres.length));
          const on = destacar ? destacar.includes(i) : true;
          return (
            <div key={n.nombre} style={{
              opacity: o * (on ? 1 : 0.4), transform: `translateY(${(1 - o) * 30}px)`, width: 460, padding: '30px 24px', borderRadius: 16, textAlign: 'center',
              background: 'rgba(6,11,22,0.78)', border: `3px solid ${on ? color.ambar : color.hielo}`, boxShadow: on ? `0 0 34px ${color.ambar}44` : 'none',
            }}>
              <div style={{ fontFamily: fuente.texto, fontSize: 22, letterSpacing: 6, fontWeight: 800, color: color.ambar }}>{n.barco}</div>
              <div style={{ fontFamily: fuente.titulo, fontSize: 46, fontWeight: 700, color: color.blanco, marginTop: 8 }}>{n.nombre}</div>
              <div style={{ fontFamily: fuente.texto, fontSize: 18, letterSpacing: 5, fontWeight: 800, color: '#38D39F', marginTop: 10 }}>IDENTIFIED BY DNA</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </>
  );
};

// Pantalla de sonar: un barrido circular que va revelando la silueta de un casco.
export const Sonar: React.FC<ConDuracion & ConDato> = ({ duracion, dato }) => {
  const frame = useCurrentFrame();
  const angulo = (frame * 4) % 360;
  const revelado = avance(frame, duracion * 0.25, duracion * 0.7);
  return (
    <>
      <AbsoluteFill style={{ background: '#03110E' }}>
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%" height="100%">
          <g transform="translate(960 540)">
            {[120, 240, 360, 470].map((r) => <circle key={r} r={r} fill="none" stroke="#1F7A55" strokeOpacity={0.5} strokeWidth={2} />)}
            <line x1={-470} x2={470} y1={0} y2={0} stroke="#1F7A55" strokeOpacity={0.4} />
            <line y1={-470} y2={470} x1={0} x2={0} stroke="#1F7A55" strokeOpacity={0.4} />
            <path d="M0,0 L470,0 A470,470 0 0,0 407,-235 Z" fill="#38D39F" opacity={0.25} transform={`rotate(${angulo})`} />
            <g opacity={revelado} transform="translate(90 70) rotate(-12)">
              <path d="M-170,0 L170,0 L140,42 L-150,42 Z" fill="#7CF0B8" opacity={0.85} />
              {[-95, 0, 90].map((mx) => <rect key={mx} x={mx - 4} y={-150} width={8} height={150} fill="#7CF0B8" opacity={0.6} />)}
            </g>
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={i} cx={(random(`sx${i}`) - 0.5) * 900} cy={(random(`sy${i}`) - 0.5) * 900} r={2} fill="#38D39F" opacity={0.3 + 0.3 * Math.sin(frame / 5 + i)} />
            ))}
          </g>
        </svg>
      </AbsoluteFill>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Interior del barco hundido recorrido por la luz de un robot submarino; cajones cerrados.
export const InteriorHundido: React.FC<ConDuracion & ConDato & { cajones?: boolean }> = ({ duracion, dato, cajones = true }) => {
  const frame = useCurrentFrame();
  const foco = { x: interpolate(frame, [0, duracion], [520, 1300]), y: 560 + Math.sin(frame / 20) * 60 };
  return (
    <>
      <AbsoluteFill style={{ background: '#021015' }}>
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%" height="100%">
          <defs>
            {/* Fuera del foco la escena queda en penumbra (no en negro) para que siempre se lea. */}
            <radialGradient id="foco" cx={foco.x / ANCHO} cy={foco.y / ALTO} r="0.45">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.35" />
            </radialGradient>
            <mask id="luz">
              <rect width={ANCHO} height={ALTO} fill="url(#foco)" />
            </mask>
          </defs>
          <g mask="url(#luz)">
            <rect width={ANCHO} height={ALTO} fill="#2F5A60" />
            {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 140} y={0} width={136} height={ALTO} fill={i % 2 ? '#3A6870' : '#336068'} />)}
            {cajones && (
              <g transform="translate(700 620)">
                <rect x={0} y={0} width={560} height={260} rx={10} fill="#5E7468" />
                {[0, 1].map((r) => [0, 1, 2].map((c) => (
                  <g key={`${r}${c}`}>
                    <rect x={20 + c * 180} y={20 + r * 120} width={160} height={100} rx={6} fill="#4A5E52" stroke="#8FA394" strokeWidth={3} />
                    <circle cx={100 + c * 180} cy={70 + r * 120} r={8} fill="#8A9A80" />
                  </g>
                )))}
                <rect x={-20} y={-30} width={600} height={40} rx={8} fill="#4A5A50" />
              </g>
            )}
            <rect x={300} y={300} width={260} height={18} rx={6} fill="#4A5A50" />
            {[0, 1, 2].map((i) => <ellipse key={i} cx={340 + i * 80} cy={290} rx={30} ry={12} fill="#9AA79F" />)}
            {/* Estante con botellas, una puerta de camarote y una viga caida. */}
            <rect x={300} y={470} width={300} height={16} rx={6} fill="#5E7468" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={318 + i * 55} y={400} width={26} height={70} rx={10} fill={['#6F8F5A', '#8A7A4A', '#5E7E88'][i % 3]} />)}
            <path d="M1420,900 L1420,330 Q1520,270 1620,330 L1620,900" fill="#24454A" stroke="#8FA394" strokeWidth={8} />
            <circle cx={1590} cy={620} r={10} fill="#B9A86A" />
            <rect x={150} y={760} width={620} height={34} rx={8} fill="#55665C" transform="rotate(-14 460 777)" />
            <rect y={900} width={ANCHO} height={180} fill="#38463F" opacity={0.9} />
          </g>
          {Array.from({ length: 60 }, (_, i) => {
            const x = (random(`px${i}`) * ANCHO + frame * 0.4) % ANCHO;
            const y = (random(`py${i}`) * ALTO - frame * 0.3 + ALTO) % ALTO;
            return <circle key={i} cx={x} cy={y} r={1.5 + random(`pr${i}`) * 2} fill="#CFE8E0" opacity={0.25} />;
          })}
        </svg>
      </AbsoluteFill>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Barco de investigacion moderno navegando entre placas de hielo.
export const BarcoInvestigacion: React.FC<ConDuracion & ConDato & { fondo?: 'aurora' | 'amanecer' | 'polar' }> = ({ duracion, dato, fondo = 'amanecer' }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duracion], [600, 1100]);
  return (
    <>
      <Lienzo>
        <Fondo tipo={fondo} nieve={30} />
        <g transform={`translate(${x} 740) scale(1.3)`}>
          <path d="M-200,0 L200,0 L170,46 L-180,46 Z" fill="#B8402F" />
          <rect x={-120} y={-70} width={170} height={70} rx={6} fill="#E9F0F2" />
          <rect x={-100} y={-110} width={110} height={40} rx={6} fill="#E9F0F2" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-108 + i * 38} y={-58} width={26} height={18} rx={3} fill="#1B2A36" />)}
          <rect x={80} y={-90} width={10} height={90} fill="#E9F0F2" />
          <circle cx={-40} cy={-118} r={6} fill={color.ambar} opacity={0.6 + 0.4 * Math.sin(frame / 6)} />
        </g>
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

// Faro en una isla rocosa con el haz girando (para recomendar el caso de las Flannan Isles).
export const Faro: React.FC<ConDuracion & ConDato> = ({ dato }) => {
  const frame = useCurrentFrame();
  const giro = (frame * 2.2) % 360;
  return (
    <>
      <Lienzo>
        <Fondo tipo="tormenta" nieve={0} />
        <path d="M700,760 C780,640 900,600 1000,610 C1120,620 1200,680 1260,760 Z" fill="#101A26" />
        <path d="M930,620 L950,420 L990,420 L1010,620 Z" fill="#D9DEE2" />
        <rect x={940} y={390} width={60} height={34} rx={6} fill="#22303C" />
        <circle cx={970} cy={405} r={14} fill="#FFE29A" />
        <g transform={`translate(970 405) rotate(${giro})`}>
          <path d="M0,-10 L1400,-110 L1400,110 L0,10 Z" fill="#FFE29A" opacity={0.18} />
        </g>
      </Lienzo>
      <DatoOpcional dato={dato} />
    </>
  );
};

export { Barco };

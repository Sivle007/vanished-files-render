// Sala de juicio en vista isometrica: paredes con zocalo, suelo verde, estrado del juez con banderas y sello,
// secretaria, estrado de testigos, tribuna del jurado, mesas de fiscalia y defensa, policia, barandilla y bancos de publico.
import React from 'react';
import { random } from 'remotion';
import { DatosPersonaje, PIELES, TINTA } from '../Personaje';
import { Atmosfera, Escena, Figura, persona } from './escena';
import { Mov } from './base';

export const JUEZ: DatosPersonaje = { id: 'juez', piel: PIELES.media, pelo: 'canoso', colorPelo: '#C9C4BA', gafas: true, camisa: { color: '#141317', manga: 'larga' }, pantalon: { color: '#141317' }, zapatos: '#1A1A1E', expresion: 'serio' };
const POLICIA: DatosPersonaje = { id: 'policiasala', piel: PIELES.clara, pelo: 'corto', colorPelo: '#3A2A20', camisa: { color: '#2A3346', manga: 'larga' }, pantalon: { color: '#3A4A6A' }, zapatos: '#1A1A1E', expresion: 'serio' };
const SECRETARIA: DatosPersonaje = { id: 'secretaria', piel: PIELES.clara, pelo: 'melena', colorPelo: '#8A4A2A', camisa: { color: '#5A6470', chaqueta: true }, pantalon: { color: '#2E3440', tipo: 'falda' }, zapatos: '#2B2B2B', expresion: 'neutral' };

// Proyeccion isometrica: x avanza hacia abajo a la derecha (pared derecha), y hacia abajo a la izquierda (pared izquierda).
const U = 36;
const V = 21;
const OX = 960;
const OY = 300;
const iso = (x: number, y: number): [number, number] => [OX + (x - y) * U, OY + (x + y) * V];
const pt = (x: number, y: number, z = 0) => {
  const [a, b] = iso(x, y);
  return `${a},${b - z}`;
};

const MADERA = { top: '#8A5A36', izq: '#6B4428', der: '#5A3820' };

// Caja isometrica (mesa, estrado, banco...) de x0..x1, y0..y1 y altura h en pixeles.
const Caja: React.FC<{ x0: number; x1: number; y0: number; y1: number; h: number; c?: { top: string; izq: string; der: string }; panel?: boolean }> = ({ x0, x1, y0, y1, h, c = MADERA, panel = true }) => (
  <g stroke={TINTA} strokeWidth={2.5} strokeLinejoin="round">
    <polygon points={`${pt(x0, y1)} ${pt(x1, y1)} ${pt(x1, y1, h)} ${pt(x0, y1, h)}`} fill={c.izq} />
    <polygon points={`${pt(x1, y0)} ${pt(x1, y1)} ${pt(x1, y1, h)} ${pt(x1, y0, h)}`} fill={c.der} />
    <polygon points={`${pt(x0, y0, h)} ${pt(x1, y0, h)} ${pt(x1, y1, h)} ${pt(x0, y1, h)}`} fill={c.top} />
    {panel && h > 30 && x1 - x0 > 1.2 && (
      <polygon points={`${pt(x0 + 0.3, y1, 8)} ${pt(x1 - 0.3, y1, 8)} ${pt(x1 - 0.3, y1, h - 10)} ${pt(x0 + 0.3, y1, h - 10)}`} fill="none" stroke="#3A2414" strokeWidth={2} opacity={0.6} />
    )}
  </g>
);

// Persona en la sala (escala pequena). Los pies en el punto isometrico (x, y).
const P: React.FC<{ p: DatosPersonaje; x: number; y: number; d: number; escala?: number; espejo?: boolean; alto?: number }> = ({ p, x, y, d, escala = 0.23, espejo, alto = 0 }) => {
  const [a, b] = iso(x, y);
  return <Figura e={{ p, x: a, y: b - alto, escala, espejo }} duracion={d} />;
};

const Bandera: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => {
  const [a, b] = iso(x, y);
  return (
    <g stroke={TINTA} strokeWidth={2.5}>
      <ellipse cx={a} cy={b} rx={16} ry={8} fill="#C9A86A" />
      <line x1={a} y1={b} x2={a} y2={b - 230} strokeWidth={5} stroke="#C9A86A" />
      <circle cx={a} cy={b - 236} r={7} fill="#C9A86A" />
      <path d={`M${a},${b - 222} q-46,10 -50,70 q-4,60 8,110 q20,-30 42,-40 Z`} fill={color} />
      <path d={`M${a - 30},${b - 170} l14,0 M${a - 32},${b - 140} l16,0`} stroke="#E8E2D4" strokeWidth={3} />
    </g>
  );
};

// Cuadro en la pared izquierda (x = 0).
const Cuadro: React.FC<{ y: number }> = ({ y }) => {
  const z = 260;
  return <polygon points={`${pt(0, y, z)} ${pt(0, y + 1.6, z)} ${pt(0, y + 1.6, z - 90)} ${pt(0, y, z - 90)}`} fill="#B8A27A" stroke="#5A3820" strokeWidth={8} />;
};

export type Habla = 'fiscal' | 'defensa' | 'testigo' | 'juez' | null;

export const SalaJuicio: React.FC<{
  duracion: number;
  acusado?: DatosPersonaje;
  fiscal?: DatosPersonaje;
  defensa?: DatosPersonaje;
  habla?: Habla;
  mazo?: boolean;
  jurado?: boolean;
  juradoExpresion?: DatosPersonaje['expresion'];
  publicoExpresion?: DatosPersonaje['expresion'];
  mov?: Mov;
  atm?: Atmosfera;
  texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' | 'centro' };
}> = ({ duracion: d, acusado, fiscal, defensa, habla = null, mazo, jurado = true, juradoExpresion = 'serio', publicoExpresion = 'neutral', mov, atm, texto }) => {
  const testigo = habla === 'testigo' ? acusado : undefined;
  const acusadoMesa = habla === 'testigo' ? undefined : acusado;
  const fiscalSentado = fiscal && habla !== 'fiscal' ? { ...fiscal, pose: 'quieto' as const } : undefined;
  const defensaSentada = defensa && habla !== 'defensa' ? { ...defensa, pose: 'quieto' as const } : undefined;
  const dePie = habla === 'fiscal' ? fiscal : habla === 'defensa' ? defensa : undefined;
  const sello = iso(18.5, 0);
  const mazoEn = iso(19.5, 2.6);
  const monitor = iso(11.2, 2.4);
  return (
    <Escena
      duracion={d}
      fondo="negro"
      mov={mov ?? { zoom: [1, 1.06] }}
      atm={atm}
      texto={texto}
      detras={
        <g>
          {/* Paredes y zocalo */}
          <polygon points={`${pt(0, 0, 900)} ${pt(28, 0, 900)} ${pt(28, 0)} ${pt(0, 0)}`} fill="#C9CDD6" />
          <polygon points={`${pt(0, 0, 900)} ${pt(0, 28, 900)} ${pt(0, 28)} ${pt(0, 0)}`} fill="#DADDE4" />
          <polygon points={`${pt(0, 0, 70)} ${pt(28, 0, 70)} ${pt(28, 0)} ${pt(0, 0)}`} fill="#6B4428" stroke={TINTA} strokeWidth={2.5} />
          <polygon points={`${pt(0, 0, 70)} ${pt(0, 28, 70)} ${pt(0, 28)} ${pt(0, 0)}`} fill="#7A4E2E" stroke={TINTA} strokeWidth={2.5} />
          {/* Suelo, con la zona del tribunal algo mas oscura */}
          <polygon points={`${pt(0, 0)} ${pt(28, 0)} ${pt(28, 28)} ${pt(0, 28)}`} fill="#8FAE86" />
          <polygon points={`${pt(6.8, 0)} ${pt(28, 0)} ${pt(28, 15)} ${pt(6.8, 15)}`} fill="#7FA077" />
          {[3, 6.2, 9.4].map((y) => <Cuadro key={y} y={y} />)}
          {/* Sello en la pared derecha */}
          <ellipse cx={sello[0]} cy={sello[1] - 330} rx={62} ry={66} fill="#6B4428" stroke={TINTA} strokeWidth={4} />
          <ellipse cx={sello[0]} cy={sello[1] - 330} rx={46} ry={50} fill="none" stroke="#C9A86A" strokeWidth={4} />
          <path d={`M${sello[0] - 26},${sello[1] - 342} L${sello[0] + 26},${sello[1] - 342} M${sello[0]},${sello[1] - 356} L${sello[0]},${sello[1] - 306}`} stroke="#C9A86A" strokeWidth={4} />
          <path d={`M${sello[0] - 26},${sello[1] - 342} l-12,22 h24 Z M${sello[0] + 26},${sello[1] - 342} l-12,22 h24 Z`} stroke="#C9A86A" strokeWidth={3} fill="#C9A86A" />

          {/* Estrado del juez, secretaria y banderas */}
          <Bandera x={14} y={0.6} color="#2A3A5A" />
          <P p={{ ...JUEZ, pose: habla === 'juez' ? 'hablar' : 'quieto' }} x={18.6} y={2.6} d={d} alto={18} escala={0.28} />
          <Caja x0={15.5} x1={21.5} y0={1.8} y1={4} h={96} />
          {mazo && (
            <g transform={`translate(${mazoEn[0]} ${mazoEn[1] - 100}) rotate(-20)`} stroke={TINTA} strokeWidth={2.5}>
              <rect x={-4} y={-4} width={44} height={8} rx={3} fill="#3A2414" />
              <rect x={-22} y={-12} width={22} height={24} rx={4} fill="#8A5A36" />
            </g>
          )}
          <Bandera x={25.6} y={0.6} color="#2A3A5A" />
          <P p={SECRETARIA} x={12} y={1.4} d={d} />
          <Caja x0={10} x1={14.5} y0={2} y1={3.6} h={62} />
          <polygon points={`${monitor[0] - 30},${monitor[1] - 62} ${monitor[0] + 6},${monitor[1] - 82} ${monitor[0] + 6},${monitor[1] - 120} ${monitor[0] - 30},${monitor[1] - 100}`} fill="#3A3D44" stroke={TINTA} strokeWidth={2.5} />

          {/* Estrado de testigos */}
          {testigo && <P p={{ ...testigo, pose: 'hablar' }} x={23.5} y={4.2} d={d} espejo />}
          <Caja x0={22.3} x1={24.6} y0={3} y1={4.8} h={44} />

          {/* Tribuna del jurado (dos filas, junto a la pared izquierda) */}
          {jurado && [0, 1, 2, 3].map((k) => <P key={`a${k}`} p={persona(`jurA${k}`, { expresion: juradoExpresion })} x={1.6} y={4 + k * 2} d={d} alto={24} espejo />)}
          <Caja x0={2.2} x1={3.6} y0={3} y1={12} h={78} />
          {jurado && [0, 1, 2, 3].map((k) => <P key={`b${k}`} p={persona(`jurB${k}`, { expresion: juradoExpresion })} x={4.4} y={4.5 + k * 2} d={d} espejo />)}
          <Caja x0={5} x1={6.4} y0={3.5} y1={12.5} h={56} />

          {/* Policia */}
          <P p={POLICIA} x={9} y={3.5} d={d} escala={0.25} />

          {/* Mesa de la fiscalia */}
          {fiscalSentado && <P p={fiscalSentado} x={11.6} y={8.6} d={d} />}
          <Caja x0={10.5} x1={14.5} y0={9.2} y1={10.8} h={40} />

          {/* Quien habla, de pie en el centro */}
          {dePie && <P p={{ ...dePie, pose: 'hablar' }} x={16} y={7.4} d={d} escala={0.26} espejo />}

          {/* Mesa de la defensa con el acusado */}
          {acusadoMesa && <P p={{ ...acusadoMesa, pose: 'quieto' }} x={15.4} y={11.6} d={d} />}
          {defensaSentada && <P p={defensaSentada} x={17.6} y={11.6} d={d} />}
          <Caja x0={14.5} x1={19.5} y0={12.2} y1={13.8} h={40} />

          {/* Barandilla */}
          <Caja x0={4} x1={24} y0={15.4} y1={15.8} h={46} panel={false} />

          {/* Bancos del publico */}
          {[18, 21, 24].map((y, fila) =>
            [0, 1].map((col) => {
              const x0 = col ? 14 : 5;
              return (
                <g key={`${fila}-${col}`}>
                  {[0, 1, 2].map((k) => {
                    const s = `pub${fila}${col}${k}`;
                    return random(s) > 0.25 ? <P key={k} p={persona(s, { expresion: publicoExpresion })} x={x0 + 1 + k * 2.2 + (random(`${s}x`) - 0.5) * 0.6} y={y - 0.6} d={d} /> : null;
                  })}
                  <Caja x0={x0} x1={x0 + 7.5} y0={y} y1={y + 0.9} h={40} panel={false} />
                </g>
              );
            }),
          )}
        </g>
      }
    />
  );
};

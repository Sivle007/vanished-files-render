// La escena generica: un fondo, personajes que respiran, parpadean y pueden andar, atmosfera, camara y rotulo.
// Casi todos los planos de los episodios se montan con este componente.
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { DatosPersonaje, PIELES, Personaje, Pelo } from '../Personaje';
import { crimen, letra } from '../MarcaCrimen';
import { Acabado, Camara, ConDuracion, Lluvia, Mov, Niebla, Polvo, Sirena, SUELO, Svg, TextoPantalla, ap, fijo, parpadeo, respira } from './base';
import { FondoCelda, FondoConcierto, FondoCruce, FondoEstudio, FondoHospital, FondoPlato, FondoRing, FondoVegas, FondoVestibulo } from './fondos2';
import { FondoCampo, FondoCementerio, FondoCiudad, FondoFoco, FondoIglesia, FondoNegro, FondoOficina, FondoPabellon, FondoPista, FondoSelva, FondoTribunal, Hora } from './fondos';

export type TipoFondo = 'selva' | 'jonestown' | 'pabellon' | 'iglesia' | 'ciudad' | 'campo' | 'pista' | 'oficina' | 'tribunal' | 'cementerio' | 'foco' | 'negro' | 'vegas' | 'cruce' | 'vestibulo' | 'estudio' | 'celda' | 'hospital' | 'plato' | 'ring' | 'concierto';

export const FondoEscena: React.FC<{ tipo: TipoFondo; hora?: Hora }> = ({ tipo, hora }) => {
  switch (tipo) {
    case 'selva': return <FondoSelva hora={hora} />;
    case 'jonestown': return <FondoSelva hora={hora} cabanas />;
    case 'pabellon': return <FondoPabellon hora={hora} />;
    case 'iglesia': return <FondoIglesia />;
    case 'ciudad': return <FondoCiudad hora={hora} />;
    case 'campo': return <FondoCampo />;
    case 'pista': return <FondoPista hora={hora} />;
    case 'oficina': return <FondoOficina hora={hora} />;
    case 'tribunal': return <FondoTribunal />;
    case 'cementerio': return <FondoCementerio />;
    case 'foco': return <FondoFoco />;
    case 'vegas': return <FondoVegas />;
    case 'cruce': return <FondoCruce />;
    case 'vestibulo': return <FondoVestibulo />;
    case 'estudio': return <FondoEstudio />;
    case 'celda': return <FondoCelda />;
    case 'hospital': return <FondoHospital />;
    case 'plato': return <FondoPlato />;
    case 'ring': return <FondoRing />;
    case 'concierto': return <FondoConcierto />;
    default: return <FondoNegro />;
  }
};

export type EnEscena = {
  p: DatosPersonaje;
  x: number;
  y?: number;
  escala?: number;
  espejo?: boolean;
  anda?: number; // desplazamiento horizontal total durante la escena (anda mientras se mueve)
  aparece?: number; // fotograma en que aparece
  desaparece?: number; // fotograma en que se desvanece
  atenuado?: number; // 0..1 para dejarlo en segundo plano
};

export const Figura: React.FC<{ e: EnEscena; duracion: number }> = ({ e, duracion }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, duracion], [0, 1], fijo);
  const x = e.x + (e.anda ?? 0) * t;
  const o = (e.aparece !== undefined ? ap(f, e.aparece, e.aparece + 10) : 1) * (e.desaparece !== undefined ? 1 - ap(f, e.desaparece, e.desaparece + 18) : 1);
  const s = random(e.p.id) * 10;
  const entra = 1 - ap(f, e.aparece ?? 0, (e.aparece ?? 0) + 14);
  const yPie = e.y ?? SUELO;
  // Vaiven del cuerpo y cambio de peso de una pierna a otra, distinto para cada personaje.
  const vaiven = e.anda ? 0 : Math.sin(f / 42 + s) * 1.6;
  const peso = e.anda ? 0 : Math.sin(f / 70 + s) * 6;
  return (
    <g opacity={o * (1 - (e.atenuado ?? 0) * 0.6)} transform={`translate(${peso} ${entra * 26}) rotate(${vaiven} ${x} ${yPie})`}>
      <Personaje
        {...e.p}
        x={x}
        y={e.y ?? SUELO}
        escala={e.escala ?? 0.62}
        espejo={e.espejo}
        parpadeo={parpadeo(f, e.p.id)}
        respiracion={respira(f, e.p.id)}
        paso={e.anda ? (f / 5) % (Math.PI * 2) : undefined}
        cabeceo={Math.sin(f / 36 + s) * 4 + (e.p.pose === 'hablar' ? Math.sin(f / 7 + s) * 2.5 : 0)}
        gesto={f / 9 + s}
      />
    </g>
  );
};

export type Atmosfera = { niebla?: number; lluvia?: boolean; polvo?: boolean; sirena?: boolean; tinte?: string };

export const Escena: React.FC<
  ConDuracion & {
    fondo: TipoFondo;
    hora?: Hora;
    gente?: EnEscena[];
    detras?: React.ReactNode;
    delante?: React.ReactNode;
    atm?: Atmosfera;
    mov?: Mov;
    texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' | 'centro'; desde?: number };
  }
> = ({ duracion, fondo, hora, gente = [], detras, delante, atm = {}, mov, texto }) => (
  <AbsoluteFill style={{ background: crimen.negro }}>
    <Camara duracion={duracion} mov={mov}>
      <Svg>
        <FondoEscena tipo={fondo} hora={hora} />
        {detras}
        {[...gente].sort((a, b) => (a.y ?? SUELO) - (b.y ?? SUELO)).map((e, i) => <Figura key={e.p.id + i} e={e} duracion={duracion} />)}
        {delante}
        {atm.niebla ? <Niebla opacidad={atm.niebla} /> : null}
        {atm.lluvia && <Lluvia />}
        {atm.polvo && <Polvo />}
      </Svg>
    </Camara>
    {atm.tinte && <AbsoluteFill style={{ background: atm.tinte, mixBlendMode: 'multiply' }} />}
    {atm.sirena && <Sirena />}
    <Acabado />
    {texto && <TextoPantalla {...texto} />}
  </AbsoluteFill>
);

// Generador de multitudes variadas y respetuosas (edades, pieles, peinados y ropa distintos).
const PIELES_LISTA = [PIELES.clara, PIELES.media, PIELES.morena, PIELES.oscura, PIELES.oscura, PIELES.morena];
const PELOS: Pelo[] = ['corto', 'afro', 'raya', 'melena', 'canoso', 'flequillo', 'rapado', 'entradas', 'mechones'];
const ROPA = ['#7A4A3A', '#3E5C86', '#6E6A4A', '#8A6A3A', '#4A5A4A', '#6E3A4C', '#C2733C', '#5A6470', '#B8A27A', '#3A4A6A'];
export function persona(semilla: string, extra: Partial<DatosPersonaje> = {}): DatosPersonaje {
  const r = (k: string) => random(`${semilla}-${k}`);
  const pelo = PELOS[Math.floor(r('pelo') * PELOS.length)];
  const mujer = pelo === 'melena' || pelo === 'flequillo' || r('m') > 0.6;
  return {
    id: semilla,
    piel: PIELES_LISTA[Math.floor(r('piel') * PIELES_LISTA.length)],
    pelo,
    colorPelo: pelo === 'canoso' ? '#C9C4BA' : ['#1E1A18', '#3A2A20', '#5A4030', '#2A2422'][Math.floor(r('cp') * 4)],
    camisa: { color: ROPA[Math.floor(r('c') * ROPA.length)], manga: r('mg') > 0.5 ? 'larga' : 'corta' },
    pantalon: { color: ['#2E3440', '#4A6A94', '#3A3A3A', '#5A4A3A'][Math.floor(r('p') * 4)], tipo: mujer && r('f') > 0.4 ? 'falda' : 'largo' },
    zapatos: r('z') > 0.5 ? '#F1EEE6' : '#2B2B2B',
    expresion: 'neutral',
    ...extra,
  };
}

// Filas de gente con perspectiva: las de atras mas pequenas y altas. "apagar" las desvanece una a una (de pie, sin violencia).
export const Gente: React.FC<{
  duracion: number;
  semilla: string;
  filas?: number;
  porFila?: number;
  y?: number;
  escala?: number;
  expresion?: DatosPersonaje['expresion'];
  apagar?: [number, number];
  aplauso?: boolean;
  ancho?: number;
}> = ({ duracion, semilla, filas = 3, porFila = 9, y = SUELO, escala = 0.42, expresion = 'neutral', apagar, aplauso, ancho = 1700 }) => {
  const f = useCurrentFrame();
  const total = filas * porFila;
  const orden = Array.from({ length: total }, (_, i) => i).sort((a, b) => random(`${semilla}o${a}`) - random(`${semilla}o${b}`));
  return (
    <g>
      {Array.from({ length: filas }, (_, fi) => filas - 1 - fi).map((fila) => {
        const k = 1 - fila * 0.16;
        return Array.from({ length: porFila }, (_, i) => {
          const idx = fila * porFila + i;
          const x = 960 - (ancho * k) / 2 + ((i + 0.5 + (fila % 2) * 0.4) * ancho * k) / porFila + (random(`${semilla}dx${idx}`) - 0.5) * 30;
          let o = 1;
          if (apagar) {
            const pos = orden.indexOf(idx) / total;
            const t0 = apagar[0] + (apagar[1] - apagar[0]) * pos;
            o = 1 - ap(f, t0, t0 + 20) * 0.9;
          }
          const p = persona(`${semilla}${idx}`, { expresion, pose: aplauso && (f / 6 + idx) % 2 < 1 ? 'hablar' : 'quieto' });
          return (
            <g key={idx} opacity={o}>
              <g transform={`rotate(${Math.sin(f / 40 + idx) * 1.5} ${x} ${y - fila * 70})`}>
                <Personaje {...p} x={x} y={y - fila * 70} escala={escala * k} parpadeo={parpadeo(f, p.id)} respiracion={respira(f, p.id)} cabeceo={Math.sin(f / 33 + idx * 1.7) * 5} gesto={aplauso ? undefined : f / 11 + idx} />
              </g>
            </g>
          );
        });
      })}
    </g>
  );
};

// Ficha de presentacion: polaroid del personaje sobre expediente con nombre a maquina.
export const Ficha: React.FC<ConDuracion & { p: DatosPersonaje; nombre: string; cargo: string; dato?: string }> = ({ duracion, p, nombre, cargo, dato }) => {
  const f = useCurrentFrame();
  const entra = ap(f, 0, 14);
  const letras = Math.floor(ap(f, 12, 12 + nombre.length * 1.6) * nombre.length);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 45%, #2A2722, ${crimen.negro} 75%)` }}>
      <Camara duracion={duracion} mov={{ zoom: [1, 1.06] }}>
        <Svg>
          <g transform={`translate(${620} ${560 + (1 - entra) * 60}) rotate(${-4 + (1 - entra) * 6})`} opacity={entra}>
            <rect x={-330} y={-400} width={660} height={780} fill={crimen.papel} stroke="#8A7A58" strokeWidth={4} />
            <rect x={-280} y={-350} width={560} height={540} fill="#1E2430" />
            <g clipPath="url(#ficha-foto)">
              <defs>
                <clipPath id="ficha-foto"><rect x={-280} y={-350} width={560} height={540} /></clipPath>
              </defs>
              <rect x={-280} y={-350} width={560} height={540} fill="url(#ficha-luz)" />
              <defs>
                <radialGradient id="ficha-luz" cx="0.5" cy="0.4" r="0.6">
                  <stop offset="0" stopColor="#5B7FA6" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <Personaje {...p} x={0} y={560} escala={1.05} parpadeo={parpadeo(f, p.id)} respiracion={respira(f, p.id)} />
            </g>
            <rect x={-40} y={-420} width={80} height={40} fill="#C9C1A8" opacity={0.85} transform="rotate(-6)" />
          </g>
        </Svg>
      </Camara>
      <div style={{ position: 'absolute', left: 1040, top: 360, width: 760 }}>
        <div style={{ fontFamily: letra.maquina, fontSize: 30, color: crimen.rojo, opacity: ap(f, 6, 14), letterSpacing: 3 }}>SUBJECT FILE</div>
        <div style={{ fontFamily: letra.titulo, fontSize: 120, color: crimen.hueso, lineHeight: 1, marginTop: 10 }}>{nombre.slice(0, letras)}</div>
        <div style={{ fontFamily: letra.maquina, fontSize: 36, color: crimen.hueso, opacity: ap(f, 24, 36), marginTop: 14 }}>{cargo}</div>
        {dato && <div style={{ display: 'inline-block', marginTop: 26, padding: '6px 16px', border: `3px solid ${crimen.azul}`, color: crimen.azul, fontFamily: letra.maquina, fontSize: 30, opacity: ap(f, 34, 44) }}>{dato}</div>}
      </div>
      <Acabado />
    </AbsoluteFill>
  );
};

// Piloto: gancho de la Parte 1 de Franklin. Cada escena empieza con la frase que la acompaña.
import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { color, fuente, msAFrame } from './estilo';
import { Aurora, Barco, Cielo, Dato, Estrellas, Lienzo, MarHelado, Marinero, Nieve, ANCHO, ALTO } from './elementos';
import { Palabra } from './Subtitulos';
import palabrasJson from '../public/piloto/palabras.json';

// Los tiempos por palabra solo marcan cuándo empieza cada escena; el vídeo largo va sin subtítulos.
const palabras = palabrasJson as Palabra[];
const FUNDIDO = 12;

// Primera palabra de cada escena, en orden.
const ANCLAS = ['In', 'On', 'Not', 'For', 'Now,', 'This'];

export const duracionPiloto = () => msAFrame(palabras.at(-1)!.endMs) + 45;

function iniciosDeEscena() {
  let desde = 0;
  return ANCLAS.map((ancla) => {
    const i = palabras.findIndex((p, k) => k >= desde && p.text === ancla);
    desde = i + 1;
    return i <= 0 ? 0 : msAFrame(palabras[i].startMs) - 6;
  });
}

const Escena: React.FC<{ children: React.ReactNode; duracion: number }> = ({ children, duracion }) => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' });
  const zoom = interpolate(frame, [0, duracion], [1, 1.06]);
  return <AbsoluteFill style={{ opacity: opacidad, transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
};

export const Partida: React.FC<{ duracion: number }> = ({ duracion }) => {
  const frame = useCurrentFrame();
  const avance = interpolate(frame, [0, duracion], [0, 1]);
  return (
    <>
      <Lienzo>
        <Cielo id="partida" arriba={color.noche} medio={color.azul} brillo="#B8693F" />
        <Estrellas />
        <Aurora intensidad={0.8} />
        <MarHelado />
        <Barco x={1150 + avance * 260} y={712} escala={0.55} fase={1.3} />
        <Barco x={520 + avance * 320} y={735} escala={0.85} />
        <Nieve cantidad={70} velocidad={0.7} />
      </Lienzo>
      <Dato etiqueta="DEPARTURE" valor="MAY 1845" x={90} y={80} aparece={8} />
    </>
  );
};

const COLUMNAS = 19;
export const Tripulacion: React.FC<{ duracion: number; desaparecen?: boolean }> = ({ duracion, desaparecen = false }) => {
  const frame = useCurrentFrame();
  const progreso = interpolate(frame, [6, duracion * 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const visibles = Math.round(progreso * 129);
  return (
    <>
      <Lienzo>
        <Cielo id={desaparecen ? 'ausencia' : 'tripulacion'} arriba={color.noche} medio={color.profundo} brillo={color.azul} />
        <Estrellas cantidad={50} semilla="t" />
        {Array.from({ length: 129 }, (_, i) => {
          const x = ANCHO / 2 + ((i % COLUMNAS) - (COLUMNAS - 1) / 2) * 72;
          const y = 300 + Math.floor(i / COLUMNAS) * 82;
          const presente = desaparecen ? i < 129 - visibles : i < visibles;
          return <Marinero key={i} x={x} y={y} escala={1.15} relleno={presente ? color.blanco : color.hielo} opacidad={presente ? 1 : desaparecen ? 0.18 : 0} />;
        })}
        <Nieve cantidad={50} velocidad={0.5} />
      </Lienzo>
      {desaparecen ? (
        <Dato etiqueta="RETURNED" valor="0" x={90} y={80} colorValor={color.rojo} aparece={4} />
      ) : (
        <Dato etiqueta="CREW" valor={String(visibles)} x={90} y={80} aparece={4} />
      )}
    </>
  );
};

// Sin "fijo" cuenta los años de 1848 a 2014; con "fijo" muestra ese rótulo quieto.
export const Busqueda: React.FC<{ duracion: number; fijo?: { etiqueta: string; valor: string } }> = ({ duracion, fijo }) => {
  const frame = useCurrentFrame();
  const ano = Math.round(interpolate(frame, [8, duracion - 10], [1848, 2014], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const trazo = interpolate(frame, [0, duracion], [1600, 0]);
  return (
    <>
      <Lienzo>
        <Cielo id="busqueda" arriba={color.noche} medio={color.profundo} brillo={color.hielo} />
        <Estrellas semilla="b" />
        <MarHelado deriva={0.9} />
        {['M150,900 C500,780 800,980 1150,820 S1600,760 1800,860', 'M300,1000 C600,860 900,900 1200,960 S1550,880 1750,960', 'M100,800 C400,760 700,820 1000,760'].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={color.ambar} strokeWidth={3} strokeDasharray="14 12" opacity={0.55} strokeDashoffset={trazo + i * 200} />
        ))}
        <Nieve cantidad={200} velocidad={1.6} />
      </Lienzo>
      <Dato etiqueta={fijo?.etiqueta ?? 'STILL SEARCHING'} valor={fijo?.valor ?? String(ano)} x={90} y={80} aparece={4} />
    </>
  );
};

export const Naufragio: React.FC<{ dato?: { etiqueta: string; valor: string } }> = ({ dato = { etiqueta: 'FOUND', valor: '2014 · 2016' } }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lienzo>
        <defs>
          <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13505A" />
            <stop offset="1" stopColor="#020D14" />
          </linearGradient>
        </defs>
        <rect width={ANCHO} height={ALTO} fill="url(#agua)" />
        {[300, 700, 1150, 1500].map((x, i) => (
          <polygon key={x} points={`${x},0 ${x + 120},0 ${x + 380 + i * 30},${ALTO} ${x + 140},${ALTO}`} fill={color.hieloClaro} opacity={0.05 + 0.03 * Math.sin(frame / 25 + i)} />
        ))}
        <path d={`M0,${ALTO - 140} C400,${ALTO - 190} 800,${ALTO - 120} 1200,${ALTO - 170} S1700,${ALTO - 150} 1920,${ALTO - 180} L1920,${ALTO} L0,${ALTO} Z`} fill="#03141B" />
        <g transform={`rotate(-9 ${ANCHO / 2 + 250} ${ALTO - 300})`}>
          <Barco x={ANCHO / 2 + 250} y={ALTO - 330} escala={1.25} tono="#2B6670" />
        </g>
        {[0, 1, 2].map((k) => {
          const ciclo = ((frame + k * 25) % 75) / 75;
          return <circle key={k} cx={ANCHO / 2 + 250} cy={ALTO - 420} r={60 + ciclo * 520} fill="none" stroke={color.ambar} strokeWidth={3} opacity={(1 - ciclo) * 0.6} />;
        })}
        {Array.from({ length: 25 }, (_, i) => {
          const y = ALTO - ((frame * (1.2 + (i % 5) * 0.4) + i * 97) % ALTO);
          return <circle key={i} cx={760 + ((i * 53) % 420) + Math.sin(frame / 12 + i) * 8} cy={y} r={2 + (i % 4)} fill="none" stroke={color.hieloClaro} opacity={0.5} />;
        })}
      </Lienzo>
      <Dato etiqueta={dato.etiqueta} valor={dato.valor} x={90} y={80} aparece={6} />
    </>
  );
};

export const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = (desde: number) => interpolate(frame, [desde, desde + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <Lienzo>
        <Cielo id="titulo" arriba={color.noche} medio={color.profundo} brillo="#7A4A33" />
        <Estrellas semilla="f" />
        <Aurora intensidad={0.5} />
        <MarHelado deriva={0.2} />
        <Nieve cantidad={110} velocidad={0.6} />
      </Lienzo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily: fuente.texto, color: color.blanco }}>
        <div style={{ opacity: entra(4), letterSpacing: 14, fontSize: 30, fontWeight: 800, color: color.ambar }}>VANISHED FILES</div>
        <div style={{ opacity: entra(10), fontFamily: fuente.titulo, fontSize: 120, fontWeight: 700, margin: '10px 0', textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
          The Franklin Expedition
        </div>
        <div style={{ opacity: entra(28), letterSpacing: 10, fontSize: 34, fontWeight: 500 }}>PART 1</div>
      </AbsoluteFill>
    </>
  );
};

// Pista de musica o ambiente que entra y sale con un fundido para no cortar en seco.
const Pista: React.FC<{ archivo: string; volumen: number; duracion: number; bucle?: boolean }> = ({ archivo, volumen, duracion, bucle = true }) => (
  <Audio
    src={staticFile(`audio/${archivo}.wav`)}
    loop={bucle}
    volume={(f) => volumen * interpolate(f, [0, 20, duracion - 20, duracion], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
  />
);

type Sonido = { archivo: string; volumen: number; bucle?: boolean };

// Musica y ambiente de cada escena, en el mismo orden que las escenas.
const SONIDOS: Sonido[][] = [
  [{ archivo: 'musica-tenebrosa', volumen: 0.22 }, { archivo: 'mar', volumen: 0.3 }, { archivo: 'viento', volumen: 0.18 }],
  [{ archivo: 'musica-tenebrosa', volumen: 0.22 }, { archivo: 'viento', volumen: 0.14 }],
  [{ archivo: 'musica-triste', volumen: 0.3 }, { archivo: 'viento', volumen: 0.2 }],
  [{ archivo: 'musica-tension', volumen: 0.22 }, { archivo: 'viento', volumen: 0.38 }, { archivo: 'trueno', volumen: 0.7, bucle: false }],
  [{ archivo: 'musica-tenebrosa', volumen: 0.2 }, { archivo: 'bajo-el-agua', volumen: 0.4 }],
  [{ archivo: 'musica-tenebrosa', volumen: 0.3 }, { archivo: 'viento', volumen: 0.2 }, { archivo: 'mar', volumen: 0.2 }],
];

// Un pitido de sonar por cada onda que sale del barco hundido.
const Sonar: React.FC<{ duracion: number }> = ({ duracion }) => (
  <>
    {Array.from({ length: Math.ceil(duracion / 75) }, (_, k) => (
      <Sequence key={k} from={k * 75} durationInFrames={75}>
        <Audio src={staticFile('audio/sonar.wav')} volume={1} />
      </Sequence>
    ))}
  </>
);

export const Piloto: React.FC = () => {
  const total = duracionPiloto();
  const inicios = iniciosDeEscena();
  const escenas = [Partida, (p: { duracion: number }) => <Tripulacion {...p} />, (p: { duracion: number }) => <Tripulacion {...p} desaparecen />, Busqueda, Naufragio, Titulo];
  return (
    <AbsoluteFill style={{ background: color.noche }}>
      {escenas.map((Contenido, i) => {
        const desde = inicios[i];
        const duracion = (inicios[i + 1] ?? total) - desde + FUNDIDO;
        return (
          <Sequence key={i} from={desde} durationInFrames={duracion}>
            <Escena duracion={duracion}>
              <Contenido duracion={duracion} />
            </Escena>
            {SONIDOS[i].map((s) => (
              <Pista key={s.archivo} archivo={s.archivo} volumen={s.volumen} duracion={duracion} bucle={s.bucle} />
            ))}
            {Contenido === Naufragio && <Sonar duracion={duracion} />}
          </Sequence>
        );
      })}
      <Audio src={staticFile('piloto/hook.wav')} />
    </AbsoluteFill>
  );
};

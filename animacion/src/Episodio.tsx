// Monta un episodio completo: narracion por bloques, una escena por parrafo y un fondo sonoro por bloque.
import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { color, msAFrame } from './estilo';

export type DatosEpisodio = {
  carpeta: string;
  bloques: { titulo: string; audio: string; duracionMs: number; parrafos: { texto: string; inicioMs: number }[] }[];
};
export type Escena = (duracion: number) => React.ReactNode;
export type Fondo = { musica: string; ambiente?: string };

const FUNDIDO = 12;
const PAUSA_BLOQUE = 15;
// Volumenes sutiles: la voz siempre manda.
const VOLUMEN_MUSICA = 0.1;
const VOLUMEN_AMBIENTE = 0.045;

export function calcularTiempos(datos: DatosEpisodio, cierre: number) {
  const inicios: number[] = [];
  let t = 0;
  for (const b of datos.bloques) {
    inicios.push(t);
    t += msAFrame(b.duracionMs) + PAUSA_BLOQUE;
  }
  return { inicios, total: t + cierre };
}

const Pista: React.FC<{ archivo: string; volumen: number; duracion: number }> = ({ archivo, volumen, duracion }) => (
  <Audio
    src={staticFile(`audio/${archivo}.wav`)}
    loop
    volume={(f) => volumen * interpolate(f, [0, 30, duracion - 30, duracion], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
  />
);

const Transicion: React.FC<{ children: React.ReactNode; duracion: number }> = ({ children, duracion }) => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' });
  // En escenas de mas de 10 s, un acercamiento rapido a mitad de escena actua como un nuevo plano.
  const salto = duracion > 300 ? interpolate(frame, [duracion / 2, duracion / 2 + 6], [0, 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const zoom = interpolate(frame, [0, duracion], [1, 1.05]) + salto;
  return <AbsoluteFill style={{ opacity: opacidad, transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
};

// Sin escena de cierre, la ultima escena del plan sigue en pantalla durante el cierre.
// Cada parrafo lleva una escena o una lista de planos que se reparten su duracion a partes iguales.
export const Episodio: React.FC<{ datos: DatosEpisodio; plan: (Escena | Escena[])[][]; fondos: Fondo[]; cierre: { duracion: number; escena: Escena | null } }> = ({ datos, plan, fondos, cierre }) => {
  const { inicios, total } = calcularTiempos(datos, cierre.duracion);

  const parrafos: { desde: number; planos: Escena[] }[] = [];
  datos.bloques.forEach((b, i) => {
    if (plan[i].length !== b.parrafos.length) throw new Error(`Bloque ${b.titulo}: ${b.parrafos.length} parrafos y ${plan[i].length} escenas`);
    b.parrafos.forEach((p, k) => {
      const e = plan[i][k];
      parrafos.push({ desde: inicios[i] + (k === 0 ? 0 : msAFrame(p.inicioMs) - 6), planos: Array.isArray(e) ? e : [e] });
    });
  });
  const finEscenas = cierre.escena ? total - cierre.duracion : total;

  // Todas las escenas en una lista con su fotograma de inicio.
  const escenas: { desde: number; escena: Escena }[] = [];
  parrafos.forEach((p, i) => {
    const largo = (parrafos[i + 1]?.desde ?? finEscenas) - p.desde;
    p.planos.forEach((escena, k) => escenas.push({ desde: p.desde + Math.round((largo * k) / p.planos.length), escena }));
  });
  if (cierre.escena) escenas.push({ desde: total - cierre.duracion, escena: cierre.escena });

  return (
    <AbsoluteFill style={{ background: color.noche }}>
      {escenas.map((e, i) => {
        const duracion = (escenas[i + 1]?.desde ?? total) - e.desde + FUNDIDO;
        return (
          <Sequence key={i} from={e.desde} durationInFrames={duracion}>
            <Transicion duracion={duracion}>{e.escena(duracion)}</Transicion>
          </Sequence>
        );
      })}
      {datos.bloques.map((b, i) => {
        const duracion = (inicios[i + 1] ?? total) - inicios[i] + 20;
        return (
          <Sequence key={`b${i}`} from={inicios[i]} durationInFrames={duracion}>
            <Audio src={staticFile(`episodios/${datos.carpeta}/${b.audio}`)} />
            <Pista archivo={fondos[i].musica} volumen={VOLUMEN_MUSICA} duracion={duracion} />
            {fondos[i].ambiente && <Pista archivo={fondos[i].ambiente!} volumen={VOLUMEN_AMBIENTE} duracion={duracion} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

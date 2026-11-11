// Short vertical (1080x1920): la escena horizontal en el centro sobre una copia desenfocada,
// titulo arriba, subtitulos palabra por palabra abajo y barra de progreso.
import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { color, fuente, msAFrame } from './estilo';
import { Escena } from './Episodio';
import { Palabra, Subtitulos } from './Subtitulos';

export type DatosShort = { titulo: string; audio: string; duracionMs: number; parrafos: { texto: string; inicioMs: number }[] };

const ANCHO_V = 1080;
const ALTO_V = 1920;
const ESCALA = 0.5625; // la escena de 1920x1080 ocupa todo el ancho (1080x608) sin recortar rotulos
const ARRIBA = 500;
const FUNDIDO = 8;
const MUSICA = 0.1;

export const duracionShort = (d: DatosShort) => msAFrame(d.duracionMs) + 30;

const Escenario: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: 'absolute', left: (ANCHO_V - 1920 * 1.78) / 2, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: 'top left', filter: 'blur(26px) brightness(0.5) saturate(1.2)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: (ANCHO_V - 1920 * ESCALA) / 2, top: ARRIBA, width: 1920, height: 1080, transform: `scale(${ESCALA})`, transformOrigin: 'top left', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  </>
);

const Plano: React.FC<{ escena: Escena; duracion: number }> = ({ escena, duracion }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' });
  const zoom = interpolate(frame, [0, duracion], [1, 1.06]);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Escenario>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{escena(duracion)}</AbsoluteFill>
      </Escenario>
    </AbsoluteFill>
  );
};

export const Vertical: React.FC<{ carpeta: string; datos: DatosShort; palabras: Palabra[]; plan: (Escena | Escena[])[]; titulo: string; claves: string[]; musica: string }> = ({
  carpeta, datos, palabras, plan, titulo, claves, musica,
}) => {
  const frame = useCurrentFrame();
  const total = duracionShort(datos);
  if (plan.length !== datos.parrafos.length) throw new Error(`${datos.audio}: ${datos.parrafos.length} parrafos y ${plan.length} escenas`);

  const escenas: { desde: number; escena: Escena }[] = [];
  datos.parrafos.forEach((p, i) => {
    const desde = i === 0 ? 0 : msAFrame(p.inicioMs) - 4;
    const hasta = i + 1 < datos.parrafos.length ? msAFrame(datos.parrafos[i + 1].inicioMs) - 4 : total;
    const planos = Array.isArray(plan[i]) ? (plan[i] as Escena[]) : [plan[i] as Escena];
    planos.forEach((e, k) => escenas.push({ desde: desde + Math.round(((hasta - desde) * k) / planos.length), escena: e }));
  });
  const inicioCta = msAFrame(datos.parrafos.at(-1)!.inicioMs);
  const cta = interpolate(frame, [inicioCta, inicioCta + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: color.noche }}>
      {escenas.map((e, i) => {
        const duracion = (escenas[i + 1]?.desde ?? total) - e.desde + FUNDIDO;
        return (
          <Sequence key={i} from={e.desde} durationInFrames={duracion}>
            <Plano escena={e.escena} duracion={duracion} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 110, textAlign: 'center' }}>
        <div style={{ fontFamily: fuente.texto, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: color.ambar }}>VANISHED FILES</div>
        <div style={{ fontFamily: fuente.titulo, fontWeight: 700, fontSize: 62, lineHeight: 1.15, color: color.blanco, marginTop: 18, padding: '0 70px', textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>{titulo}</div>
      </AbsoluteFill>
      <Subtitulos palabras={palabras} claves={claves} abajo={360} tamano={76} maximo={4} margen={60} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 190, opacity: cta }}>
        <div style={{ fontFamily: fuente.texto, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: color.noche, background: color.ambar, padding: '18px 36px', borderRadius: 40 }}>▶ FULL EPISODE ON YOUTUBE</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 10, width: `${(frame / total) * 100}%`, background: color.ambar }} />
      <Audio src={staticFile(`episodios/${carpeta}/${datos.audio}`)} />
      <Audio src={staticFile(`audio/${musica}.wav`)} loop volume={(f) => MUSICA * interpolate(f, [0, 20, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};

export { ANCHO_V, ALTO_V };

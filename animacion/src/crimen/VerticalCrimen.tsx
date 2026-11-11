// Short vertical true crime (1080x1920): escena horizontal en el centro sobre una copia desenfocada,
// cabecera de expediente arriba, subtitulos palabra por palabra en Bebas y barra de progreso roja.
// Se renderiza sin audio: la voz y la musica se mezclan despues con herramientas/mezclar-short.mjs.
import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { msAFrame } from '../estilo';
import { Escena } from '../Episodio';
import { DatosShort } from '../Vertical';
import { Palabra } from '../Subtitulos';
import { crimen, letra } from '../MarcaCrimen';

const ESCALA = 0.5625;
const ARRIBA = 560;
const FUNDIDO = 6;

export const duracionShortCrimen = (d: DatosShort) => msAFrame(d.duracionMs) + 30;

const Escenario: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: 'absolute', left: (1080 - 1920 * 1.78) / 2, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: 'top left', filter: 'blur(28px) brightness(0.42) saturate(0.9)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: 0, top: ARRIBA, width: 1920, height: 1080, transform: `scale(${ESCALA})`, transformOrigin: 'top left', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', outline: `6px solid ${crimen.rojo}` }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  </>
);

const Plano: React.FC<{ escena: Escena; duracion: number }> = ({ escena, duracion }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' });
  // Golpe de zoom al entrar: en vertical cada cambio de plano tiene que notarse.
  const zoom = interpolate(f, [0, 8, duracion], [1.08, 1.0, 1.06], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Escenario>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{escena(duracion)}</AbsoluteFill>
      </Escenario>
    </AbsoluteFill>
  );
};

const limpia = (p: string) => p.toLowerCase().replace(/[^a-z0-9]/g, '');
function grupos(palabras: Palabra[], maximo: number) {
  const g: Palabra[][] = [[]];
  for (const p of palabras) {
    const actual = g.at(-1)!;
    const anterior = actual.at(-1)?.text ?? '';
    if (actual.length && (/[.?!:]["”]?$/.test(anterior) || actual.length >= maximo || (/,$/.test(anterior) && actual.length >= 2))) g.push([]);
    g.at(-1)!.push(p);
  }
  return g;
}

const Subtitulos: React.FC<{ palabras: Palabra[]; claves: string[] }> = ({ palabras, claves }) => {
  const f = useCurrentFrame();
  const gs = grupos(palabras, 3);
  const i = gs.findIndex((_, k) => f < msAFrame(gs[k + 1]?.[0].startMs ?? Infinity));
  const g = gs[i === -1 ? gs.length - 1 : i];
  const clave = new Set(claves.map(limpia));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1300, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px' }}>
      {g.map((p, k) => {
        const ini = msAFrame(p.startMs);
        const dicha = f >= ini;
        const pop = interpolate(f - ini, [0, 3, 7], [0.85, 1.1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const destacada = clave.has(limpia(p.text));
        return (
          <span key={k} style={{
            fontFamily: letra.titulo, fontSize: 118, lineHeight: 1.05, letterSpacing: 2, display: 'inline-block',
            color: dicha ? (destacada ? crimen.hueso : crimen.hueso) : 'rgba(232,226,212,0.28)',
            background: dicha && destacada ? crimen.rojo : 'transparent', padding: '0 14px',
            transform: `scale(${dicha ? pop : 1}) rotate(${dicha && destacada ? -2 : 0}deg)`,
            textShadow: '0 6px 22px rgba(0,0,0,0.85)',
          }}>
            {p.text.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

export const VerticalCrimen: React.FC<{ datos: DatosShort; palabras: Palabra[]; plan: (Escena | Escena[])[]; titulo: string; claves: string[]; parte: number; caso?: string }> = ({ datos, palabras, plan, titulo, claves, parte, caso = "03" }) => {
  const f = useCurrentFrame();
  const total = duracionShortCrimen(datos);
  if (plan.length !== datos.parrafos.length) throw new Error(`${datos.audio}: ${datos.parrafos.length} parrafos y ${plan.length} escenas`);
  const escenas: { desde: number; escena: Escena }[] = [];
  datos.parrafos.forEach((p, i) => {
    const desde = i === 0 ? 0 : msAFrame(p.inicioMs) - 4;
    const hasta = i + 1 < datos.parrafos.length ? msAFrame(datos.parrafos[i + 1].inicioMs) - 4 : total;
    const planos = Array.isArray(plan[i]) ? (plan[i] as Escena[]) : [plan[i] as Escena];
    planos.forEach((e, k) => escenas.push({ desde: desde + Math.round(((hasta - desde) * k) / planos.length), escena: e }));
  });
  const inicioCta = msAFrame(datos.parrafos.at(-1)!.inicioMs);
  const cta = interpolate(f, [inicioCta, inicioCta + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sello = interpolate(f, [4, 12], [1.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: crimen.negro }}>
      {escenas.map((e, i) => {
        const duracion = (escenas[i + 1]?.desde ?? total) - e.desde + FUNDIDO;
        return (
          <Sequence key={i} from={e.desde} durationInFrames={duracion}>
            <Plano escena={e.escena} duracion={duracion} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 120, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ fontFamily: letra.titulo, fontSize: 42, letterSpacing: 10, color: crimen.hueso }}>VANISHED FILES</div>
          <div style={{ fontFamily: letra.titulo, fontSize: 34, letterSpacing: 4, color: crimen.rojo, border: `4px solid ${crimen.rojo}`, padding: '0 14px', transform: `rotate(-4deg) scale(${sello})` }}>CASE {caso} · PART {parte}</div>
        </div>
        <div style={{ fontFamily: letra.titulo, fontSize: 92, lineHeight: 1, color: crimen.hueso, marginTop: 26, padding: '0 70px', textShadow: '0 6px 24px rgba(0,0,0,0.8)' }}>{titulo}</div>
      </AbsoluteFill>
      <Subtitulos palabras={palabras} claves={claves} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 200, opacity: cta }}>
        <div style={{ fontFamily: letra.titulo, fontSize: 56, letterSpacing: 4, color: crimen.hueso, background: crimen.rojo, padding: '14px 40px', transform: `scale(${0.9 + cta * 0.1})` }}>▶ FULL EPISODE ON YOUTUBE</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 12, width: `${(f / total) * 100}%`, background: crimen.rojo }} />
    </AbsoluteFill>
  );
};

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
import { ModoVertical } from './base';
import { Escena as EscenaCrimen } from './escena';
import { Contador, Giro, Pregunta, Rotulo } from './documentos';
import { SalaJuicio } from './sala';

// Escenas que llenan la pantalla en vertical; el resto (documentos, fichas, mapas...) se ve entero, algo reducido.
const LLENAN = new Set<unknown>([EscenaCrimen, SalaJuicio, Rotulo, Pregunta, Giro, Contador]);
const AJUSTE = 0.7;
const EscenarioAjustado: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: 'absolute', left: (1080 - 1920 * 1.78) / 2, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: 'top left', filter: 'blur(28px) brightness(0.42) saturate(0.9)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: (1080 - 1920 * AJUSTE) / 2, top: (1920 - 1080 * AJUSTE) / 2 - 60, width: 1920, height: 1080, transform: `scale(${AJUSTE})`, transformOrigin: 'top left', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  </>
);

const ESCALA = 0.5625;
const ARRIBA = 560;
const FUNDIDO = 6;

export const duracionShortCrimen = (d: DatosShort) => msAFrame(d.duracionMs) + 30;

// Pantalla completa: la escena horizontal se amplia hasta casi llenar el 9:16 (se ve el centro, x 622-1298).
const COMPLETA = 1.6;
const EscenarioCompleto: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: 'absolute', left: (1080 - 1920 * 1.78) / 2, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: 'top left', filter: 'blur(28px) brightness(0.42) saturate(0.9)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: (1080 - 1920 * COMPLETA) / 2, top: (1920 - 1080 * COMPLETA) / 2, width: 1920, height: 1080, transform: `scale(${COMPLETA})`, transformOrigin: 'top left' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,13,0.85) 0%, rgba(10,10,13,0) 16%, rgba(10,10,13,0) 62%, rgba(10,10,13,0.88) 86%)' }} />
  </>
);

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

const Plano: React.FC<{ escena: Escena; duracion: number; completo?: boolean }> = ({ escena, duracion, completo }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' });
  // Golpe de zoom al entrar: en vertical cada cambio de plano tiene que notarse.
  const zoom = interpolate(f, [0, 8, duracion], [1.08, 1.0, 1.06], { extrapolateRight: 'clamp' });
  const contenido = escena(duracion);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {completo ? (
        LLENAN.has((contenido as React.ReactElement | null)?.type) ? (
          <ModoVertical.Provider value>
            <EscenarioCompleto>
              <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{contenido}</AbsoluteFill>
            </EscenarioCompleto>
          </ModoVertical.Provider>
        ) : (
          <EscenarioAjustado>
            <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{contenido}</AbsoluteFill>
          </EscenarioAjustado>
        )
      ) : (
        <Escenario>
          <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{escena(duracion)}</AbsoluteFill>
        </Escenario>
      )}
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

const Subtitulos: React.FC<{ palabras: Palabra[]; claves: string[]; arriba?: number }> = ({ palabras, claves, arriba = 1300 }) => {
  const f = useCurrentFrame();
  const gs = grupos(palabras, 3);
  const i = gs.findIndex((_, k) => f < msAFrame(gs[k + 1]?.[0].startMs ?? Infinity));
  const g = gs[i === -1 ? gs.length - 1 : i];
  const clave = new Set(claves.map(limpia));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: arriba, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px' }}>
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

// Modo serie (formato de historias por partes): titulo gigante al empezar, reloj del caso, medidor de tension
// con linea de electrocardiograma que se acelera y aviso de la parte siguiente al final.
export type Serie = { caso: string; parte: number; total: number; reloj: string; titular: string; siguiente?: string };

const Electro: React.FC<{ t: number }> = ({ t }) => {
  const f = useCurrentFrame();
  const vel = 3 + t * 9;
  const periodo = 60 - t * 34;
  const puntos = Array.from({ length: 60 }, (_, i) => {
    const x = i * 6;
    const fase = (i * 6 + f * vel) % periodo;
    const y = fase < 4 ? -4 : fase < 7 ? 26 : fase < 10 ? -30 : fase < 13 ? 10 : 0;
    return `${i ? 'L' : 'M'}${x},${40 + y}`;
  }).join(' ');
  return <svg width={360} height={80}><path d={puntos} fill="none" stroke={crimen.rojo} strokeWidth={5} strokeLinejoin="round" /></svg>;
};

const PanelSerie: React.FC<{ serie: Serie; total: number; arriba?: number }> = ({ serie, total, arriba = 432 }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / total);
  const parpadeo = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: arriba, height: 110, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontFamily: letra.maquina, fontSize: 40, color: crimen.hueso, background: 'rgba(10,10,13,0.75)', border: `3px solid ${crimen.hueso}`, padding: '8px 18px' }}>
        <span style={{ color: crimen.rojo, opacity: parpadeo ? 1 : 0.3 }}>● </span>{serie.reloj}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(10,10,13,0.75)', padding: '0 14px', border: `3px solid ${crimen.rojo}` }}>
        <div style={{ fontFamily: letra.titulo, fontSize: 34, letterSpacing: 3, color: crimen.rojo }}>TENSION</div>
        <div style={{ width: 200, overflow: 'hidden' }}><Electro t={t} /></div>
      </div>
    </div>
  );
};

const Titular: React.FC<{ texto: string; completo?: boolean }> = ({ texto, completo }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 2, 34, 46], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s = interpolate(f, [0, 8], [1.35, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: completo ? 0 : 560, height: completo ? 1920 : 608, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(10,10,13,${(completo ? 0.4 : 0.72) * o})`, opacity: o }}>
      <div style={{ fontFamily: letra.titulo, fontSize: completo ? 230 : 190, lineHeight: 0.95, color: crimen.hueso, textAlign: 'center', padding: '0 40px', transform: `scale(${s})`, textShadow: `0 0 40px ${crimen.rojo}` }}>{texto}</div>
    </div>
  );
};

export const VerticalCrimen: React.FC<{ datos: DatosShort; palabras: Palabra[]; plan: (Escena | Escena[])[]; titulo: string; claves: string[]; parte: number; caso?: string; serie?: Serie; completo?: boolean }> = ({ datos, palabras, plan, titulo, claves, parte, caso = "03", serie, completo = false }) => {
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
            <Plano escena={e.escena} duracion={duracion} completo={completo} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: completo ? 70 : 120, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ fontFamily: letra.titulo, fontSize: 42, letterSpacing: 10, color: crimen.hueso }}>VANISHED FILES</div>
          <div style={{ fontFamily: letra.titulo, fontSize: 34, letterSpacing: 4, color: crimen.rojo, border: `4px solid ${crimen.rojo}`, padding: '0 14px', transform: `rotate(-4deg) scale(${sello})` }}>{serie ? `${serie.caso} · PART ${serie.parte} OF ${serie.total}` : `CASE ${caso} · PART ${parte}`}</div>
        </div>
        {!completo && <div style={{ fontFamily: letra.titulo, fontSize: 92, lineHeight: 1, color: crimen.hueso, marginTop: 26, padding: '0 70px', textShadow: '0 6px 24px rgba(0,0,0,0.8)' }}>{titulo}</div>}
      </AbsoluteFill>
      {serie && <PanelSerie serie={serie} total={total} arriba={completo ? 150 : 432} />}
      {serie && <Titular texto={serie.titular} completo={completo} />}
      <Subtitulos palabras={palabras} claves={claves} arriba={completo ? 1380 : 1300} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 200, opacity: cta }}>
        <div style={{ fontFamily: letra.titulo, fontSize: 56, letterSpacing: 4, color: crimen.hueso, background: crimen.rojo, padding: '14px 40px', transform: `scale(${0.9 + cta * 0.1})` }}>{serie?.siguiente ? `▶ NEXT: ${serie.siguiente}` : '▶ FULL EPISODE ON YOUTUBE'}</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 12, width: `${(f / total) * 100}%`, background: crimen.rojo }} />
    </AbsoluteFill>
  );
};

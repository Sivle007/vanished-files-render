// Serie de TikTok/Reels/Shorts "Tupac: 13 seconds" en 5 partes de 40 s, con el formato de historias por partes:
// titular gigante al empezar, reloj del caso, medidor de tension y aviso de la parte siguiente.
import React from 'react';
import { Composition } from 'remotion';
import { Escena as Plano } from '../Episodio';
import { FPS } from '../estilo';
import { Palabra } from '../Subtitulos';
import { DatosShort } from '../Vertical';
import { Serie, VerticalCrimen, duracionShortCrimen } from '../crimen/VerticalCrimen';
import { Escena, Ficha } from '../crimen/escena';
import { Contador, Nota, Recorte, Rotulo, Tablero } from '../crimen/documentos';
import { Papeles } from '../crimen/objetos';
import { CamaraTV, Coche, CocheAnda, Destellos, Barrotes } from '../crimen/fondos2';
import { SalaJuicio } from '../crimen/sala';
import { ANDERSON, BIGGIE, DEFENSA, DETECTIVE_LV, FISCAL, KADAFI, KEFFE, KEFFE_JOVEN, KEFFE_PRESO, POLICIA_LV, SILUETA, SUGE, TUPAC } from '../crimen/reparto';
import { DatosPersonaje } from '../Personaje';
import shortsJson from '../../public/episodios/04-tupac-serie/shorts.json';
import p1 from '../../public/episodios/04-tupac-serie/short-1-palabras.json';
import p2 from '../../public/episodios/04-tupac-serie/short-2-palabras.json';
import p3 from '../../public/episodios/04-tupac-serie/short-3-palabras.json';
import p4 from '../../public/episodios/04-tupac-serie/short-4-palabras.json';
import p5 from '../../public/episodios/04-tupac-serie/short-5-palabras.json';

const con = (p: DatosPersonaje, extra: Partial<DatosPersonaje>): DatosPersonaje => ({ ...p, ...extra });
const NEGRO = '#111114';
const BLANCO = '#ECE8DE';
type T = { texto: string; sub?: string; pos?: 'abajo' | 'arriba' };

const Cruce = (d: number, o: { cadillac?: 'llega' | 'parado'; disparos?: boolean; texto?: T } = {}) => (
  <Escena
    duracion={d}
    fondo="cruce"
    detras={
      <g>
        <Coche x={900} y={830} color={NEGRO} escala={0.8} ocupantes="tupac" />
        {o.cadillac === 'llega' && <CocheAnda x0={-300} x1={1020} y={990} color={BLANCO} a={4} b={Math.min(50, d - 6)} escala={0.92} />}
        {o.cadillac === 'parado' && <CocheAnda x0={1020} x1={1020} y={990} color={BLANCO} escala={0.92} ventanilla={o.disparos ? [6, 22] : undefined} />}
      </g>
    }
    delante={o.disparos ? <Destellos en={[28, 34, 40, 46]} /> : undefined}
    atm={{ niebla: 0.15, tinte: o.disparos ? 'rgba(160,30,20,0.25)' : undefined }}
    mov={{ zoom: [1.05, 1.18], foco: [50, 70] }}
    texto={o.texto}
  />
);

const Vestibulo = (d: number, gente: { p: DatosPersonaje; x: number; anda?: number; espejo?: boolean }[], texto?: T, zoom: [number, number] = [1.05, 1.2]) => (
  <Escena duracion={d} fondo="vestibulo" gente={gente.map((g) => ({ escala: g.p.id === 'suge' ? 0.6 : 0.55, ...g }))} mov={{ zoom }} texto={texto} />
);

const Plato = (d: number, texto?: T) => (
  <Escena duracion={d} fondo="plato" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 960, escala: 0.7 }]} detras={<CamaraTV x={1300} y={700} />} texto={texto} />
);

const Siguiente = (d: number, n: number, titulo: string) => <Rotulo duracion={d} texto={`PART ${n}`} sub={titulo} sello="TUPAC · 13 SECONDS" />;

type DefParte = { serie: Serie; palabras: Palabra[]; claves: string[]; plan: (Plano | Plano[])[] };

const PARTES: DefParte[] = [
  {
    serie: { caso: 'TUPAC', parte: 1, total: 5, reloj: 'SEP 7, 1996 · 11:15 PM', titular: '13 SECONDS', siguiente: 'THE LOBBY' },
    palabras: p1 as Palabra[],
    claves: ['thirteen', 'seconds', 'BMW', 'red', 'light.', 'right.', 'Cadillac', 'window', 'four', 'dead.', 'lobby.'],
    plan: [
      (d) => Cruce(d),
      (d) => <Escena duracion={d} fondo="vegas" detras={<CocheAnda x0={-200} x1={960} y={900} color={NEGRO} a={0} b={Math.min(70, d - 10)} escala={1.1} ocupantes="tupac" />} mov={{ zoom: [1.1, 1.3], foco: [50, 72] }} texto={{ texto: 'LAS VEGAS · 11:15 PM', pos: 'arriba' }} />,
      (d) => <Escena duracion={d} fondo="cruce" detras={<Coche x={900} y={960} color={NEGRO} escala={1.6} ocupantes="tupac" />} mov={{ zoom: [1.2, 1.45], foco: [50, 72] }} texto={{ texto: 'SUGE DRIVING · TUPAC BESIDE HIM', pos: 'arriba' }} />,
      (d) => Cruce(d, { cadillac: 'llega' }),
      (d) => Cruce(d, { cadillac: 'parado', texto: { texto: 'A WHITE CADILLAC', pos: 'arriba' } }),
      (d) => <Escena duracion={d} fondo="cruce" detras={<CocheAnda x0={960} x1={960} y={960} color={BLANCO} escala={1.6} ventanilla={[6, Math.max(8, d - 6)]} />} mov={{ zoom: [1.15, 1.4], foco: [42, 70] }} atm={{ tinte: 'rgba(120,20,20,0.2)' }} />,
      [(d) => Cruce(d, { cadillac: 'parado', disparos: true }), (d) => <Rotulo duracion={d} texto="SEPTEMBER 13, 1996" sub="Six days later" />],
      (d) => Vestibulo(d, [{ p: TUPAC, x: 760 }, { p: SUGE, x: 560 }, { p: ANDERSON, x: 1250, espejo: true }], { texto: 'HOURS EARLIER…', pos: 'arriba' }),
      (d) => Siguiente(d, 2, 'The lobby'),
    ],
  },
  {
    serie: { caso: 'TUPAC', parte: 2, total: 5, reloj: 'SEP 7, 1996 · 8:45 PM', titular: 'THE LOBBY', siguiente: 'SILENCE' },
    palabras: p2 as Palabra[],
    claves: ['lobby.', 'Tyson', 'Orlando', 'Anderson.', 'runs', 'cameras', 'nothing.', 'uncle', 'Cadillac'],
    plan: [
      (d) => Vestibulo(d, [{ p: TUPAC, x: 500, anda: 300 }, { p: SUGE, x: 320, anda: 300 }]),
      (d) => <Escena duracion={d} fondo="ring" mov={{ zoom: [1.05, 1.25] }} texto={{ texto: 'TYSON WINS IN UNDER 2 MINUTES' }} />,
      [(d) => Vestibulo(d, [{ p: TUPAC, x: 760 }, { p: ANDERSON, x: 1160, espejo: true }]), (d) => <Ficha duracion={d} p={ANDERSON} nombre="ORLANDO ANDERSON" cargo="Southside Compton Crips" />],
      (d) => Vestibulo(d, [{ p: con(TUPAC, { expresion: 'enfado' }), x: 700, anda: 240 }, { p: con(SUGE, { expresion: 'enfado' }), x: 520, anda: 260 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1150, espejo: true }]),
      (d) => Vestibulo(d, [{ p: con(TUPAC, { expresion: 'enfado' }), x: 1000 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1150, espejo: true }], { texto: 'RECORDED', pos: 'arriba' }, [1.2, 1.5]),
      (d) => <Nota duracion={d} tipo="maquina" cabecera="MGM GRAND · SEPT 7, 1996" texto={'No charges pressed.'} />,
      (d) => <Escena duracion={d} fondo="vegas" gente={[{ p: KEFFE_JOVEN, x: 820 }, { p: ANDERSON, x: 1100, espejo: true, escala: 0.55 }]} atm={{ niebla: 0.2 }} texto={{ texto: 'HIS UNCLE WAS IN TOWN' }} />,
      (d) => <Escena duracion={d} fondo="vegas" detras={<CocheAnda x0={-400} x1={2300} y={900} color={BLANCO} a={0} b={d} escala={1} />} texto={{ texto: 'A WHITE CADILLAC', sub: 'according to the man in the front seat' }} />,
      (d) => Siguiente(d, 3, 'Silence'),
    ],
  },
  {
    serie: { caso: 'TUPAC', parte: 3, total: 5, reloj: '1996 → 1998', titular: 'SILENCE', siguiente: 'THE CONFESSION' },
    palabras: p3 as Palabra[],
    claves: ['nobody', 'talked.', 'refused', 'released.', 'denied', 'B.I.G.', '1998,', 'cold.', 'alive.', 'talking.'],
    plan: [
      (d) => <Escena duracion={d} fondo="vegas" detras={<g><Coche x={400} y={880} color="#3A3D44" escala={0.7} /><Coche x={1000} y={880} color="#5A1E24" escala={0.7} /><Coche x={1600} y={880} color="#2A2B30" escala={0.7} /></g>} texto={{ texto: 'DOZENS OF WITNESSES', sub: 'Almost none would talk' }} />,
      [(d) => <Ficha duracion={d} p={KADAFI} nombre="YAKI KADAFI" cargo="In the car right behind" dato="REFUSED TO COOPERATE" />, (d) => <Escena duracion={d} fondo="cementerio" atm={{ niebla: 0.35 }} texto={{ texto: 'NOVEMBER 1996', sub: 'Killed in an unrelated case' }} />],
      [(d) => <Escena duracion={d} fondo="ciudad" hora="noche" gente={[{ p: POLICIA_LV, x: 760 }, { p: con(ANDERSON, { expresion: 'serio' }), x: 1120, espejo: true, escala: 0.55 }]} atm={{ sirena: true }} texto={{ texto: 'ARRESTED' }} />, (d) => <Nota duracion={d} tipo="maquina" cabecera="ORLANDO ANDERSON" texto={'Released.\nDenied any involvement.'} sello="RELEASED" />],
      [(d) => <Ficha duracion={d} p={BIGGIE} nombre="THE NOTORIOUS B.I.G." cargo="March 9, 1997" />, (d) => <Escena duracion={d} fondo="ciudad" hora="noche" detras={<CocheAnda x0={900} x1={2600} y={900} color="#2A2B30" a={10} b={45} escala={0.8} />} texto={{ texto: 'ANOTHER DRIVE-BY' }} />],
      (d) => <Escena duracion={d} fondo="cementerio" atm={{ niebla: 0.3 }} texto={{ texto: 'MAY 1998 · COMPTON', sub: 'Orlando Anderson shot dead' }} />,
      (d) => <Escena duracion={d} fondo="oficina" hora="noche" atm={{ niebla: 0.35 }} detras={<Papeles x={960} y={690} />} mov={{ zoom: [1, 1.2] }} texto={{ texto: 'COLD CASE' }} />,
      (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(SILUETA, { id: 'vivo' }), x: 960, escala: 0.8 }]} mov={{ zoom: [1, 1.2], foco: [50, 40] }} texto={{ texto: 'ONE MAN WAS STILL ALIVE' }} />,
      (d) => Siguiente(d, 4, 'The confession'),
    ],
  },
  {
    serie: { caso: 'TUPAC', parte: 4, total: 5, reloj: '2008 → 2023', titular: 'THE CONFESSION', siguiente: 'VERDICT' },
    palabras: p4 as Palabra[],
    claves: ['television.', 'Keffe', 'D.', 'secret,', 'camera.', 'back.', 'book', 'deal', '2023,', 'arrested'],
    plan: [
      (d) => Plato(d),
      (d) => <Ficha duracion={d} p={KEFFE} nombre={'DUANE "KEFFE D" DAVIS'} cargo="Orlando Anderson's uncle" />,
      [(d) => <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 700, escala: 0.62 }, { p: DETECTIVE_LV, x: 1250, espejo: true }]} texto={{ texto: '2008 · IN SECRET' }} />, (d) => <Nota duracion={d} tipo="maquina" cabecera="PROFFER AGREEMENT · 2008" texto={'What he said in this room\ncould not be used against him.'} sello="PROTECTED" />],
      [(d) => Plato(d, { texto: '2018 · ON CAMERA', sub: 'Front seat. Shots from the back.' }), (d) => <Escena duracion={d} fondo="negro" detras={<Coche x={960} y={760} color={BLANCO} escala={1.4} ventanilla={1} />} texto={{ texto: 'THE BACK SEAT' }} />],
      (d) => <Recorte duracion={d} titular={'"COMPTON STREET LEGEND"'} sub="His memoir" fecha="2019" />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="THE 2008 DEAL" texto={'Protected what he said in the room.\nNot what he said on TV.'} sello="NOT PROTECTED" />,
      (d) => <Escena duracion={d} fondo="ciudad" hora="dia" gente={[{ p: con(KEFFE, { expresion: 'sorpresa' }), x: 760, escala: 0.62 }, { p: POLICIA_LV, x: 1100, espejo: true }, { p: con(POLICIA_LV, { id: 'pol2' }), x: 1300, espejo: true }]} atm={{ sirena: true }} texto={{ texto: 'SEPTEMBER 29, 2023', sub: 'Arrested' }} />,
      (d) => Siguiente(d, 5, 'Verdict'),
    ],
  },
  {
    serie: { caso: 'TUPAC', parte: 5, total: 5, reloj: 'AUG 31, 2026', titular: 'VERDICT' },
    palabras: p5 as Palabra[],
    claves: ['twenty-nine', 'jury', 'gun.', 'fingerprints.', 'words.', 'street', 'three', 'hours.', 'Guilty.', 'nephew…', 'closed.'],
    plan: [
      (d) => <SalaJuicio duracion={d} acusado={KEFFE_PRESO} fiscal={FISCAL} defensa={DEFENSA} mov={{ zoom: [1, 1.12] }} />,
      (d) => <Tablero duracion={d} notas={['NO GUN', 'NO FINGERPRINTS', 'NO NEW WITNESS']} />,
      (d) => Plato(d, { texto: 'HIS OWN WORDS' }),
      (d) => <SalaJuicio duracion={d} acusado={KEFFE_PRESO} fiscal={FISCAL} defensa={DEFENSA} habla="defensa" mov={{ zoom: [1.2, 1.38], foco: [64, 70] }} texto={{ texto: '"STREET STORIES"' }} />,
      (d) => <Contador duracion={d} pasos={[1, 2, 3]} prefijo="<" etiqueta="HOURS OF DELIBERATION" />,
      [(d) => <SalaJuicio duracion={d} acusado={con(KEFFE_PRESO, { expresion: 'serio' })} fiscal={FISCAL} defensa={DEFENSA} habla="juez" mazo mov={{ zoom: [1.15, 1.7], foco: [80, 62] }} texto={{ texto: 'GUILTY' }} />, (d) => <Escena duracion={d} fondo="celda" gente={[{ p: KEFFE_PRESO, x: 960, escala: 0.62 }]} delante={<Barrotes />} texto={{ texto: '40 YEARS TO LIFE', sub: 'He says he will appeal' }} />],
      (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(ANDERSON, { expresion: 'serio' }), x: 960, escala: 0.75, atenuado: 0.25 }]} texto={{ texto: 'THE SHOOTER?', sub: "Davis's claim · never tested in court" }} />,
      (d) => <Rotulo duracion={d} texto="CASE CLOSED?" sub="The questions aren't" sello="TUPAC · 13 SECONDS" />,
    ],
  },
];

export const ComposicionesSerieTupac: React.FC = () => (
  <>
    {PARTES.map((s, i) => {
      const datos = shortsJson.shorts[i] as DatosShort;
      return (
        <Composition
          key={i}
          id={`Serie-T${i + 1}`}
          component={() => <VerticalCrimen datos={datos} palabras={s.palabras} plan={s.plan} titulo={s.serie.titular} claves={s.claves} parte={s.serie.parte} serie={s.serie} completo />}
          width={1080}
          height={1920}
          fps={FPS}
          durationInFrames={duracionShortCrimen(datos)}
        />
      );
    })}
  </>
);

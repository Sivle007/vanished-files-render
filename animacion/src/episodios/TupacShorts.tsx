// Los 6 Shorts de Tupac: narrador en primera persona, final en bucle, maximo 40 s.
// Un plano (o varios) por parrafo, incluido el cierre "Full episode".
import React from 'react';
import { Composition } from 'remotion';
import { Escena as Plano } from '../Episodio';
import { FPS } from '../estilo';
import { Palabra } from '../Subtitulos';
import { DatosShort } from '../Vertical';
import { VerticalCrimen, duracionShortCrimen } from '../crimen/VerticalCrimen';
import { Escena, Ficha } from '../crimen/escena';
import { Balanza, Contador, Giro, Nota, Pregunta, Recorte, Rotulo, Tablero, Velas } from '../crimen/documentos';
import { CamaraTV, Coche, CocheAnda, Destellos, Barrotes } from '../crimen/fondos2';
import { ANDERSON, BIGGIE, DEFENSA, FISCAL, KEFFE, KEFFE_PRESO, MEDICO, SILUETA, SUGE, TUPAC } from '../crimen/reparto';
import { SalaJuicio } from '../crimen/sala';
import { DatosPersonaje } from '../Personaje';
import shorts1 from '../../public/episodios/04-tupac-parte-1/shorts.json';
import shorts2 from '../../public/episodios/04-tupac-parte-2/shorts.json';
import p11 from '../../public/episodios/04-tupac-parte-1/short-1-palabras.json';
import p12 from '../../public/episodios/04-tupac-parte-1/short-2-palabras.json';
import p13 from '../../public/episodios/04-tupac-parte-1/short-3-palabras.json';
import p21 from '../../public/episodios/04-tupac-parte-2/short-1-palabras.json';
import p22 from '../../public/episodios/04-tupac-parte-2/short-2-palabras.json';
import p23 from '../../public/episodios/04-tupac-parte-2/short-3-palabras.json';

const con = (p: DatosPersonaje, extra: Partial<DatosPersonaje>): DatosPersonaje => ({ ...p, ...extra });
const NEGRO = '#111114';
const BLANCO = '#ECE8DE';

// En vertical solo se ve el centro: los coches se colocan cerca del centro del encuadre.
const Cruce = (d: number, o: { cadillac?: 'llega' | 'parado' | 'huye'; disparos?: boolean; texto?: { texto: string; sub?: string } } = {}) => (
  <Escena
    duracion={d}
    fondo="cruce"
    detras={
      <g>
        <Coche x={900} y={830} color={NEGRO} escala={0.8} ocupantes="tupac" />
        {o.cadillac === 'llega' && <CocheAnda x0={-300} x1={1020} y={990} color={BLANCO} a={4} b={Math.min(50, d - 6)} escala={0.92} />}
        {o.cadillac === 'parado' && <CocheAnda x0={1020} x1={1020} y={990} color={BLANCO} escala={0.92} ventanilla={o.disparos ? [6, 22] : undefined} />}
        {o.cadillac === 'huye' && <CocheAnda x0={1020} x1={2700} y={990} color={BLANCO} a={4} b={30} escala={0.92} ventanilla={[0, 1]} />}
      </g>
    }
    delante={o.disparos ? <Destellos en={[28, 34, 40, 46]} /> : undefined}
    atm={{ niebla: 0.15, tinte: o.disparos ? 'rgba(160,30,20,0.25)' : undefined }}
    mov={{ zoom: [1.05, 1.15], foco: [50, 70] }}
    texto={o.texto}
  />
);

const Plato = (d: number, texto?: { texto: string; sub?: string }) => (
  <Escena duracion={d} fondo="plato" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 960, escala: 0.7 }]} detras={<CamaraTV x={1300} y={700} />} texto={texto} />
);

const Juicio = (d: number, habla: 'fiscal' | 'defensa' | 'keffe', texto?: { texto: string; sub?: string }) => (
  <SalaJuicio
    duracion={d}
    acusado={KEFFE_PRESO}
    fiscal={FISCAL}
    defensa={DEFENSA}
    habla={habla === 'keffe' ? 'testigo' : habla}
    mov={{ zoom: [1.2, 1.38], foco: habla === 'keffe' ? [84, 60] : [64, 70] }}
    texto={texto}
  />
);

type DefShort = { id: string; parte: number; datos: DatosShort; palabras: Palabra[]; titulo: string; claves: string[]; plan: (Plano | Plano[])[] };

const SHORTS: DefShort[] = [
  {
    id: 'Short-T1-1', parte: 1, datos: shorts1.shorts[0] as DatosShort, palabras: p11 as Palabra[], titulo: 'THIRTEEN SECONDS AT A RED LIGHT',
    claves: ['thirteen', 'seconds', 'red', 'light.', 'Cadillac.', 'Four', 'bullets.', 'dead.', 'twenty-seven'],
    plan: [
      (d) => Cruce(d, { texto: { texto: '13 SECONDS' } }),
      (d) => <Escena duracion={d} fondo="vegas" detras={<CocheAnda x0={-200} x1={960} y={900} color={NEGRO} a={0} b={Math.min(70, d - 10)} escala={1.1} ocupantes="tupac" />} mov={{ zoom: [1.1, 1.3], foco: [50, 72] }} texto={{ texto: 'LAS VEGAS · 1996', sub: 'Suge driving · Tupac beside him' }} />,
      (d) => Cruce(d, { cadillac: 'llega' }),
      (d) => Cruce(d, { cadillac: 'parado', texto: { texto: 'A WHITE CADILLAC' } }),
      (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 860, escala: 0.55 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1120, escala: 0.55, espejo: true }]} texto={{ texto: 'HOURS EARLIER' }} />,
      (d) => Cruce(d, { cadillac: 'parado', disparos: true }),
      (d) => <Contador duracion={d} pasos={[4]} etiqueta="SHOTS · SIX DAYS LATER, HE WAS GONE" />,
      (d) => <Contador duracion={d} pasos={[1, 10, 20, 27]} etiqueta="YEARS · NOBODY PAID" />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 1" sub="Full episode on Vanished Files" />,
    ],
  },
  {
    id: 'Short-T1-2', parte: 1, datos: shorts1.shorts[1] as DatosShort, palabras: p12 as Palabra[], titulo: 'SHOT FIVE TIMES',
    claves: ['five', 'times…', 'hospital.', 'rob', 'fire.', 'upstairs', 'feud'],
    plan: [
      (d) => <Contador duracion={d} pasos={[1, 2, 3, 4, 5]} etiqueta="TIMES · AND HE WALKED OUT" />,
      (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: TUPAC, x: 700, anda: 260, escala: 0.6 }, { p: con(SILUETA, { id: 'sa1' }), x: 1200, espejo: true }]} texto={{ texto: 'NEW YORK · 1994' }} />,
      (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: con(TUPAC, { expresion: 'miedo', pose: 'brazosArriba' }), x: 860, escala: 0.6 }, { p: con(SILUETA, { id: 'sa2' }), x: 1120, espejo: true }]} delante={<Destellos en={[20, 26, 32, 38, 44]} />} atm={{ tinte: 'rgba(160,30,20,0.3)' }} />,
      (d) => <Escena duracion={d} fondo="hospital" gente={[{ p: TUPAC, x: 820, anda: 300, escala: 0.6 }, { p: MEDICO, x: 1150, espejo: true }]} texto={{ texto: 'AGAINST MEDICAL ADVICE' }} />,
      (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: con(SILUETA, { id: 'up1' }), x: 860, y: 640, escala: 0.42 }, { p: con(BIGGIE, { expresion: 'serio' }), x: 1100, y: 640, escala: 0.44, atenuado: 0.4 }]} mov={{ zoom: [1, 1.2], foco: [50, 50] }} texto={{ texto: 'WHO WAS UPSTAIRS?' }} />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="HE BLAMED THE NEW YORK RAP WORLD" texto={'They always denied it.\nNo one was ever convicted.'} />,
      (d) => <Balanza duracion={d} izq="EAST" der="WEST" />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 1" sub="Full episode on Vanished Files" />,
    ],
  },
  {
    id: 'Short-T1-3', parte: 1, datos: shorts1.shorts[2] as DatosShort, palabras: p13 as Palabra[], titulo: 'THE FIGHT ON CAMERA',
    claves: ['fight', 'killed', 'Tyson', 'Orlando', 'Anderson.', 'cameras', 'nothing.', 'Cadillac', 'red', 'light.'],
    plan: [
      (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 860, escala: 0.55 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1120, escala: 0.55, espejo: true }]} mov={{ zoom: [1.1, 1.25] }} />,
      (d) => <Escena duracion={d} fondo="ring" texto={{ texto: 'UNDER TWO MINUTES' }} />,
      [
        (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: TUPAC, x: 760, escala: 0.55 }, { p: ANDERSON, x: 1160, escala: 0.55, espejo: true }]} />,
        (d) => <Ficha duracion={d} p={ANDERSON} nombre="ORLANDO ANDERSON" cargo="Southside Compton Crips" />,
      ],
      (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 700, anda: 240, escala: 0.55 }, { p: con(SUGE, { expresion: 'enfado' }), x: 560, anda: 260, escala: 0.6 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1150, escala: 0.55, espejo: true }]} texto={{ texto: 'RECORDED' }} />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="MGM GRAND · SEPT 7, 1996" texto={'No charges pressed.'} />,
      (d) => Cruce(d, { cadillac: 'llega', texto: { texto: 'THAT NIGHT' } }),
      (d) => <SalaJuicio duracion={d} fiscal={FISCAL} defensa={DEFENSA} acusado={KEFFE_PRESO} habla="fiscal" mov={{ zoom: [1.2, 1.38], foco: [64, 70] }} texto={{ texto: 'WHERE IT ALL BEGAN', sub: 'according to prosecutors' }} />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 1" sub="Full episode on Vanished Files" />,
    ],
  },
  {
    id: 'Short-T2-1', parte: 2, datos: shorts2.shorts[0] as DatosShort, palabras: p21 as Palabra[], titulo: 'HE CONFESSED ON TV',
    claves: ['TV', 'Keffe', 'D.', '2018,', 'book', 'arrested?', 'secret.', '2023,'],
    plan: [
      (d) => Plato(d),
      (d) => <Ficha duracion={d} p={KEFFE} nombre={'DUANE "KEFFE D" DAVIS'} cargo="In the white Cadillac, by his own account" />,
      (d) => Plato(d, { texto: 'FRONT PASSENGER SEAT', sub: 'The shots came from the back' }),
      (d) => <Recorte duracion={d} titular={'"COMPTON STREET LEGEND"'} sub="His memoir" fecha="2019" />,
      (d) => <Pregunta duracion={d} texto="WHY WASN'T HE ARRESTED?" />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="2008 · PROFFER AGREEMENT" texto={'What he said in secret\ncould not be used against him.'} sello="PROTECTED" />,
      (d) => <Escena duracion={d} fondo="ciudad" hora="dia" gente={[{ p: con(KEFFE, { expresion: 'sorpresa' }), x: 860, escala: 0.62 }]} atm={{ sirena: true }} texto={{ texto: 'SEPTEMBER 2023', sub: 'Arrested' }} />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 2" sub="Full episode on Vanished Files" />,
    ],
  },
  {
    id: 'Short-T2-2', parte: 2, datos: shorts2.shorts[1] as DatosShort, palabras: p22 as Palabra[], titulo: 'UNDER THREE HOURS',
    claves: ['twenty-nine', 'three', 'hours.', 'gun.', 'fingerprints.', 'words.', 'Guilty.', 'Forty'],
    plan: [
      (d) => <Contador duracion={d} pasos={[1, 2, 3]} prefijo="<" etiqueta="HOURS · AFTER 29 YEARS" />,
      (d) => Juicio(d, 'keffe', { texto: 'LAS VEGAS · AUGUST 2026' }),
      (d) => <Tablero duracion={d} notas={['NO GUN', 'NO FINGERPRINTS', 'NO NEW WITNESS']} />,
      (d) => <Pregunta duracion={d} texto="SO WHAT CONVICTED HIM?" />,
      (d) => Plato(d, { texto: 'HIS OWN WORDS' }),
      (d) => Juicio(d, 'defensa', { texto: '"STREET STORIES"' }),
      (d) => <Escena duracion={d} fondo="celda" gente={[{ p: KEFFE_PRESO, x: 960, escala: 0.62 }]} delante={<Barrotes />} texto={{ texto: 'GUILTY · 40 YEARS TO LIFE', sub: 'He says he will appeal' }} />,
      (d) => <Contador duracion={d} pasos={[29]} etiqueta="YEARS · UNDER THREE HOURS" />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 2" sub="Full episode on Vanished Files" />,
    ],
  },
  {
    id: 'Short-T2-3', parte: 2, datos: shorts2.shorts[2] as DatosShort, palabras: p23 as Palabra[], titulo: 'WHO PULLED THE TRIGGER?',
    claves: ['closed.', 'trigger.', 'convicted', 'shooter.', 'back', 'nephew.', 'denied', '1998.'],
    plan: [
      (d) => <Pregunta duracion={d} texto="WHO PULLED THE TRIGGER?" />,
      (d) => <Rotulo duracion={d} texto="CONVICTED · 2026" sub="For organizing the shooting" />,
      (d) => <Escena duracion={d} fondo="negro" detras={<Coche x={960} y={760} color={BLANCO} escala={1.3} ventanilla={1} />} texto={{ texto: 'THE BACK SEAT', sub: 'according to Davis' }} />,
      (d) => <Pregunta duracion={d} texto="WHO WAS BACK THERE?" />,
      (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(ANDERSON, { expresion: 'serio' }), x: 960, escala: 0.75, atenuado: 0.2 }]} texto={{ texto: 'HIS NEPHEW?', sub: 'Davis\'s claim' }} />,
      (d) => <Velas duracion={d} nombres={['ORLANDO ANDERSON · 1998']} />,
      (d) => <Giro duracion={d} texto="NEVER TESTED IN COURT" />,
      (d) => <Rotulo duracion={d} texto="TUPAC · PART 2" sub="Full episode on Vanished Files" />,
    ],
  },
];

export const ComposicionesShortsTupac: React.FC = () => (
  <>
    {SHORTS.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={() => <VerticalCrimen datos={s.datos} palabras={s.palabras} plan={s.plan} titulo={s.titulo} claves={s.claves} parte={s.parte} caso="04" />}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={duracionShortCrimen(s.datos)}
      />
    ))}
  </>
);

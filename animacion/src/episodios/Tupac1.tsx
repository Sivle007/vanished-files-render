// Tupac, Parte 1: un plano (o varios) por parrafo narrado. Sin violencia grafica:
// los disparos se sustituyen por destellos, ventanillas y coches que se alejan.
import React from 'react';
import { Episodio, Escena as Plano, Fondo, calcularTiempos, DatosEpisodio } from '../Episodio';
import { Escena, Ficha, Gente, persona } from '../crimen/escena';
import { Balanza, Contador, Giro, Nota, Pregunta, Recorte, Rotulo, Tablero, Velas } from '../crimen/documentos';
import { LUGARES, MapaCrimen } from '../crimen/mapa';
import { Papeles, Puerta } from '../crimen/objetos';
import { Barrotes, CamaraTV, Coche, CocheAnda, Destellos, Disco, MapaVegas, Semaforo } from '../crimen/fondos2';
import {
  AFENI, AFENI_MAYOR, ANDERSON, BIGGIE, DETECTIVE_LV, JADA, KADAFI, KEFFE, KEFFE_JOVEN, MEDICO, POLICIA_LV, SILUETA, SUGE, TUPAC, TUPAC_JOVEN, TUPAC_NINO,
} from '../crimen/reparto';
import { SalaJuicio } from '../crimen/sala';
import { DatosPersonaje } from '../Personaje';
import datosJson from '../../public/episodios/04-tupac-parte-1/episodio.json';

const datos = datosJson as DatosEpisodio;
const L = LUGARES;
const marca = (lugar: readonly [number, number], texto: string, extra: object = {}) => ({ lat: lugar[0], lon: lugar[1], texto, ...extra });
const con = (p: DatosPersonaje, extra: Partial<DatosPersonaje>): DatosPersonaje => ({ ...p, ...extra });
const NEGRO = '#111114';
const BLANCO = '#ECE8DE';

// El cruce: BMW parado en el carril del fondo y, si se pide, el Cadillac llegando por el carril cercano.
const Cruce = (d: number, o: { cadillac?: 'llega' | 'parado' | 'huye'; disparos?: boolean; texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }; bmwLlega?: boolean; zoom?: [number, number]; ocupantes?: 'tupac' | 'conductor' } = {}) => (
  <Escena
    duracion={d}
    fondo="cruce"
    detras={
      <g>
        {o.bmwLlega ? <CocheAnda x0={-400} x1={820} y={830} color={NEGRO} a={0} b={Math.min(80, d - 10)} escala={0.8} ocupantes={o.ocupantes ?? 'tupac'} /> : <Coche x={820} y={830} color={NEGRO} escala={0.8} ocupantes={o.ocupantes ?? 'tupac'} />}
        {o.cadillac === 'llega' && <CocheAnda x0={-500} x1={980} y={990} color={BLANCO} a={6} b={Math.min(70, d - 10)} escala={0.92} />}
        {o.cadillac === 'parado' && <CocheAnda x0={980} x1={980} y={990} color={BLANCO} escala={0.92} ventanilla={o.disparos ? [8, 28] : undefined} />}
        {o.cadillac === 'huye' && <CocheAnda x0={980} x1={2700} y={990} color={BLANCO} a={6} b={40} escala={0.92} ventanilla={[0, 1]} />}
      </g>
    }
    delante={o.disparos ? <Destellos en={[40, 46, 52, 58]} /> : undefined}
    atm={{ niebla: 0.15, tinte: o.disparos ? 'rgba(160,30,20,0.25)' : undefined }}
    mov={{ zoom: o.zoom ?? (o.bmwLlega ? [1, 1.35] : [1, 1.08]), foco: o.bmwLlega ? [43, 74] : [50, 70] }}
    texto={o.texto}
  />
);

const EnNegro = (d: number, dibujo: React.ReactNode, texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }) => (
  <Escena duracion={d} fondo="negro" detras={dibujo} mov={{ zoom: [1, 1.06] }} texto={texto} />
);

const plan: (Plano | Plano[])[][] = [
  // Hook
  [
    (d) => Cruce(d, { bmwLlega: true, texto: { texto: 'SEPTEMBER 7, 1996', sub: 'Las Vegas · Flamingo Road', pos: 'arriba' } }),
    (d) => Cruce(d, { cadillac: 'llega' }),
    (d) => Cruce(d, { cadillac: 'parado', disparos: true, zoom: [1.1, 1.2] }),
    (d) => <Contador duracion={d} pasos={[1, 5, 10, 20, 27]} etiqueta="YEARS WITHOUT A SINGLE CHARGE" />,
    (d) => <Rotulo duracion={d} texto="TUPAC SHAKUR" sub="PART ONE" sello="CASE FILE 04" />,
  ],
  // The real question
  [
    (d) => <Balanza duracion={d} izq="EAST COAST" der="WEST COAST" />,
    (d) => <Giro duracion={d} texto="BUT HERE'S WHAT'S STRANGE" />,
    (d) => <Tablero duracion={d} notas={['A SUSPECT', 'DETECTIVES', 'TELEVISION', 'A BOOK']} />,
    (d) => <Pregunta duracion={d} texto="WHO KILLED TUPAC?" />,
    (d) => <Pregunta duracion={d} texto="HOW DID IT STAY UNSOLVED?" sub="FOR ALMOST THREE DECADES" />,
    (d) => <MapaCrimen duracion={d} vista="eeuu" marcas={[marca(L.nuevaYork, 'NEW YORK'), marca(L.lasVegas, 'LAS VEGAS', { aparece: 40 })]} rutas={[{ desde: L.nuevaYork, hasta: L.lasVegas, curva: 200, desdeF: 10, hastaF: 50 }]} />,
  ],
  // Born into a fight
  [
    (d) => <Escena duracion={d} fondo="ciudad" hora="noche" atm={{ niebla: 0.25 }} mov={{ zoom: [1.15, 1] }} texto={{ texto: 'JUNE 16, 1971', sub: 'New York City' }} />,
    [
      (d) => <Ficha duracion={d} p={AFENI} nombre="AFENI SHAKUR" cargo="Black Panther Party member" dato="SHE DEFENDED HERSELF" />,
      (d) => <SalaJuicio duracion={d} defensa={con(AFENI, { expresion: 'serio' })} fiscal={persona('fiscal71', { camisa: { color: '#3A3D44', chaqueta: true }, corbata: '#5A1F1C', expresion: 'serio' })} habla="defensa" juradoExpresion="neutral" mov={{ zoom: [1.05, 1.35], foco: [62, 68] }} texto={{ texto: 'ACQUITTED · MAY 1971', sub: 'She defended herself in court' }} />,
    ],
    (d) => <Recorte duracion={d} titular="PANTHER 21: NOT GUILTY" sub="The jury took less than an hour" fecha="MAY 1971" />,
    (d) => <Nota duracion={d} tipo="mano" texto={'Túpac Amaru\nled a rebellion against Spanish rule in Peru'} cabecera="HIS NAME" subrayar />,
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(AFENI, { expresion: 'sonrisa' }), x: 860, escala: 0.7 }, { p: TUPAC_NINO, x: 1110, escala: 0.45, espejo: true }]} texto={{ texto: 'A NAME ABOUT RESISTANCE' }} />,
    (d) => <MapaCrimen duracion={d} vista="eeuu" marcas={[marca(L.nuevaYork, 'NEW YORK'), marca(L.baltimore, 'BALTIMORE', { aparece: 30 }), marca(L.marinCity, 'MARIN CITY', { aparece: 70 })]} rutas={[{ desde: L.nuevaYork, hasta: L.baltimore, curva: 40, desdeF: 8, hastaF: 30 }, { desde: L.baltimore, hasta: L.marinCity, curva: 220, desdeF: 36, hastaF: 80 }]} />,
    (d) => <Escena duracion={d} fondo="ciudad" hora="dia" gente={[{ p: con(TUPAC_JOVEN, { objeto: undefined, expresion: 'sonrisa', pose: 'hablar' }), x: 780 }, { p: JADA, x: 1130, espejo: true }]} texto={{ texto: 'BALTIMORE SCHOOL FOR THE ARTS', sub: 'Where he met Jada Pinkett' }} />,
    [
      (d) => <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: TUPAC_JOVEN, x: 960, escala: 0.7 }]} mov={{ zoom: [1, 1.15], foco: [50, 45] }} texto={{ texto: 'HE READ CONSTANTLY', sub: 'Shakespeare. Poems. Notebooks.' }} />,
      (d) => <Nota duracion={d} tipo="mano" texto={'Poverty.\nViolence.\nMothers raising kids alone.'} cabecera="WHAT HE WROTE ABOUT" />,
    ],
    (d) => <Escena duracion={d} fondo="ciudad" hora="noche" gente={[{ p: con(TUPAC_JOVEN, { objeto: undefined, expresion: 'serio', pose: 'bolsillos' }), x: 900 }, { p: persona('marin1', { piel: '#6E4A33' }), x: 1250, espejo: true, atenuado: 0.3 }]} atm={{ niebla: 0.3 }} texto={{ texto: 'MARIN CITY, CALIFORNIA', sub: 'Small. Poor. Harder.' }} />,
    (d) => <Balanza duracion={d} izq="A POET'S MIND" der="A HARD LIFE" />,
  ],
  // The rise
  [
    [
      (d) => <Escena duracion={d} fondo="concierto" gente={[{ p: con(TUPAC_JOVEN, { objeto: undefined, pose: 'brazosArriba', expresion: 'sonrisa' }), x: 960, y: 800 }]} texto={{ texto: '1990 · DANCER AND ROADIE' }} />,
      (d) => EnNegro(d, <Disco x={960} y={520} titulo={'"SAME SONG"'} />, { texto: 'HIS FIRST VERSE · 1991' }),
    ],
    (d) => <Escena duracion={d} fondo="oficina" gente={[{ p: con(TUPAC_JOVEN, { objeto: undefined, expresion: 'sonrisa' }), x: 600 }, { p: persona('sello', { camisa: { color: '#2E3A4E', chaqueta: true } }), x: 1350, espejo: true }]} detras={<Papeles x={960} y={690} firmas={1} />} texto={{ texto: 'HIS OWN RECORD DEAL' }} />,
    [
      (d) => EnNegro(d, <Disco x={960} y={520} titulo="DEBUT · 1991" color="#3A5A8A" />, { texto: 'RAW. POLITICAL.' }),
      (d) => <Recorte duracion={d} titular={'"NO PLACE IN OUR SOCIETY"'} sub="The Vice President of the United States, about his album" sello="CONTROVERSY" />,
    ],
    (d) => <Escena duracion={d} fondo="plato" gente={[{ p: con(TUPAC, { pose: 'hablar' }), x: 760, escala: 0.65 }]} detras={<CamaraTV x={1400} y={700} />} texto={{ texto: '"JUICE" 1992 · "POETIC JUSTICE" 1993', sub: 'From music to movies' }} />,
    [
      (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: con(TUPAC, { pose: 'hablar', objeto: 'micro' }), x: 760, escala: 0.65 }]} texto={{ texto: 'FURIOUS ONE MINUTE. TENDER THE NEXT.' }} />,
      (d) => EnNegro(d, <Disco x={960} y={520} titulo={'"DEAR MAMA"'} color="#D9B44A" />, { texto: 'A SONG FOR HIS MOTHER' }),
    ],
    (d) => <Tablero duracion={d} notas={['ARRESTED SEVERAL TIMES', 'ATLANTA 1993 · CHARGES DROPPED', '15 DAYS IN JAIL']} />,
    (d) => <Escena duracion={d} fondo="concierto" gente={[{ p: con(TUPAC, { pose: 'brazosArriba' }), x: 960, y: 800, escala: 0.6 }]} detras={<Gente duracion={d} semilla="fans94" filas={2} porFila={12} escala={0.36} y={1080} aplauso />} texto={{ texto: '1994', sub: 'One of the most famous. One of the most watched.', pos: 'arriba' }} />,
    (d) => <Rotulo duracion={d} texto="24 HOURS" sub="that changed his life" />,
  ],
  // The Quad Studios shooting
  [
    (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: TUPAC, x: 200, anda: 500, escala: 0.62 }]} texto={{ texto: 'NOVEMBER 30, 1994', sub: 'Quad Recording Studios · New York' }} />,
    (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: con(TUPAC, { expresion: 'miedo', pose: 'brazosArriba' }), x: 760, escala: 0.62 }, { p: con(SILUETA, { id: 'arm1' }), x: 1200, espejo: true }, { p: con(SILUETA, { id: 'arm2' }), x: 1420, espejo: true }]} delante={<Destellos en={[50, 56, 62, 68, 74]} />} atm={{ tinte: 'rgba(160,30,20,0.3)' }} texto={{ texto: 'ROBBED. SHOT FIVE TIMES.' }} />,
    (d) => <Escena duracion={d} fondo="hospital" gente={[{ p: TUPAC, x: 700, anda: 900, escala: 0.62, espejo: false }, { p: MEDICO, x: 600, espejo: false }]} texto={{ texto: 'HE CHECKED HIMSELF OUT', sub: 'Against medical advice' }} />,
    (d) => <SalaJuicio duracion={d} acusado={con(TUPAC, { expresion: 'serio' })} defensa={persona('abogado94', { camisa: { color: '#2E3A4E', chaqueta: true }, corbata: '#2A2D33', expresion: 'preocupado' })} habla="juez" mazo mov={{ zoom: [1.35, 1.1], foco: [68, 72] }} texto={{ texto: 'THE NEXT DAY: CONVICTED', sub: 'A separate case · sexual abuse · later sentenced to prison' }} />,
    (d) => <Escena duracion={d} fondo="estudio" gente={[{ p: con(SILUETA, { id: 'arriba1' }), x: 1250, y: 640, escala: 0.4 }, { p: con(BIGGIE, { expresion: 'serio' }), x: 1500, y: 640, escala: 0.42, atenuado: 0.4 }]} mov={{ zoom: [1, 1.2], foco: [70, 50] }} texto={{ texto: 'UPSTAIRS THAT NIGHT', sub: 'Sean Combs · The Notorious B.I.G.' }} />,
    (d) => <Escena duracion={d} fondo="concierto" gente={[{ p: con(TUPAC, { expresion: 'sonrisa', pose: 'hablar' }), x: 760 }, { p: con(BIGGIE, { expresion: 'sonrisa' }), x: 1160, espejo: true, escala: 0.68 }]} atm={{ tinte: 'rgba(200,160,80,0.18)' }} texto={{ texto: 'FRIENDS · EARLY 1990s' }} />,
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 960, escala: 0.8 }]} mov={{ zoom: [1, 1.2], foco: [50, 40] }} texto={{ texto: 'HE CAME TO BELIEVE THEY KNEW SOMETHING' }} />,
    (d) => <Nota duracion={d} tipo="maquina" cabecera="QUAD STUDIOS SHOOTING · 1994" texto={'All involvement denied.\nNo one ever convicted.'} sello="UNSOLVED" />,
    (d) => <Rotulo duracion={d} texto="A LINE HAD BEEN DRAWN" />,
  ],
  // Prison and Death Row
  [
    (d) => <Escena duracion={d} fondo="celda" gente={[{ p: con(TUPAC, { bandana: undefined, camisa: { color: '#C9A86A', manga: 'larga' }, pantalon: { color: '#C9A86A' } }), x: 960, escala: 0.65 }]} delante={<Barrotes />} texto={{ texto: '1995 · PRISON, NEW YORK' }} />,
    (d) => EnNegro(d, <Disco x={960} y={520} titulo="NUMBER ONE · 1995" />, { texto: 'HIS ALBUM HIT NUMBER ONE', sub: 'While he was behind bars' }),
    [
      (d) => <Ficha duracion={d} p={SUGE} nombre={'MARION "SUGE" KNIGHT'} cargo="Head of Death Row Records" dato="A DEAL" />,
      (d) => <Escena duracion={d} fondo="oficina" gente={[{ p: con(SUGE, { pose: 'hablar' }), x: 700, escala: 0.72 }, { p: con(TUPAC, { expresion: 'serio' }), x: 1250, espejo: true }]} detras={<Papeles x={960} y={690} firmas={1} />} texto={{ texto: '$1.4 MILLION BOND', sub: 'In return: he signed with Death Row' }} />,
    ],
    [
      (d) => EnNegro(d, <Disco x={960} y={520} titulo="DOUBLE ALBUM · 1996" color="#8A1E18" />, { texto: 'FEBRUARY 1996' }),
      (d) => <Contador duracion={d} pasos={[1, 3, 5, 7, 10]} etiqueta="MILLION COPIES · AND COUNTING" prefijo="+" />,
    ],
    (d) => <MapaCrimen duracion={d} vista="eeuu" marcas={[marca(L.losAngeles, 'DEATH ROW · LA'), marca(L.nuevaYork, 'BAD BOY · NY', { aparece: 30 })]} titulo="RIVAL LABELS" />,
    [
      (d) => <Escena duracion={d} fondo="estudio" hora="noche" gente={[{ p: con(TUPAC, { pose: 'hablar', objeto: 'micro' }), x: 760, escala: 0.65 }]} texto={{ texto: 'SEVERAL SONGS IN A SINGLE NIGHT' }} />,
      (d) => <Recorte duracion={d} titular="A DISS TRACK THAT NAMED NAMES" fecha="JUNE 1996" sub="One of the most aggressive ever recorded" />,
    ],
    (d) => <Recorte duracion={d} titular="EAST COAST VS WEST COAST" sub="Fans take sides" fecha="1996" />,
    (d) => <Balanza duracion={d} izq="BLOODS" der="CRIPS" />,
  ],
  // The fight at the MGM
  [
    [
      (d) => <MapaCrimen duracion={d} vista="eeuu" marcas={[marca(L.losAngeles, 'LOS ANGELES'), marca(L.lasVegas, 'LAS VEGAS', { aparece: 30 })]} rutas={[{ desde: L.losAngeles, hasta: L.lasVegas, curva: 60, avion: true, desdeF: 4, hastaF: 34 }]} />,
      (d) => <Escena duracion={d} fondo="ring" texto={{ texto: 'TYSON VS SELDON', sub: 'MGM Grand · September 7, 1996' }} />,
    ],
    (d) => <Escena duracion={d} fondo="ring" mov={{ zoom: [1.1, 1.25] }} texto={{ texto: 'UNDER TWO MINUTES' }} />,
    [
      (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: TUPAC, x: 300, anda: 300, escala: 0.55 }, { p: SUGE, x: 140, anda: 300, escala: 0.62 }, { p: ANDERSON, x: 1300, escala: 0.55, espejo: true }]} />,
      (d) => <Ficha duracion={d} p={ANDERSON} nombre="ORLANDO ANDERSON" cargo="Member of the Southside Compton Crips" dato="22 YEARS OLD" />,
    ],
    (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 700, anda: 380, escala: 0.55 }, { p: con(SUGE, { expresion: 'enfado' }), x: 450, anda: 420, escala: 0.62 }, { p: persona('sequito1', { piel: '#6E4A33', camisa: { color: '#B3261E', manga: 'corta' } }), x: 300, anda: 500, escala: 0.55 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1300, escala: 0.55, espejo: true }]} texto={{ texto: 'THE LOBBY', sub: 'Tupac attacked him. Others joined in.' }} />,
    (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(ANDERSON, { expresion: 'miedo' }), x: 1200, escala: 0.55, espejo: true }, { p: con(TUPAC, { expresion: 'enfado' }), x: 1050, escala: 0.55 }]} mov={{ zoom: [1, 1.25], foco: [62, 60] }} texto={{ texto: 'THE CAMERAS RECORDED EVERYTHING', pos: 'arriba' }} />,
    (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: persona('seguridad', { camisa: { color: '#1A1A1E', chaqueta: true } }), x: 960 }, { p: con(ANDERSON, { expresion: 'triste' }), x: 1350, espejo: true, escala: 0.55 }]} texto={{ texto: 'NO CHARGES PRESSED', sub: 'Tupac went back to his hotel to change' }} />,
    (d) => <Escena duracion={d} fondo="vegas" gente={[{ p: KEFFE_JOVEN, x: 760, atenuado: 0.3 }, { p: ANDERSON, x: 1060, espejo: true, escala: 0.55 }]} atm={{ niebla: 0.2 }} texto={{ texto: 'HIS UNCLE WAS IN TOWN TOO', sub: 'Word of the beating spread fast' }} />,
    (d) => <Pregunta duracion={d} texto="JUST ANOTHER FIGHT?" />,
    (d) => <Giro duracion={d} texto="IT WASN'T" />,
  ],
  // The drive
  [
    (d) => <Escena duracion={d} fondo="vegas" detras={<g><CocheAnda x0={-400} x1={2400} y={880} color={NEGRO} a={0} b={d} escala={0.8} ocupantes="tupac" /><CocheAnda x0={-1100} x1={1700} y={880} color="#3A3D44" a={0} b={d} escala={0.75} /><CocheAnda x0={-1800} x1={1000} y={880} color="#5A1E24" a={0} b={d} escala={0.75} /></g>} texto={{ texto: 'TO CLUB 662', sub: 'Suge Knight driving · a convoy behind' }} />,
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: TUPAC, x: 960, escala: 0.8 }]} texto={{ texto: 'NO BULLETPROOF VEST', sub: 'That night, he wasn\'t wearing one' }} />,
    (d) => <Escena duracion={d} fondo="vegas" detras={<Coche x={760} y={880} color={NEGRO} escala={0.8} ocupantes="tupac" />} gente={[{ p: POLICIA_LV, x: 1250, espejo: true }]} texto={{ texto: 'AROUND 11:00 PM', sub: 'Loud music. No licence plates. Let go.' }} />,
    [
      (d) => EnNegro(d, <MapaVegas marcas={[{ x: 1180, y: 560, texto: 'FLAMINGO & KOVAL · 11:15 PM', aparece: 30 }]} ruta={[[700, 1080], [700, 560], [1180, 560]]} />),
      (d) => Cruce(d, { bmwLlega: true }),
    ],
    (d) => Cruce(d, { cadillac: 'llega', texto: { texto: 'A WHITE CADILLAC', pos: 'arriba' } }),
    (d) => Cruce(d, { cadillac: 'parado', disparos: true, zoom: [1.05, 1.25] }),
    (d) => <Nota duracion={d} tipo="maquina" cabecera="WHAT HAPPENED IN SECONDS (RECONSTRUCTION)" texto={'Tupac Shakur: hit four times.\nSuge Knight: grazed by fragments.'} />,
    (d) => Cruce(d, { cadillac: 'huye', ocupantes: 'conductor', texto: { texto: 'THEN IT WAS GONE' } }),
  ],
  // Six days
  [
    (d) => <Escena duracion={d} fondo="vegas" detras={<CocheAnda x0={-300} x1={1300} y={880} color={NEGRO} a={0} b={d} escala={0.8} ocupantes="conductor" />} atm={{ sirena: true }} texto={{ texto: 'UNIVERSITY MEDICAL CENTER' }} />,
    (d) => <Escena duracion={d} fondo="hospital" atm={{ tinte: 'rgba(20,40,80,0.3)' }} mov={{ zoom: [1, 1.15], foco: [70, 40] }} texto={{ texto: 'SIX DAYS', sub: 'One lung removed · an induced coma' }} />,
    [
      (d) => <Escena duracion={d} fondo="hospital" gente={[{ p: AFENI_MAYOR, x: 1100, escala: 0.6 }, { p: persona('familia1', { piel: '#6E4A33', expresion: 'triste' }), x: 1300, espejo: true, escala: 0.58 }]} texto={{ texto: 'HIS MOTHER FLEW TO LAS VEGAS' }} />,
      (d) => <Escena duracion={d} fondo="vegas" detras={<Gente duracion={d} semilla="vigilia" filas={2} porFila={12} escala={0.38} y={1060} expresion="triste" />} texto={{ texto: 'VIGILS IN THE DESERT HEAT' }} />,
    ],
    (d) => <Escena duracion={d} fondo="hospital" gente={[{ p: con(AFENI_MAYOR, { pose: 'cara' }), x: 1000, escala: 0.62 }]} atm={{ tinte: 'rgba(10,20,50,0.4)' }} />,
    (d) => <Rotulo duracion={d} texto="SEPTEMBER 13, 1996" sub="4:03 PM · He was 25 years old" />,
    (d) => <Escena duracion={d} fondo="hospital" gente={[{ p: con(POLICIA_LV, { objeto: 'libreta' }), x: 1050, espejo: true }]} texto={{ texto: '"WHO SHOT YOU?"', sub: 'According to the officer, he refused to answer' }} />,
    [
      (d) => <Escena duracion={d} fondo="hospital" detras={<Gente duracion={d} semilla="silencio" filas={2} porFila={11} escala={0.38} y={1060} expresion="triste" />} atm={{ tinte: 'rgba(10,20,50,0.35)' }} texto={{ texto: 'FANS GATHERED IN SILENCE' }} />,
      (d) => <Recorte duracion={d} titular="A VOICE OF HIS GENERATION" sub="The same papers had once called him dangerous" fecha="SEPTEMBER 1996" />,
    ],
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: DETECTIVE_LV, x: 960 }]} texto={{ texto: 'AN INVESTIGATION', sub: 'that almost nobody wanted to help' }} />,
  ],
  // The silence
  [
    (d) => <Escena duracion={d} fondo="vegas" detras={<g><Coche x={400} y={880} color="#3A3D44" escala={0.7} /><Coche x={1000} y={880} color="#5A1E24" escala={0.7} /><Coche x={1600} y={880} color="#2A2B30" escala={0.7} /></g>} texto={{ texto: 'DOZENS OF WITNESSES', sub: 'Almost none would talk' }} />,
    [
      (d) => <Ficha duracion={d} p={KADAFI} nombre="YAKI KADAFI" cargo="Member of Tupac's group · in the car behind" dato="REFUSED TO COOPERATE" />,
      (d) => <Escena duracion={d} fondo="cementerio" atm={{ niebla: 0.35 }} texto={{ texto: 'NOVEMBER 1996 · NEW JERSEY', sub: 'Shot and killed in an unrelated incident' }} />,
    ],
    [
      (d) => <Escena duracion={d} fondo="ciudad" hora="noche" gente={[{ p: POLICIA_LV, x: 700 }, { p: con(ANDERSON, { expresion: 'serio' }), x: 1100, espejo: true, escala: 0.55 }]} atm={{ sirena: true }} texto={{ texto: 'OCTOBER 1996 · COMPTON', sub: 'A huge police sweep' }} />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="ORLANDO ANDERSON" texto={'Released without charges.\nDenied any involvement.'} sello="RELEASED" />,
    ],
    (d) => <Contador duracion={d} pasos={[1, 4, 8, 12]} etiqueta="SHOOTINGS IN ONE WEEK · COMPTON" />,
    [
      (d) => <Ficha duracion={d} p={BIGGIE} nombre="THE NOTORIOUS B.I.G." cargo="Christopher Wallace · 24 years old" />,
      (d) => <Escena duracion={d} fondo="ciudad" hora="noche" detras={<CocheAnda x0={900} x1={2600} y={900} color="#2A2B30" a={20} b={60} escala={0.8} />} texto={{ texto: 'MARCH 9, 1997 · LOS ANGELES', sub: 'Another drive-by. Another case with no arrest.' }} />,
    ],
    (d) => <Velas duracion={d} nombres={['TUPAC · 1996', 'BIGGIE · 1997']} />,
    (d) => <Escena duracion={d} fondo="cementerio" atm={{ niebla: 0.3 }} texto={{ texto: 'MAY 1998', sub: 'Orlando Anderson killed in Compton · police said: unrelated' }} />,
    (d) => <Recorte duracion={d} titular="DID POLICE MISS THE CLUES?" sub="The department disputed the claims" fecha="YEARS LATER" />,
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" atm={{ niebla: 0.35 }} detras={<Papeles x={960} y={690} />} mov={{ zoom: [1, 1.15] }} texto={{ texto: 'COLD CASE' }} />,
  ],
  // The man in the Cadillac
  [
    (d) => <Giro duracion={d} texto="BUT HERE'S THE THING" />,
    (d) => EnNegro(d, <Coche x={960} y={760} color={BLANCO} escala={1.4} />, { texto: 'THEY KNEW EXACTLY WHAT HAPPENED' }),
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(SILUETA, { id: 'superviviente' }), x: 960, escala: 0.8 }]} texto={{ texto: 'ONE OF THEM WAS STILL ALIVE' }} />,
    (d) => <Ficha duracion={d} p={KEFFE} nombre={'DUANE "KEFFE D" DAVIS'} cargo="Southside Compton Crips leader" dato="ORLANDO ANDERSON'S UNCLE" />,
    (d) => <Tablero duracion={d} notas={['SECRET MEETING', 'TV DOCUMENTARY', 'HIS OWN BOOK']} />,
    (d) => EnNegro(d, <Coche x={960} y={760} color={BLANCO} escala={1.4} ventanilla={1} />, { texto: 'THE CADILLAC · THE SEATS · THE GUN', sub: 'His own description' }),
    (d) => <Escena duracion={d} fondo="plato" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 760, escala: 0.65 }]} detras={<CamaraTV x={1400} y={700} />} texto={{ texto: 'AND STILL, NO ARREST' }} />,
    (d) => <Pregunta duracion={d} texto="HOW IS THAT POSSIBLE?" />,
    (d) => <Escena duracion={d} fondo="ciudad" hora="noche" detras={<Puerta x={960} y={930} abre={0} />} gente={[{ p: DETECTIVE_LV, x: 600 }]} atm={{ sirena: true }} />,
    (d) => <Rotulo duracion={d} texto="PART TWO" sub="The knock on the door" sello="CASE FILE 04" />,
  ],
];

const fondos: Fondo[] = [
  { musica: 'musica-tension' },
  { musica: 'musica-misterio' },
  { musica: 'musica-misterio' },
  { musica: 'musica-esperanza' },
  { musica: 'musica-tension' },
  { musica: 'musica-suspense' },
  { musica: 'musica-tension' },
  { musica: 'musica-tenebrosa' },
  { musica: 'musica-triste' },
  { musica: 'musica-misterio' },
  { musica: 'musica-suspense' },
];

const CIERRE = 120;
const cierre = { duracion: CIERRE, escena: null };

export const duracionTupac1 = () => calcularTiempos(datos, CIERRE).total;
export const Tupac1: React.FC = () => <Episodio datos={datos} plan={plan} fondos={fondos} cierre={cierre} />;

void [Semaforo, KEFFE_JOVEN];

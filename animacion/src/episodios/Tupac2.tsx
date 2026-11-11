// Tupac, Parte 2: de la reunion secreta de 2008 al veredicto de 2026. Las acusaciones de Davis
// contra terceros se presentan siempre como su version, negada y nunca probada.
import React from 'react';
import { Episodio, Escena as Plano, Fondo, calcularTiempos, DatosEpisodio } from '../Episodio';
import { Escena, Ficha, Gente, persona } from '../crimen/escena';
import { Balanza, Contador, Cronologia, Giro, Nota, Pregunta, Recorte, Rotulo, Tablero, Velas } from '../crimen/documentos';
import { LUGARES, MapaCrimen } from '../crimen/mapa';
import { Papeles, Puerta } from '../crimen/objetos';
import { Barrotes, CamaraTV, Coche, CocheAnda, Destellos, Disco } from '../crimen/fondos2';
import {
  AFENI, AFENI_MAYOR, ANDERSON, BIGGIE, DEFENSA, DETECTIVE_LV, FISCAL, KEFFE, KEFFE_JOVEN, KEFFE_PRESO, PERIODISTA, POLICIA_LV, SILUETA, SUGE, TUPAC,
} from '../crimen/reparto';
import { SalaJuicio } from '../crimen/sala';
import { DatosPersonaje } from '../Personaje';
import datosJson from '../../public/episodios/04-tupac-parte-2/episodio.json';

const datos = datosJson as DatosEpisodio;
const L = LUGARES;
const marca = (lugar: readonly [number, number], texto: string, extra: object = {}) => ({ lat: lugar[0], lon: lugar[1], texto, ...extra });
const con = (p: DatosPersonaje, extra: Partial<DatosPersonaje>): DatosPersonaje => ({ ...p, ...extra });
const NEGRO = '#111114';
const BLANCO = '#ECE8DE';
const KADING: DatosPersonaje = { ...DETECTIVE_LV, id: 'kading', pelo: 'rapado', barba: undefined, piel: '#F4F1EA', camisa: { color: '#2E3440', chaqueta: true }, corbata: '#5A1F1C' };
const POOLE: DatosPersonaje = { ...DETECTIVE_LV, id: 'poole', pelo: 'corto', colorPelo: '#C9C4BA', piel: '#F4F1EA', barba: 'bigote' };
const JUEZ: DatosPersonaje = { id: 'juez', piel: '#E2B98F', pelo: 'canoso', colorPelo: '#C9C4BA', gafas: true, camisa: { color: '#141317', manga: 'larga' }, pantalon: { color: '#141317' }, zapatos: '#1A1A1E', expresion: 'serio' };

const EnNegro = (d: number, dibujo: React.ReactNode, texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }) => (
  <Escena duracion={d} fondo="negro" detras={dibujo} mov={{ zoom: [1, 1.06] }} texto={texto} />
);

// Sala de interrogatorio: Keffe D frente a detectives (oficina de noche).
const Sala = (d: number, texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }, habla = true) => (
  <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: con(KEFFE, { pose: habla ? 'hablar' : 'quieto', camisa: { color: '#3A3D44', manga: 'larga' } }), x: 640, escala: 0.62 }, { p: KADING, x: 1300, espejo: true }]} atm={{ niebla: 0.15 }} texto={texto} />
);

const Juicio = (d: number, o: { habla?: 'fiscal' | 'defensa' | 'keffe'; texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }; zoom?: [number, number] } = {}) => (
  <SalaJuicio
    duracion={d}
    acusado={KEFFE_PRESO}
    fiscal={FISCAL}
    defensa={DEFENSA}
    habla={o.habla === 'keffe' ? 'testigo' : o.habla ?? null}
    mov={o.habla ? { zoom: o.zoom ?? [1.2, 1.38], foco: o.habla === 'keffe' ? [84, 60] : [64, 70] } : { zoom: o.zoom ?? [1, 1.08] }}
    texto={o.texto}
  />
);

const Plato = (d: number, texto?: { texto: string; sub?: string; pos?: 'abajo' | 'arriba' }) => (
  <Escena duracion={d} fondo="plato" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 760, escala: 0.65 }]} detras={<CamaraTV x={1400} y={700} />} texto={texto} />
);

const plan: (Plano | Plano[])[][] = [
  // Recap
  [
    [
      (d) => <Escena duracion={d} fondo="cruce" detras={<g><Coche x={820} y={830} color={NEGRO} escala={0.8} ocupantes="tupac" /><CocheAnda x0={980} x1={980} y={990} color={BLANCO} escala={0.92} ventanilla={[8, 20]} /></g>} delante={<Destellos en={[30, 36]} />} texto={{ texto: 'PREVIOUSLY', pos: 'arriba' }} />,
      (d) => <Escena duracion={d} fondo="vestibulo" gente={[{ p: con(TUPAC, { expresion: 'enfado' }), x: 900, escala: 0.55 }, { p: con(ANDERSON, { expresion: 'miedo' }), x: 1200, escala: 0.55, espejo: true }]} />,
      (d) => <Velas duracion={d} nombres={['TUPAC · 1996', 'BIGGIE · 1997', 'ANDERSON · 1998']} />,
      (d) => EnNegro(d, <Coche x={960} y={760} color={BLANCO} escala={1.4} />, { texto: 'ONE MAN FROM THE CADILLAC', sub: 'was still alive' }),
    ],
    (d) => <Rotulo duracion={d} texto="TUPAC SHAKUR" sub="PART TWO" sello="CASE FILE 04" />,
  ],
  // The question
  [
    (d) => <Cronologia duracion={d} hitos={[{ fecha: '2008', texto: 'A secret interview' }, { fecha: '2018', texto: 'On television' }, { fecha: '2023', texto: 'Arrested' }, { fecha: '2026', texto: 'The courtroom' }]} />,
    (d) => <Ficha duracion={d} p={KEFFE} nombre={'DUANE "KEFFE D" DAVIS'} cargo="Southside Compton Crips leader" dato="THE LAST MAN ALIVE FROM THE CADILLAC" />,
    (d) => <Pregunta duracion={d} texto="HOW DID HE STAY FREE?" sub="FOR FIFTEEN YEARS" />,
    (d) => <Rotulo duracion={d} texto="2008" />,
  ],
  // The secret meeting
  [
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: con(KEFFE, { expresion: 'preocupado' }), x: 960, escala: 0.62 }]} texto={{ texto: 'A FEDERAL TASK FORCE', sub: 'Interested in the murder of The Notorious B.I.G.' }} />,
    (d) => <Ficha duracion={d} p={KADING} nombre="GREG KADING" cargo="Los Angeles police detective · task force lead" dato="BOTH MURDERS" />,
    [
      (d) => Sala(d, { texto: 'DECEMBER 2008', sub: 'A proffer agreement' }, false),
      (d) => <Nota duracion={d} tipo="maquina" cabecera="PROFFER AGREEMENT · IN SIMPLE TERMS" texto={'What is said in this room\ncannot be used to prosecute him.'} sello="PROTECTED" />,
    ],
    (d) => Sala(d, { texto: 'AND HE TALKED' }),
    (d) => <Tablero duracion={d} notas={['THE WHITE CADILLAC', 'THE GUN', 'WHO SAT WHERE']} />,
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" gente={[{ p: KADING, x: 960 }]} detras={<Papeles x={1400} y={690} />} texto={{ texto: 'A FIRSTHAND ACCOUNT' }} />,
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" detras={<Papeles x={960} y={690} />} atm={{ niebla: 0.35 }} mov={{ zoom: [1, 1.15] }} texto={{ texto: 'BUT IT CAME WITH PROTECTION', sub: 'And for years, nothing happened' }} />,
    (d) => <Recorte duracion={d} titular="DETECTIVE'S BOOK NAMES KEFFE D" sub="Still, no arrest" fecha="2011" />,
    (d) => <Escena duracion={d} fondo="oficina" gente={[{ p: con(POLICIA_LV, { objeto: undefined }), x: 960 }]} texto={{ texto: '"MORE THAN ONE MAN\'S WORD"', sub: 'Las Vegas police' }} />,
  ],
  // The theories
  [
    (d) => <Tablero duracion={d} notas={['THEORY', 'THEORY', 'THEORY', 'THEORY']} />,
    [
      (d) => <Ficha duracion={d} p={SUGE} nombre={'SUGE KNIGHT'} cargo="In prison for an unrelated killing" dato="THE REAL TARGET?" />,
      (d) => <Balanza duracion={d} izq="BEHIND IT?" der="THE TARGET?" />,
    ],
    (d) => <Escena duracion={d} fondo="ciudad" hora="noche" gente={[{ p: con(SILUETA, { id: 'nyrap' }), x: 960, escala: 0.75 }]} atm={{ niebla: 0.35 }} texto={{ texto: 'PAID FOR FROM NEW YORK?', sub: 'Claimed by Keffe D · never proven · always denied' }} />,
    (d) => <Escena duracion={d} fondo="oficina" gente={[{ p: POOLE, x: 960 }]} texto={{ texto: 'RUSSELL POOLE\'S THEORY', sub: 'Corrupt officers? Never proven · rejected by the LAPD' }} />,
    [
      (d) => <Tablero duracion={d} notas={['STILL ALIVE?', 'HIDDEN MESSAGES?', 'NEW ALBUMS?']} />,
      (d) => <Tablero duracion={d} notas={['STILL ALIVE?', 'HIDDEN MESSAGES?', 'NEW ALBUMS?']} sello="NO EVIDENCE" />,
    ],
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" detras={<Papeles x={960} y={690} firmas={0} />} mov={{ zoom: [1.1, 1.3], foco: [50, 65] }} texto={{ texto: 'IN A POLICE FILE', sub: 'the whole time' }} />,
  ],
  // His version of the night
  [
    (d) => <Pregunta duracion={d} texto="WHAT DID HE SAY HAPPENED?" sub="HIS OWN ACCOUNT" />,
    (d) => <Escena duracion={d} fondo="vegas" detras={<CocheAnda x0={-400} x1={2400} y={900} color={BLANCO} a={0} b={d} escala={0.85} />} gente={[]} atm={{ niebla: 0.2 }} texto={{ texto: 'REVENGE FOR HIS NEPHEW', sub: 'His version: they drove around looking for Tupac' }} />,
    (d) => <Nota duracion={d} tipo="maquina" cabecera="THE CADILLAC · ACCORDING TO DAVIS" texto={'Front passenger: Davis.\nDriver: one man.\nBack seat: two men, including Orlando Anderson.'} />,
    (d) => <Escena duracion={d} fondo="cruce" detras={<g><Coche x={820} y={830} color={NEGRO} escala={0.8} ocupantes="tupac" /><CocheAnda x0={-500} x1={980} y={990} color={BLANCO} a={6} b={60} escala={0.92} /></g>} texto={{ texto: 'THE RED LIGHT', sub: 'He said he passed the gun into the back seat' }} />,
    (d) => <Velas duracion={d} nombres={['THE DRIVER', 'BACK SEAT', 'ANDERSON']} />,
    (d) => <Contador duracion={d} pasos={[13]} etiqueta="SECONDS · THE MOST DETAILED ACCOUNT EVER GIVEN" />,
  ],
  // Going public
  [
    (d) => <Rotulo duracion={d} texto="2018" sub="Something extraordinary" />,
    (d) => Plato(d, { texto: 'ON CAMERA', sub: 'Front passenger seat. The shots came from the back.' }),
    (d) => EnNegro(d, <Disco x={960} y={520} titulo="MEMOIR · 2019" color="#2F4F9A" />, { texto: '"COMPTON STREET LEGEND"', sub: 'Describing his role in planning the attack' }),
    (d) => <Nota duracion={d} tipo="mano" texto={'"Parts were exaggerated\nto sell copies."'} cabecera="HIS LATER CLAIM" />,
    (d) => <Rotulo duracion={d} texto="MILLIONS HAD HEARD IT" sub="A man in the car, describing it openly" />,
    (d) => <Escena duracion={d} fondo="plato" gente={[{ p: con(KEFFE, { pose: 'hablar' }), x: 700, escala: 0.65 }, { p: PERIODISTA, x: 1250, espejo: true }]} texto={{ texto: 'INTERVIEW AFTER INTERVIEW' }} />,
    (d) => Plato(d, { texto: 'THE MAN WHO KNEW' }),
    (d) => <Nota duracion={d} tipo="maquina" cabecera="PROFFER AGREEMENT · 2008" texto={'Protects what was said in the room.\nNot what is said on television.'} sello="NO LONGER" />,
  ],
  // The knock on the door
  [
    (d) => <Escena duracion={d} fondo="ciudad" hora="noche" detras={<Puerta x={960} y={930} abre={0.7} />} gente={[{ p: POLICIA_LV, x: 600 }, { p: DETECTIVE_LV, x: 1350, espejo: true }]} atm={{ sirena: true }} texto={{ texto: 'JULY 18, 2023', sub: 'A search in Henderson, Nevada' }} />,
    (d) => <Tablero duracion={d} notas={['COMPUTERS', 'DOCUMENTS', 'A COPY OF HIS BOOK']} />,
    [
      (d) => <Escena duracion={d} fondo="ciudad" hora="dia" gente={[{ p: con(KEFFE, { expresion: 'sorpresa' }), x: 760, escala: 0.62 }, { p: POLICIA_LV, x: 1150, espejo: true }, { p: con(POLICIA_LV, { id: 'policia2' }), x: 1380, espejo: true }]} atm={{ sirena: true }} texto={{ texto: 'SEPTEMBER 29, 2023', sub: 'Arrested near his home' }} />,
      (d) => <Nota duracion={d} tipo="maquina" cabecera="GRAND JURY · CLARK COUNTY, NEVADA" texto={'Duane Davis.\nMurder with use of a deadly weapon.'} sello="INDICTED" />,
    ],
    (d) => <Escena duracion={d} fondo="plato" gente={[{ p: con(DETECTIVE_LV, { pose: 'hablar', objeto: undefined }), x: 960 }]} detras={<CamaraTV x={1500} y={700} />} texto={{ texto: 'WHAT CHANGED?', sub: 'Police: his own decision to talk publicly' }} />,
    (d) => <Velas duracion={d} nombres={['ANDERSON', 'THE DRIVER', 'BACK SEAT']} />,
    (d) => Juicio(d, { texto: { texto: 'NOT GUILTY', sub: 'His plea' } }),
    (d) => <Contador duracion={d} pasos={[1, 10, 20, 27]} etiqueta="YEARS LATER · HEADING TO A COURTROOM" />,
  ],
  // Delays
  [
    (d) => <Pregunta duracion={d} texto="WHY DID HE KEEP TALKING?" />,
    (d) => <Tablero duracion={d} notas={['HIS SIDE OF THE STORY', 'A BOOK', 'PAID APPEARANCES', 'THE MAN WITH THE ANSWER']} />,
    (d) => <Escena duracion={d} fondo="oficina" gente={[{ p: con(FISCAL, { pose: 'hablar' }), x: 960 }]} detras={<CamaraTV x={1450} y={700} />} texto={{ texto: 'A PUBLIC, RECORDED ACCOUNT' }} />,
    (d) => <Cronologia duracion={d} hitos={[{ fecha: '2023', texto: 'Arrest' }, { fecha: '2024', texto: 'Delays' }, { fecha: '2025', texto: 'More delays' }, { fecha: '2026', texto: 'Trial' }]} />,
    [
      (d) => <Rotulo duracion={d} texto="$750,000" sub="Bail set by a judge, for a time" />,
      (d) => <Escena duracion={d} fondo="celda" gente={[{ p: KEFFE_PRESO, x: 960, escala: 0.62 }]} delante={<Barrotes />} texto={{ texto: 'HE STAYED IN JAIL' }} />,
    ],
    (d) => <Recorte duracion={d} titular="TUPAC CASE DELAYED AGAIN" sub="Every hearing made headlines" fecha="2024-2025" />,
    (d) => <Rotulo duracion={d} texto="SUMMER 2026" sub="The trial" />,
  ],
  // The trial
  [
    (d) => <SalaJuicio duracion={d} acusado={KEFFE_PRESO} fiscal={FISCAL} defensa={DEFENSA} juradoExpresion="neutral" mov={{ zoom: [1, 1.7], foco: [38, 50] }} texto={{ texto: 'AUGUST 10, 2026', sub: 'Jury selection · Las Vegas' }} />,
    (d) => Juicio(d, { habla: 'fiscal', texto: { texto: 'HIS OWN WORDS' } }),
    [
      (d) => Plato(d, { texto: 'PLAYED TO THE JURY', sub: 'His interviews' }),
      (d) => Juicio(d, { habla: 'fiscal', texto: { texto: 'THE PROSECUTION', sub: 'Revenge for the MGM fight · he handed over the gun' } }),
    ],
    (d) => Juicio(d, { habla: 'keffe', texto: { texto: 'DAVIS\'S CLAIM', sub: 'Denied by Sean Combs · not on trial · never charged in this case' } }),
    (d) => Juicio(d, { habla: 'defensa', texto: { texto: '"STREET STORIES"', sub: 'No gun. No fingerprints. No new witness.' } }),
    (d) => <Pregunta duracion={d} texto="DID THEY BELIEVE HIM?" />,
  ],
  // The verdict
  [
    (d) => <SalaJuicio duracion={d} acusado={KEFFE_PRESO} fiscal={FISCAL} defensa={DEFENSA} habla="fiscal" mov={{ zoom: [1, 1.12] }} texto={{ texto: 'AUGUST 31, 2026', sub: 'Closing arguments · the jury goes out' }} />,
    (d) => <Contador duracion={d} pasos={[1, 2, 3]} prefijo="<" etiqueta="HOURS OF DELIBERATION" />,
    (d) => <SalaJuicio duracion={d} acusado={con(KEFFE_PRESO, { expresion: 'serio' })} fiscal={FISCAL} defensa={DEFENSA} habla="juez" mazo mov={{ zoom: [1.15, 1.7], foco: [80, 62] }} texto={{ texto: 'GUILTY', sub: 'First-degree murder · with a deadly weapon' }} />,
    (d) => <SalaJuicio duracion={d} acusado={con(KEFFE_PRESO, { expresion: 'serio' })} fiscal={FISCAL} defensa={DEFENSA} publicoExpresion="triste" mov={{ zoom: [1.6, 1.25], foco: [36, 86] }} texto={{ texto: "TUPAC'S FAMILY WAS IN THE ROOM", sub: 'After 29 years, someone held responsible', pos: 'arriba' }} />,
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(AFENI, { expresion: 'serio' }), x: 960, escala: 0.75, atenuado: 0.3 }]} atm={{ niebla: 0.3 }} texto={{ texto: 'AFENI SHAKUR · 1947-2016', sub: 'She never saw this day' }} />,
    (d) => <SalaJuicio duracion={d} acusado={con(KEFFE_PRESO, { expresion: 'serio' })} fiscal={FISCAL} defensa={DEFENSA} habla="juez" mazo mov={{ zoom: [1.7, 1.25], foco: [80, 62] }} texto={{ texto: 'OCTOBER 13, 2026 · 40 YEARS TO LIFE', sub: 'Parole eligibility: 2066' }} />,
    (d) => <Contador duracion={d} pasos={[63, 80, 100, 103]} etiqueta="HIS AGE AT FIRST PAROLE CHANCE" prefijo="" />,
    (d) => <Escena duracion={d} fondo="celda" gente={[{ p: KEFFE_PRESO, x: 960, escala: 0.62 }]} delante={<Barrotes />} texto={{ texto: 'HE SAYS HE WILL APPEAL' }} />,
  ],
  // What remains unknown
  [
    (d) => <Pregunta duracion={d} texto="IS THE CASE CLOSED?" />,
    (d) => <Balanza duracion={d} izq="A CONVICTION" der="OPEN QUESTIONS" inclinar={-8} />,
    (d) => <Escena duracion={d} fondo="foco" gente={[{ p: con(ANDERSON, { expresion: 'serio' }), x: 960, escala: 0.75, atenuado: 0.2 }]} texto={{ texto: 'WHO PULLED THE TRIGGER?', sub: 'Davis says Anderson · he always denied it · died in 1998' }} />,
    (d) => <Tablero duracion={d} notas={['ANYONE ELSE?', 'NO ONE CHARGED', 'ALL DENY IT']} />,
    (d) => <Escena duracion={d} fondo="oficina" hora="noche" detras={<Papeles x={960} y={690} />} atm={{ niebla: 0.3 }} texto={{ texto: 'WHY DID IT TAKE SO LONG?', sub: 'Critics: police had a suspect, and his words, for years' }} />,
    (d) => <Giro duracion={d} texto="ANOTHER CASE REMAINS OPEN" />,
    [
      (d) => <Ficha duracion={d} p={BIGGIE} nombre="THE NOTORIOUS B.I.G." cargo="Christopher Wallace · 1972-1997" />,
      (d) => <Escena duracion={d} fondo="ciudad" hora="noche" detras={<g><Coche x={820} y={830} color="#2A2B30" escala={0.8} /><CocheAnda x0={-500} x1={980} y={990} color="#3A3D44" a={6} b={50} escala={0.92} /></g>} delante={<Destellos en={[60, 66]} />} texto={{ texto: 'MARCH 9, 1997 · LOS ANGELES', sub: 'A red light. A car alongside.' }} />,
    ],
    (d) => <Escena duracion={d} fondo="negro" detras={<g><Coche x={520} y={700} color={NEGRO} escala={0.8} /><Coche x={1400} y={700} color="#2A2B30" escala={0.8} /></g>} texto={{ texto: 'TWO RED LIGHTS · SIX MONTHS APART' }} />,
    (d) => <Nota duracion={d} tipo="maquina" cabecera="THE MURDER OF CHRISTOPHER WALLACE" texto={'No one has ever been charged.'} sello="UNSOLVED" />,
    (d) => <Balanza duracion={d} izq="TUPAC · ANSWERED" der="BIGGIE · OPEN" />,
  ],
  // Our view
  [
    (d) => <Rotulo duracion={d} texto="OUR VIEW" sub="based on the evidence" />,
    (d) => <Tablero duracion={d} notas={['SILENCE', 'A CASE NOT PUSHED', 'A MAN WHO TALKED TOO MUCH']} />,
    [
      (d) => <Escena duracion={d} fondo="concierto" gente={[{ p: con(TUPAC, { pose: 'brazosArriba', expresion: 'sonrisa' }), x: 960, y: 800, escala: 0.6 }]} detras={<Gente duracion={d} semilla="final" filas={2} porFila={12} escala={0.36} y={1080} aplauso />} texto={{ texto: '25 YEARS OLD', sub: 'Hundreds of songs · films · a generation' }} />,
      (d) => <Cronologia duracion={d} hitos={[{ fecha: '1991', texto: 'First album' }, { fecha: '1996', texto: 'Killed in Las Vegas' }, { fecha: '2017', texto: 'Rock and Roll Hall of Fame' }, { fecha: '2023', texto: 'A street in Oakland' }]} />,
    ],
    (d) => <Escena duracion={d} fondo="cruce" detras={<g /> } mov={{ zoom: [1, 1.3], foco: [87, 25] }} atm={{ niebla: 0.2 }} texto={{ texto: 'A RED LIGHT IN LAS VEGAS' }} />,
    (d) => <Balanza duracion={d} izq="1971 · AFENI FREE" der="2026 · A VERDICT" />,
    (d) => <Pregunta duracion={d} texto="IF KEFFE D HAD NEVER TALKED..." sub="WOULD ANYONE HAVE BEEN CONVICTED? TELL US IN THE COMMENTS" />,
    (d) => <Rotulo duracion={d} texto="VANISHED FILES" sub="Follow for the next case file" />,
  ],
];

const fondos: Fondo[] = [
  { musica: 'musica-misterio' },
  { musica: 'musica-misterio' },
  { musica: 'musica-suspense' },
  { musica: 'musica-tenebrosa' },
  { musica: 'musica-tension' },
  { musica: 'musica-suspense' },
  { musica: 'musica-tension' },
  { musica: 'musica-misterio' },
  { musica: 'musica-suspense' },
  { musica: 'musica-tension' },
  { musica: 'musica-triste' },
  { musica: 'musica-triste' },
];

const CIERRE = 120;
const cierre = { duracion: CIERRE, escena: null };

export const duracionTupac2 = () => calcularTiempos(datos, CIERRE).total;
export const Tupac2: React.FC = () => <Episodio datos={datos} plan={plan} fondos={fondos} cierre={cierre} />;

void [AFENI_MAYOR, KEFFE_JOVEN, L, marca, MapaCrimen, persona];

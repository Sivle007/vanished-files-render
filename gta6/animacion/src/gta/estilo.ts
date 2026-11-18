// Identidad visual de "Mapa Neón": synthwave original (atardeceres, palmeras, neón). Sin material de Rockstar.
import { loadFont as cargarAnton } from '@remotion/google-fonts/Anton';
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { loadFont as cargarYellowtail } from '@remotion/google-fonts/Yellowtail';

export const FUENTE_TITULO = cargarAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const FUENTE_TEXTO = cargarInter('normal', { weights: ['500', '700', '900'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const FUENTE_MARCA = cargarYellowtail('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;

export const FPS = 30;

export const C = {
  rosa: '#ff2e88',
  cian: '#29e0ff',
  naranja: '#ff8a3d',
  morado: '#7b2ff7',
  amarillo: '#ffd23f',
  verde: '#3dff9a',
  rojo: '#ff3b3b',
  noche: '#0b0820',
  tinta: '#120c2e',
  blanco: '#fff6fb',
};

// Brillo de neón barato de renderizar (text-shadow en vez de filtros).
export const neon = (color: string, fuerza = 1) =>
  `0 0 ${6 * fuerza}px ${color}, 0 0 ${18 * fuerza}px ${color}, 0 0 ${42 * fuerza}px ${color}aa`;

export type Fondo = 'atardecer' | 'noche' | 'ciudad' | 'playa' | 'pantano';

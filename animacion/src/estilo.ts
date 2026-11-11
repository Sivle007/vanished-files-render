// Identidad visual de Vanished Files: noche polar, hielo y un unico color de acento ambar.
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { loadFont as cargarPlayfair } from '@remotion/google-fonts/PlayfairDisplay';

export const FPS = 30;

export const color = {
  noche: '#060B16',
  profundo: '#0D1A2D',
  azul: '#16304A',
  hielo: '#3E8C92',
  hieloClaro: '#9FCFD3',
  blanco: '#E9F4F5',
  ambar: '#F0A43A',
  rojo: '#C9473F',
};

export const fuente = {
  texto: cargarInter('normal', { weights: ['500', '800'], subsets: ['latin'] }).fontFamily,
  titulo: cargarPlayfair('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily,
};

export const msAFrame = (ms: number) => Math.round((ms / 1000) * FPS);

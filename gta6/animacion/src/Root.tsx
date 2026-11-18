import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { ComposicionesGTA, GUIONES } from './gta/VideoGTA';
import { FondoGTA } from './gta/Fondos';
import { EscenaGTA, Escena } from './gta/Escenas';

// Fotograma de prueba de cualquier segmento, sin audio: props { id, seg, frame }.
const Prueba: React.FC<{ id: string; seg: number }> = ({ id, seg }) => {
  const s = GUIONES[id].segmentos[seg];
  return (
    <AbsoluteFill>
      <FondoGTA tipo={(s.escena as { fondo?: 'noche' }).fondo ?? 'noche'} />
      <EscenaGTA e={s.escena as Escena} duracion={300} />
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <ComposicionesGTA />
    <Composition id="GTA-prueba" component={Prueba} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ id: '06-historia', seg: 4 }} />
  </>
);

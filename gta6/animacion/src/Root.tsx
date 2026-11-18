import React from 'react';
import { AbsoluteFill, Composition, Still } from 'remotion';
import { Miniatura11 } from './gta/Miniatura11';
import { ComposicionesGTA, ConPresentadores, GUIONES } from './gta/VideoGTA';
import { FondoGTA } from './gta/Fondos';
import { EscenaGTA, Escena } from './gta/Escenas';

// Fotograma de prueba de cualquier segmento, sin audio: props { id, seg, frame }.
const Prueba: React.FC<{ id: string; seg: number }> = ({ id, seg }) => {
  const s = GUIONES[id].segmentos[seg];
  return (
    <AbsoluteFill>
      <FondoGTA tipo={(s.escena as { fondo?: 'noche' }).fondo ?? 'noche'} />
      {GUIONES[id].presentadores ? <ConPresentadores s={s as never} dur={300} /> : <EscenaGTA e={s.escena as Escena} duracion={300} />}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <ComposicionesGTA />
    <Still id="GTA-mini-11-confirmado" component={Miniatura11} width={1920} height={1080} />
    <Composition id="GTA-prueba" component={Prueba} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ id: '06-historia', seg: 4 }} />
  </>
);

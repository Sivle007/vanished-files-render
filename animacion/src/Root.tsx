import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './estilo';
import { Tupac1, duracionTupac1 } from './episodios/Tupac1';
import { Tupac2, duracionTupac2 } from './episodios/Tupac2';
import { ComposicionesShortsTupac } from './episodios/TupacShorts';

export const Root: React.FC = () => (
  <>
    <ComposicionesShortsTupac />
    <Composition id="Tupac1" component={Tupac1} width={1920} height={1080} fps={FPS} durationInFrames={duracionTupac1()} />
    <Composition id="Tupac2" component={Tupac2} width={1920} height={1080} fps={FPS} durationInFrames={duracionTupac2()} />
  </>
);

// Subtitulos palabra por palabra: lo dicho en blanco, lo que viene atenuado y las palabras clave en un recuadro ambar.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { color, fuente, msAFrame } from './estilo';

export type Palabra = { text: string; startMs: number; endMs: number };

const limpia = (p: string) => p.toLowerCase().replace(/[^a-z0-9]/g, '');

function agrupar(palabras: Palabra[], maximo: number) {
  const grupos: Palabra[][] = [[]];
  for (const p of palabras) {
    const actual = grupos.at(-1)!;
    const anterior = actual.at(-1)?.text ?? '';
    const corte = /[.?!]$/.test(anterior) || actual.length >= maximo || (/,$/.test(anterior) && actual.length >= 3);
    if (actual.length && corte) grupos.push([]);
    grupos.at(-1)!.push(p);
  }
  return grupos;
}

export const Subtitulos: React.FC<{ palabras: Palabra[]; claves: string[]; abajo?: number; tamano?: number; maximo?: number; margen?: number }> = ({
  palabras, claves, abajo = 110, tamano = 58, maximo = 6, margen = 140,
}) => {
  const frame = useCurrentFrame();
  const grupos = agrupar(palabras, maximo);
  const indice = grupos.findIndex((g, i) => frame < msAFrame((grupos[i + 1]?.[0].startMs ?? Infinity)));
  const grupo = grupos[indice === -1 ? grupos.length - 1 : indice];
  const clave = new Set(claves.map(limpia));

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: abajo, display: 'flex', justifyContent: 'center', padding: `0 ${margen}px` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', fontFamily: fuente.texto, fontSize: tamano, fontWeight: 800, textShadow: '0 4px 18px rgba(0,0,0,0.65)' }}>
        {grupo.map((p, i) => {
          const inicio = msAFrame(p.startMs);
          const dicha = frame >= inicio;
          const pop = interpolate(frame - inicio, [0, 4, 8], [0.92, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const destacada = dicha && clave.has(limpia(p.text));
          return (
            <span
              key={i}
              style={{
                color: dicha ? color.blanco : 'rgba(233,244,245,0.32)',
                transform: `scale(${dicha ? pop : 1})`,
                display: 'inline-block',
                padding: '0 10px',
                borderRadius: 10,
                border: `3px solid ${destacada ? color.ambar : 'transparent'}`,
                background: destacada ? 'rgba(240,164,58,0.16)' : 'transparent',
              }}
            >
              {p.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

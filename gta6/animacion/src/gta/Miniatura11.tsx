import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FondoGTA } from './Fondos';
import { LogoNeon } from './Escenas';
import { Sellito } from './Escenas11';
import { Presentador } from './Presentadores';
import { C, FUENTE_TITULO, neon } from './estilo';

// Miniatura del vídeo 11: Marisol (lo confirmado) frente a Leo soñando (lo imaginado). Sin material de Rockstar.
export const Miniatura11: React.FC = () => (
  <AbsoluteFill>
    <FondoGTA tipo="atardecer" />
    <AbsoluteFill style={{ background: 'linear-gradient(115deg, rgba(10,40,30,0.85) 0%, rgba(10,40,30,0.75) 48%, rgba(60,10,90,0.75) 52%, rgba(60,10,90,0.85) 100%)' }} />
    <div style={{ position: 'absolute', left: 0, bottom: -300 }}>
      <Presentador quien="marisol" expr="orgulloso" habla={false} alto={1150} />
    </div>
    <div style={{ position: 'absolute', right: -20, bottom: -300 }}>
      <Presentador quien="leo" expr="emocionado" habla={false} alto={1150} />
    </div>
    <svg width={520} height={340} viewBox="0 0 520 340" style={{ position: 'absolute', right: 300, top: 40 }}>
      {[[120, 170, 100], [240, 130, 120], [370, 160, 105], [300, 230, 95], [170, 240, 90]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#b06cff" opacity={0.92} />)}
      <circle cx={430} cy={300} r={22} fill="#b06cff" />
      <text x={260} y={225} textAnchor="middle" fontFamily={FUENTE_TITULO} fontSize={170} fill="#fff">???</text>
    </svg>
    <div style={{ position: 'absolute', left: 120, top: 70 }}>
      <Sellito e="confirmado" tam={110} rot={-8} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: FUENTE_TITULO, fontSize: 200, color: C.blanco, textShadow: `0 10px 0 #0b0820, ${neon(C.rosa, 1.2)}`, transform: 'rotate(-3deg)' }}>¿REAL O HYPE?</div>
    </div>
    <div style={{ position: 'absolute', right: 40, top: 30, transform: 'scale(0.45)', transformOrigin: 'top right' }}><LogoNeon tam={120} /></div>
  </AbsoluteFill>
);

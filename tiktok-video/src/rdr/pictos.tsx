// Pictogrammes médicaux plats à contour (coordonnées SVG libres, voir chaque composant).
import React from 'react';

export const INK = '#10243b';
export const TEAL = '#0f8b8d';
export const RED = '#e5383b';
export const YELLOW = '#ffd23f';
export const SKY = '#cfe8f3';
export const PAPER = '#ffffff';
export const BG = '#eef5f8';
export const SKIN = '#f2c6a0';

const S = {stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** Flacon (centré en x, base en y). fill = hauteur de liquide 0..1 ; powder = poudre au fond. */
export const Vial: React.FC<{x: number; y: number; s?: number; label: string; fill?: number; powder?: boolean; tint?: string; cap?: string; tilt?: number}> = ({
  x, y, s = 1, label, fill = 0, powder = false, tint = SKY, cap = TEAL, tilt = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-70} y={-250} width={140} height={250} rx={26} fill={PAPER} {...S} />
    {fill > 0 && <rect x={-64} y={-6 - 236 * fill} width={128} height={236 * fill} rx={20} fill={tint} opacity={0.9} />}
    {powder && <path d="M -60 -8 Q -30 -34 0 -22 Q 30 -36 60 -8 Z" fill="#f4f0e6" stroke={INK} strokeWidth={3} />}
    <rect x={-70} y={-250} width={140} height={250} rx={26} fill="none" {...S} />
    <rect x={-60} y={-160} width={120} height={70} rx={8} fill={PAPER} {...S} strokeWidth={4} />
    <text x={0} y={-114} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={label.length > 6 ? 22 : 34} fill={INK}>
      {label}
    </text>
    <rect x={-44} y={-286} width={88} height={40} rx={8} fill={cap} {...S} />
    <rect x={-30} y={-300} width={60} height={18} rx={4} fill="#c9d3dc" {...S} strokeWidth={4} />
  </g>
);

/**
 * Seringue à insuline U-100, horizontale, aiguille vers la droite.
 * x, y = début du corps (gauche), len = longueur du corps en px, units = graduation remplie (0..max).
 */
export const Syringe: React.FC<{x: number; y: number; len?: number; max?: number; units: number; highlight?: number; s?: number; rot?: number; needle?: boolean}> = ({
  x, y, len = 640, max = 50, units, highlight, s = 1, rot = 0, needle = true,
}) => {
  const h = 74;
  const u = (k: number) => (k / max) * len;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* piston : la tige part du joint (dans le corps) et dépasse à gauche quand on tire */}
      <rect x={len - u(units) - 14 - len * 0.9} y={-12} width={len * 0.9} height={24} fill="#c9d3dc" {...S} strokeWidth={4} />
      <rect x={len - u(units) - 14 - len * 0.9 - 24} y={-38} width={24} height={76} rx={6} fill={TEAL} {...S} strokeWidth={4} />
      {/* corps */}
      <rect x={0} y={-h / 2} width={len} height={h} rx={10} fill={PAPER} {...S} />
      {/* liquide */}
      {units > 0 && <rect x={len - u(units)} y={-h / 2 + 6} width={u(units)} height={h - 12} fill={SKY} />}
      {/* joint du piston */}
      <rect x={len - u(units) - 14} y={-h / 2 + 4} width={14} height={h - 8} rx={3} fill={INK} />
      {/* graduations : 1 trait par unité, long toutes les 5, chiffre toutes les 10 */}
      {Array.from({length: max + 1}, (_, k) => {
        const gx = len - u(k);
        const long = k % 5 === 0;
        return <line key={k} x1={gx} x2={gx} y1={-h / 2} y2={-h / 2 + (long ? 26 : 14)} stroke={highlight === k ? RED : INK} strokeWidth={highlight === k ? 6 : long ? 3 : 2} />;
      })}
      {Array.from({length: max / 10 + 1}, (_, i) => (
        <text key={i} x={len - u(i * 10)} y={-h / 2 - 12} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={800} fontSize={26} fill={highlight === i * 10 ? RED : INK}>
          {i * 10}
        </text>
      ))}
      <rect x={0} y={-h / 2} width={len} height={h} rx={10} fill="none" {...S} />
      {/* embout et aiguille */}
      <path d={`M ${len} -18 L ${len + 40} -8 L ${len + 40} 8 L ${len} 18 Z`} fill="#ff9f1c" {...S} strokeWidth={4} />
      {needle && <line x1={len + 40} y1={0} x2={len + 150} y2={0} stroke="#8a99a8" strokeWidth={5} strokeLinecap="round" />}
    </g>
  );
};

export const Swab: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-80} y={-60} width={160} height={120} rx={14} fill={PAPER} {...S} />
    <path d="M -80 -20 L 80 -20" stroke={INK} strokeWidth={3} strokeDasharray="8 8" />
    <text x={0} y={30} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={30} fill={TEAL}>
      70 %
    </text>
  </g>
);

export const SharpsBox: React.FC<{x: number; y: number; s?: number; open?: number}> = ({x, y, s = 1, open = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-200} width={220} height={200} rx={16} fill={YELLOW} {...S} />
    <rect x={-120} y={-236} width={240} height={46} rx={10} fill={YELLOW} {...S} transform={`rotate(${-open * 18} -120 -213)`} />
    <rect x={-40} y={-226} width={80} height={14} rx={6} fill={INK} opacity={1 - open} />
    <path d="M -50 -130 L 0 -70 L 50 -130" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={0} cy={-150} r={0} />
    <text x={0} y={-24} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={22} fill={INK}>
      AIGUILLES
    </text>
  </g>
);

export const Hands: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`translate(${Math.sin(t * 9) * 14} 0)`}>
      <path d="M -150 60 Q -160 -40 -90 -70 L -20 -60 Q 10 -50 0 -20 L -40 20 Z" fill={SKIN} {...S} />
    </g>
    <g transform={`translate(${-Math.sin(t * 9) * 14} 0)`}>
      <path d="M 150 60 Q 160 -40 90 -70 L 20 -60 Q -10 -50 0 -20 L 40 20 Z" fill={SKIN} {...S} />
    </g>
    {Array.from({length: 9}, (_, i) => {
      const a = i * 0.7 + t * 1.5;
      return <circle key={i} cx={Math.cos(a * 1.7) * 150} cy={-60 + Math.sin(a) * 70 - ((t * 60 + i * 37) % 120)} r={10 + (i % 3) * 7} fill={PAPER} stroke={SKY} strokeWidth={4} opacity={0.9} />;
    })}
  </g>
);

/** Silhouette de face, avec zones d'injection (lit = 0..1 pour ventre, cuisses, bras). */
export const Body: React.FC<{x: number; y: number; s?: number; belly: number; thigh: number; arm: number}> = ({x, y, s = 1, belly, thigh, arm}) => {
  const zone = (v: number) => ({fill: TEAL, opacity: 0.2 + 0.65 * v, stroke: TEAL, strokeWidth: 4});
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-560} r={70} fill={PAPER} {...S} />
      <path d="M -120 -470 Q 0 -500 120 -470 L 150 -150 L 110 -150 L 110 60 L 30 60 L 0 -20 L -30 60 L -110 60 L -110 -150 L -150 -150 Z" fill={PAPER} {...S} />
      <path d="M -120 -470 L -210 -210 L -170 -195 L -110 -380" fill={PAPER} {...S} />
      <path d="M 120 -470 L 210 -210 L 170 -195 L 110 -380" fill={PAPER} {...S} />
      <path d="M -110 60 L -100 420 L -40 420 L -10 60 Z" fill={PAPER} {...S} />
      <path d="M 110 60 L 100 420 L 40 420 L 10 60 Z" fill={PAPER} {...S} />
      {/* nombril */}
      <circle cx={0} cy={-190} r={7} fill={INK} />
      {/* ventre : anneau autour du nombril en laissant 5 cm (le centre) libre */}
      <path d="M -95 -270 L 95 -270 L 95 -110 L -95 -110 Z M 0 -235 A 45 45 0 1 0 0.1 -235 Z" fillRule="evenodd" {...zone(belly)} />
      {/* cuisses : face avant du haut de la cuisse */}
      <rect x={-98} y={90} width={70} height={140} rx={20} {...zone(thigh)} />
      <rect x={28} y={90} width={70} height={140} rx={20} {...zone(thigh)} />
      {/* bras : arrière du haut du bras (représenté sur le côté) */}
      <path d="M -150 -420 L -185 -300 L -150 -290 L -125 -400 Z" {...zone(arm)} />
      <path d="M 150 -420 L 185 -300 L 150 -290 L 125 -400 Z" {...zone(arm)} />
    </g>
  );
};

/** Coupe de peau : épiderme, graisse sous-cutanée, muscle ; pince et aiguille à 90°. */
export const SkinCut: React.FC<{x: number; y: number; pinch: number; needle: number; inject: number}> = ({x, y, pinch, needle, inject}) => {
  const bump = 70 * pinch;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M -380 160 L 380 160 L 380 300 L -380 300 Z`} fill="#c97b6b" {...S} />
      <path d={`M -380 20 Q -150 20 -120 ${20 - bump * 0.4} Q 0 ${-bump * 1.6} 120 ${20 - bump * 0.4} Q 150 20 380 20 L 380 160 L -380 160 Z`} fill="#f7dc9a" {...S} />
      <path d={`M -380 0 Q -150 0 -120 ${-bump * 0.4} Q 0 ${-20 - bump * 1.6} 120 ${-bump * 0.4} Q 150 0 380 0 L 380 20 Q 150 20 120 ${20 - bump * 0.4} Q 0 ${-bump * 1.6} -120 ${20 - bump * 0.4} Q -150 20 -380 20 Z`} fill={SKIN} {...S} strokeWidth={4} />
      <text x={-360} y={-20} fontFamily="Inter Display, Inter" fontWeight={800} fontSize={26} fill={INK}>peau</text>
      <text x={-360} y={110} fontFamily="Inter Display, Inter" fontWeight={800} fontSize={26} fill={INK}>graisse (ici)</text>
      <text x={-360} y={250} fontFamily="Inter Display, Inter" fontWeight={800} fontSize={26} fill={PAPER}>muscle</text>
      {/* doigts qui pincent */}
      {pinch > 0 && (
        <>
          <ellipse cx={-150 + 30 * pinch} cy={-40 - bump * 0.6} rx={40} ry={60} fill={SKIN} {...S} opacity={pinch} />
          <ellipse cx={150 - 30 * pinch} cy={-40 - bump * 0.6} rx={40} ry={60} fill={SKIN} {...S} opacity={pinch} />
        </>
      )}
      {/* aiguille verticale (90°) : descend jusqu'à la graisse */}
      {needle > 0 && (
        <g transform={`translate(0 ${-420 + 300 * needle - bump * 0.8})`}>
          <rect x={-26} y={-260} width={52} height={200} rx={8} fill={PAPER} {...S} />
          <rect x={-20} y={-254 + 188 * inject} width={40} height={188 * (1 - inject)} fill={SKY} />
          <path d="M -12 -60 L 12 -60 L 6 -36 L -6 -36 Z" fill="#ff9f1c" {...S} strokeWidth={3} />
          <line x1={0} y1={-36} x2={0} y2={150} stroke="#8a99a8" strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
      {inject > 0 && <circle cx={0} cy={110 - bump * 0.3} r={10 + 40 * inject} fill={SKY} opacity={0.75} />}
    </g>
  );
};

export const Fridge: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-320} width={240} height={320} rx={20} fill={PAPER} {...S} />
    <line x1={-120} y1={-210} x2={120} y2={-210} {...S} />
    <rect x={80} y={-290} width={14} height={50} rx={6} fill={INK} />
    <rect x={80} y={-180} width={14} height={70} rx={6} fill={INK} />
    <text x={0} y={-90} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={44} fill={TEAL}>
      2–8 °C
    </text>
  </g>
);

export const Warning: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -150 L 160 130 L -160 130 Z" fill={YELLOW} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    <rect x={-12} y={-60} width={24} height={110} rx={10} fill={INK} />
    <circle cx={0} cy={88} r={15} fill={INK} />
  </g>
);

export const Shield: React.FC<{x: number; y: number; s?: number; check?: number}> = ({x, y, s = 1, check = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -170 L 150 -110 Q 160 80 0 180 Q -160 80 -150 -110 Z" fill={TEAL} {...S} strokeWidth={8} />
    <path d="M -60 0 L -10 50 L 70 -50" fill="none" stroke={PAPER} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${220 * check} 300`} />
  </g>
);

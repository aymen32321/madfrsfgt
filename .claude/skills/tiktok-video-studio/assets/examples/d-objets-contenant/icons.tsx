// Pictogrammes plats à contour encre, dessinés dans une boîte 200×200 centrée en (100, 100).
import React from 'react';

export const INK = '#1b1b1f';
export const CREAM = '#f3ede2';
export const ORANGE = '#ff5b1f';
export const TEAL = '#0e6e7e';
export const YELLOW = '#ffc93c';
export const RED = '#e63946';
export const SKY = '#5dade2';
export const PAPER = '#fffaf2';

const S = {stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** Ombre portée dure, décalée en bas à droite. */
export const Shadowed: React.FC<{children: React.ReactNode}> = ({children}) => (
  <g>
    <g transform="translate(7 8)" opacity={0.14}>
      <g style={{filter: 'brightness(0)'}}>{children}</g>
    </g>
    {children}
  </g>
);

const Bottle: React.FC<{x: number; y: number; h?: number}> = ({x, y, h = 120}) => (
  <g>
    <rect x={x - 22} y={y - h} width={44} height={h} rx={14} fill={SKY} {...S} />
    <rect x={x - 12} y={y - h - 18} width={24} height={20} rx={4} fill="#1b4f72" {...S} />
    <rect x={x - 22} y={y - h * 0.62} width={44} height={h * 0.3} fill={PAPER} {...S} />
    <path d={`M ${x - 10} ${y - h + 12} L ${x - 10} ${y - h * 0.68}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);

export const Water = () => (
  <Shadowed>
    <Bottle x={52} y={175} h={110} />
    <Bottle x={148} y={175} h={110} />
    <Bottle x={100} y={180} h={128} />
    <text x={100} y={116} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={26} fill={INK}>
      6 L
    </text>
  </Shadowed>
);

export const Food = () => (
  <Shadowed>
    <rect x={18} y={70} width={80} height={110} rx={6} fill={YELLOW} {...S} />
    <rect x={30} y={95} width={56} height={34} rx={4} fill={PAPER} {...S} />
    <g>
      <rect x={100} y={92} width={78} height={88} fill={ORANGE} {...S} />
      <ellipse cx={139} cy={92} rx={39} ry={12} fill="#c9ced6" {...S} />
      <ellipse cx={139} cy={180} rx={39} ry={12} fill={ORANGE} {...S} />
      <rect x={100} y={118} width={78} height={34} fill={PAPER} stroke={INK} strokeWidth={4} />
    </g>
  </Shadowed>
);

export const FirstAid = () => (
  <Shadowed>
    <path d="M 72 58 L 72 40 Q 72 32 80 32 L 120 32 Q 128 32 128 40 L 128 58" fill="none" {...S} strokeWidth={8} />
    <rect x={22} y={56} width={156} height={120} rx={18} fill={RED} {...S} />
    <rect x={88} y={82} width={24} height={70} rx={4} fill="#fff" {...S} strokeWidth={4} />
    <rect x={65} y={105} width={70} height={24} rx={4} fill="#fff" {...S} strokeWidth={4} />
  </Shadowed>
);

export const Medicine = () => (
  <Shadowed>
    <rect x={30} y={62} width={70} height={118} rx={10} fill="#fff" {...S} />
    <rect x={24} y={38} width={82} height={28} rx={6} fill={ORANGE} {...S} />
    <rect x={40} y={98} width={50} height={40} rx={4} fill={TEAL} {...S} strokeWidth={4} />
    <g transform="rotate(-14 150 125)">
      <rect x={112} y={70} width={78} height={110} rx={12} fill="#d9dee6" {...S} />
      {[0, 1, 2].map((r) => [0, 1].map((c) => <circle key={`${r}${c}`} cx={134 + c * 34} cy={96 + r * 30} r={10} fill="#fff" {...S} strokeWidth={4} />))}
    </g>
  </Shadowed>
);

export const Clothes = () => (
  <Shadowed>
    <path d="M 60 42 L 140 42 L 188 80 L 168 112 L 148 98 L 148 180 L 52 180 L 52 98 L 32 112 L 12 80 Z" fill={TEAL} {...S} />
    <path d="M 78 42 Q 100 66 122 42" fill="none" {...S} />
    {[110, 136, 162].map((y) => (
      <line key={y} x1={56} x2={144} y1={y} y2={y} stroke={PAPER} strokeWidth={6} />
    ))}
    <path d="M 52 98 L 52 180 L 148 180 L 148 98" fill="none" {...S} />
  </Shadowed>
);

export const Blanket = () => (
  <Shadowed>
    <defs>
      <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#f6d77a" />
        <stop offset="0.45" stopColor="#fff3c4" />
        <stop offset="0.55" stopColor="#d9a93b" />
        <stop offset="1" stopColor="#f2c14e" />
      </linearGradient>
    </defs>
    <rect x={30} y={40} width={140} height={130} rx={8} fill="url(#gold)" {...S} />
    <path d="M 30 105 L 170 105 M 100 40 L 100 170" stroke={INK} strokeWidth={3} opacity={0.35} />
    <path d="M 52 60 L 80 60 M 52 72 L 70 72" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
  </Shadowed>
);

export const Flashlight = () => (
  <Shadowed>
    <path d="M 128 72 L 196 40 L 196 132 L 128 100 Z" fill={YELLOW} opacity={0.45} />
    <g transform="rotate(-12 90 90)">
      <rect x={18} y={70} width={84} height={40} rx={10} fill={YELLOW} {...S} />
      <path d="M 102 62 L 132 56 L 132 124 L 102 118 Z" fill={INK} {...S} />
      <rect x={46} y={80} width={20} height={20} rx={4} fill={ORANGE} {...S} strokeWidth={4} />
    </g>
    {[40, 84].map((x) => (
      <g key={x}>
        <rect x={x} y={140} width={36} height={52} rx={6} fill={TEAL} {...S} />
        <rect x={x + 12} y={132} width={12} height={10} rx={2} fill="#c9ced6" {...S} strokeWidth={4} />
      </g>
    ))}
  </Shadowed>
);

export const Candle = () => (
  <Shadowed>
    <path d="M 70 40 Q 54 68 70 82 Q 86 68 70 40 Z" fill={ORANGE} {...S} />
    <path d="M 70 58 Q 63 70 70 76 Q 77 70 70 58 Z" fill={YELLOW} />
    <line x1={70} y1={82} x2={70} y2={92} {...S} />
    <rect x={46} y={92} width={48} height={92} rx={6} fill={PAPER} {...S} />
    <rect x={112} y={118} width={70} height={66} rx={6} fill={RED} {...S} />
    <rect x={112} y={140} width={70} height={18} fill={PAPER} stroke={INK} strokeWidth={4} />
    <g transform="rotate(-30 150 110)">
      <line x1={150} y1={60} x2={150} y2={112} stroke="#c58b4a" strokeWidth={6} strokeLinecap="round" />
      <circle cx={150} cy={58} r={7} fill={RED} {...S} strokeWidth={3} />
    </g>
  </Shadowed>
);

export const Radio = () => (
  <Shadowed>
    <line x1={140} y1={60} x2={176} y2={14} {...S} strokeWidth={6} />
    <rect x={14} y={60} width={172} height={118} rx={18} fill={TEAL} {...S} />
    <circle cx={64} cy={119} r={36} fill={INK} {...S} />
    {[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => <circle key={`${r}${c}`} cx={48 + c * 8} cy={103 + r * 8} r={2.6} fill={CREAM} />))}
    <rect x={112} y={82} width={58} height={26} rx={4} fill={YELLOW} {...S} strokeWidth={4} />
    <line x1={128} y1={86} x2={128} y2={104} stroke={RED} strokeWidth={4} />
    <circle cx={126} cy={146} r={12} fill={PAPER} {...S} strokeWidth={4} />
    <circle cx={160} cy={146} r={12} fill={PAPER} {...S} strokeWidth={4} />
  </Shadowed>
);

export const Tools = () => (
  <Shadowed>
    <g transform="rotate(-20 100 120)">
      <path d="M 70 112 L 54 40 Q 60 34 66 40 L 86 112 Z" fill="#d9dee6" {...S} />
      <path d="M 120 112 L 150 50 Q 158 50 158 58 L 136 114 Z" fill="#d9dee6" {...S} />
      <rect x={30} y={108} width={140} height={46} rx={23} fill={RED} {...S} />
      <rect x={92} y={122} width={18} height={18} rx={3} fill="#fff" />
      <rect x={97} y={118} width={8} height={26} rx={2} fill="#fff" />
    </g>
    <g transform="rotate(25 150 160)">
      <rect x={128} y={150} width={60} height={16} rx={8} fill={INK} />
      <circle cx={128} cy={158} r={14} fill="#d9dee6" {...S} strokeWidth={4} />
    </g>
  </Shadowed>
);

export const Charger = () => (
  <Shadowed>
    <rect x={26} y={60} width={78} height={86} rx={14} fill="#fff" {...S} />
    <line x1={48} y1={60} x2={48} y2={34} {...S} strokeWidth={8} />
    <line x1={82} y1={60} x2={82} y2={34} {...S} strokeWidth={8} />
    <path d="M 65 146 Q 65 190 110 180 Q 140 172 140 140" fill="none" {...S} strokeWidth={6} />
    <rect x={112} y={34} width={64} height={110} rx={12} fill={INK} {...S} />
    <rect x={120} y={46} width={48} height={80} rx={6} fill={SKY} />
    <path d="M 146 66 L 136 88 L 148 88 L 140 108" fill="none" stroke={YELLOW} strokeWidth={5} strokeLinejoin="round" />
  </Shadowed>
);

export const Keys = () => (
  <Shadowed>
    <circle cx={72} cy={64} r={30} fill="none" {...S} strokeWidth={7} />
    <g transform="rotate(30 72 64)">
      <circle cx={72} cy={112} r={20} fill={YELLOW} {...S} />
      <rect x={66} y={128} width={12} height={58} fill={YELLOW} {...S} />
      <rect x={78} y={160} width={12} height={8} fill={YELLOW} {...S} strokeWidth={4} />
      <rect x={78} y={174} width={10} height={8} fill={YELLOW} {...S} strokeWidth={4} />
    </g>
    <rect x={112} y={82} width={60} height={92} rx={22} fill={INK} {...S} />
    <circle cx={142} cy={112} r={9} fill={RED} />
    <circle cx={142} cy={142} r={9} fill="#c9ced6" />
    <line x1={100} y1={70} x2={124} y2={84} {...S} strokeWidth={6} />
  </Shadowed>
);

export const Glasses = () => (
  <Shadowed>
    <path d="M 18 92 L 6 70 M 182 92 L 194 70" {...S} strokeWidth={7} />
    <rect x={14} y={84} width={74} height={56} rx={24} fill={SKY} fillOpacity={0.45} {...S} strokeWidth={8} />
    <rect x={112} y={84} width={74} height={56} rx={24} fill={SKY} fillOpacity={0.45} {...S} strokeWidth={8} />
    <path d="M 88 104 Q 100 92 112 104" fill="none" {...S} strokeWidth={7} />
    <path d="M 32 98 L 46 98 M 130 98 L 144 98" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
  </Shadowed>
);

export const Cash = () => (
  <Shadowed>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 8 - 8} ${-i * 12}) rotate(${-6 + i * 4} 100 110)`}>
        <rect x={20} y={70} width={140} height={78} rx={8} fill="#7cc576" {...S} />
        <circle cx={90} cy={109} r={20} fill="#a8dba3" {...S} strokeWidth={4} />
        <text x={90} y={118} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={24} fill={INK}>
          €
        </text>
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={162} cy={180 - i * 12} rx={26} ry={10} fill={YELLOW} {...S} strokeWidth={4} />
    ))}
  </Shadowed>
);

export const Documents = () => (
  <Shadowed>
    <g transform="rotate(8 120 100)">
      <rect x={84} y={24} width={100} height={136} rx={6} fill={PAPER} {...S} />
      {[52, 72, 92, 112, 132].map((y) => (
        <line key={y} x1={100} x2={166} y1={y} y2={y} stroke={INK} strokeWidth={4} opacity={0.4} strokeLinecap="round" />
      ))}
    </g>
    <rect x={14} y={92} width={136} height={88} rx={10} fill="#dbe9f6" {...S} />
    <rect x={26} y={106} width={42} height={52} rx={4} fill={TEAL} {...S} strokeWidth={4} />
    <circle cx={47} cy={124} r={9} fill={PAPER} />
    {[114, 132, 150].map((y, i) => (
      <line key={y} x1={80} x2={i === 2 ? 116 : 138} y1={y} y2={y} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    ))}
  </Shadowed>
);

export const Games = () => (
  <Shadowed>
    <g transform="rotate(-14 70 100)">
      <rect x={20} y={40} width={84} height={120} rx={10} fill={PAPER} {...S} />
    </g>
    <g transform="rotate(8 110 100)">
      <rect x={62} y={32} width={84} height={120} rx={10} fill={PAPER} {...S} />
      <path d="M 104 108 C 80 88 86 70 104 82 C 122 70 128 88 104 108 Z" fill={RED} stroke={INK} strokeWidth={4} />
    </g>
    <g transform="rotate(14 160 158)">
      <rect x={128} y={126} width={62} height={62} rx={12} fill={ORANGE} {...S} />
      {[
        [144, 142],
        [174, 172],
        [159, 157],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={5.5} fill={PAPER} />
      ))}
    </g>
  </Shadowed>
);

export const Wave = () => (
  <Shadowed>
    <path d="M 20 120 Q 50 60 90 90 Q 120 112 150 80 Q 170 60 185 82 L 185 170 L 20 170 Z" fill={SKY} {...S} />
    <path d="M 20 140 Q 55 120 90 140 Q 125 160 160 140 Q 175 132 185 138" fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" />
  </Shadowed>
);

export const Flame = () => (
  <Shadowed>
    <path d="M 100 20 Q 150 80 150 120 Q 150 175 100 180 Q 50 175 50 120 Q 50 90 75 70 Q 80 100 95 100 Q 85 60 100 20 Z" fill={ORANGE} {...S} />
    <path d="M 100 100 Q 125 130 120 150 Q 115 168 100 168 Q 85 168 80 150 Q 78 130 100 100 Z" fill={YELLOW} {...S} strokeWidth={4} />
  </Shadowed>
);

export const Wind = () => (
  <Shadowed>
    {[60, 100, 140].map((y, i) => (
      <path key={y} d={`M 20 ${y} L ${130 - i * 20} ${y} Q ${170 - i * 20} ${y} ${165 - i * 20} ${y - 28} Q ${158 - i * 20} ${y - 46} ${140 - i * 20} ${y - 36}`} fill="none" {...S} strokeWidth={12} />
    ))}
  </Shadowed>
);

export const Bolt = () => (
  <Shadowed>
    <path d="M 115 15 L 45 115 L 95 115 L 80 185 L 155 80 L 105 80 Z" fill={YELLOW} {...S} />
  </Shadowed>
);

export const ICONS_BY_NAME = {Water, Food, FirstAid, Medicine, Clothes, Blanket, Flashlight, Candle, Radio, Tools, Charger, Keys, Glasses, Cash, Documents, Games, Wave, Flame, Wind, Bolt};

export const ITEMS = [Water, Food, FirstAid, Medicine, Clothes, Blanket, Flashlight, Candle, Radio, Tools, Charger, Keys, Glasses, Cash, Documents, Games];

/** Rendu d'un pictogramme dans un SVG autonome. */
export const Icon: React.FC<{C: React.FC; size: number; style?: React.CSSProperties}> = ({C, size, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', ...style}}>
    <C />
  </svg>
);

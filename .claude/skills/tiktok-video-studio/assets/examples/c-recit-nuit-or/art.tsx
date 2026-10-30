// Éléments dessinés en SVG (coordonnées du canevas 1080×1920).
import React from 'react';

export const GOLD = '#f0c45a';
export const GOLD_SOFT = '#e8c27a';
export const CREAM = '#f6e7bd';

export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Defs = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="bigGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
    <filter id="smoke" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <linearGradient id="wood" x1="0" x2="1">
      <stop offset="0" stopColor="#3b2715" />
      <stop offset="0.35" stopColor="#6e4a2a" />
      <stop offset="0.6" stopColor="#5a3b20" />
      <stop offset="1" stopColor="#2c1c0e" />
    </linearGradient>
    <radialGradient id="domeFill" cx="0.5" cy="1" r="0.9">
      <stop offset="0" stopColor={GOLD} stopOpacity="0.35" />
      <stop offset="0.6" stopColor={GOLD} stopOpacity="0.08" />
      <stop offset="1" stopColor={GOLD} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="dotGlow">
      <stop offset="0" stopColor="#fff6da" stopOpacity="0.9" />
      <stop offset="0.3" stopColor={GOLD} stopOpacity="0.35" />
      <stop offset="1" stopColor={GOLD} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* ---------- Ciel ---------- */

export const Stars: React.FC<{t: number; opacity?: number}> = ({t, opacity = 1}) => (
  <g opacity={opacity}>
    {Array.from({length: 90}, (_, i) => {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rand(i + 5)) + i));
      return <circle key={i} cx={rand(i) * 1080} cy={rand(i + 40) * 1920} r={0.8 + rand(i + 80) * 1.6} fill="#fff" opacity={0.15 + 0.45 * tw * rand(i + 9)} />;
    })}
  </g>
);

export const Moon: React.FC<{id: string; x: number; y: number; r: number; light?: number; full?: boolean}> = ({id, x, y, r, light = 1, full}) => (
  <g opacity={0.25 + 0.75 * light}>
    <circle cx={x} cy={y} r={r * 2.2} fill="url(#dotGlow)" opacity={0.55 * light} />
    <mask id={id}>
      <circle cx={x} cy={y} r={r} fill="white" />
      {!full && <circle cx={x + r * 0.42} cy={y - r * 0.18} r={r * 0.86} fill="black" />}
    </mask>
    <circle cx={x} cy={y} r={r} fill={CREAM} mask={`url(#${id})`} />
  </g>
);

/* ---------- Tonneaux de dattes ---------- */

const Dates: React.FC<{cx: number; cy: number; rx: number; ry: number; n: number; seed: number}> = ({cx, cy, rx, ry, n, seed}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      // points répartis dans une demi-ellipse (monticule)
      const a = rand(seed + i) * Math.PI;
      const d = Math.sqrt(rand(seed + i + 500));
      const x = cx + Math.cos(a) * rx * d;
      const y = cy - Math.sin(a) * ry * d;
      const rot = rand(seed + i + 900) * 180;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <ellipse rx={11} ry={7} fill="#a8481a" stroke="#4a1d08" strokeWidth={1.5} />
          <ellipse cx={-3} cy={-2} rx={4} ry={2} fill="#e0874a" opacity={0.7} />
        </g>
      );
    })}
  </g>
);

const Barrel: React.FC<{x: number; base: number; w: number; h: number; seed: number; glow?: number}> = ({x, base, w, h, seed, glow = 0}) => {
  const top = base - h;
  const bulge = w * 0.08;
  const body = `M ${x - w / 2} ${top} Q ${x - w / 2 - bulge} ${top + h / 2} ${x - w / 2} ${base} L ${x + w / 2} ${base} Q ${x + w / 2 + bulge} ${top + h / 2} ${x + w / 2} ${top} Z`;
  return (
    <g>
      {glow > 0 && <circle cx={x} cy={top} r={w * 0.9} fill="url(#dotGlow)" opacity={glow} />}
      <path d={body} fill="url(#wood)" stroke="#1e1209" strokeWidth={2} />
      {[-0.25, 0, 0.25].map((k) => (
        <path key={k} d={`M ${x + k * w} ${top} Q ${x + k * w * 1.15} ${top + h / 2} ${x + k * w} ${base}`} stroke="#2a1a0c" strokeWidth={2} fill="none" opacity={0.7} />
      ))}
      {[0.22, 0.78].map((k) => (
        <path key={k} d={`M ${x - w / 2 - bulge * 0.6} ${top + h * k} Q ${x} ${top + h * k + 8} ${x + w / 2 + bulge * 0.6} ${top + h * k}`} stroke="#24170b" strokeWidth={7} fill="none" />
      ))}
      <ellipse cx={x} cy={top} rx={w / 2} ry={w * 0.12} fill="#22150a" stroke="#4a3018" strokeWidth={3} />
      <Dates cx={x} cy={top + 4} rx={w * 0.4} ry={w * 0.18} n={14} seed={seed} />
    </g>
  );
};

export const Sacks: React.FC<{base?: number; glowMid?: number; opacity?: number}> = ({base = 1070, glowMid = 0, opacity = 1}) => (
  <g opacity={opacity}>
    <ellipse cx={540} cy={base} rx={330} ry={26} fill="#000" opacity={0.45} />
    <line x1={120} x2={960} y1={base} y2={base} stroke={GOLD} strokeOpacity={0.18} strokeWidth={2} />
    <Barrel x={392} base={base} w={150} h={170} seed={10} />
    <Barrel x={688} base={base} w={150} h={170} seed={60} />
    <Barrel x={540} base={base - 4} w={175} h={220} seed={110} glow={glowMid} />
    <Dates cx={540} cy={base + 4} rx={240} ry={52} n={52} seed={300} />
  </g>
);

/* ---------- Personnages symboliques ---------- */

export const Dot: React.FC<{x: number; y: number; r?: number; intensity?: number}> = ({x, y, r = 9, intensity = 1}) => (
  <g opacity={intensity}>
    <circle cx={x} cy={y} r={r * 7} fill="url(#dotGlow)" />
    <circle cx={x} cy={y} r={r} fill="#fff8e2" />
  </g>
);

export const Smoke: React.FC<{x: number; y: number; t: number; scale?: number; opacity?: number}> = ({x, y, t, scale = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={150} ry={95} fill="#4a35a8" opacity={0.35} filter="url(#bigGlow)" />
    <g filter="url(#smoke)">
      {[
        [-55, 8, 52],
        [0, -12, 62],
        [55, 6, 50],
        [-20, 30, 44],
        [30, 32, 42],
      ].map(([dx, dy, r], i) => (
        <circle
          key={i}
          cx={dx + Math.sin(t * 1.3 + i * 2) * 7}
          cy={dy + Math.cos(t * 1.1 + i) * 6}
          r={r + Math.sin(t * 2 + i) * 4}
          fill="#0a0812"
        />
      ))}
    </g>
  </g>
);

// Lasso doré : arcs d'ellipse qui tournent autour de la fumée.
export const Lasso: React.FC<{x: number; y: number; t: number; draw: number; open?: number; rx?: number; ry?: number}> = ({x, y, t, draw, open = 0, rx = 150, ry = 70}) => {
  const len = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#glow)">
      {[0, 1].map((k) => (
        <ellipse
          key={k}
          rx={rx * (1 + k * 0.1 + open * 0.6)}
          ry={ry * (1 + k * 0.12 + open * 0.6)}
          fill="none"
          stroke={GOLD}
          strokeWidth={k ? 3 : 4.5}
          strokeLinecap="round"
          strokeDasharray={`${len * draw * (k ? 0.55 : 0.78)} ${len}`}
          strokeDashoffset={-len * (t * 0.18 * (k ? -1 : 1) + k * 0.4)}
          transform={`rotate(${-6 + k * 4} 0 0)`}
          opacity={(1 - open) * (k ? 0.7 : 1)}
        />
      ))}
    </g>
  );
};

export const Waves: React.FC<{x: number; y: number; w: number; n: number; t: number; draw: number[]; gap?: number}> = ({x, y, w, n, t, draw, gap = 34}) => (
  <g filter="url(#glow)">
    {Array.from({length: n}, (_, k) => {
      const pts = Array.from({length: 41}, (_, i) => {
        const px = x - w / 2 + (w * i) / 40;
        const py = y + k * gap + Math.sin(i / 40 * Math.PI * 3 + t * 2.4 + k) * 11;
        return `${i ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
      }).join(' ');
      const d = draw[k] ?? 0;
      return <path key={k} d={pts} fill="none" stroke={GOLD} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${w * 1.5 * d} 3000`} opacity={Math.min(1, d * 3)} />;
    })}
  </g>
);

export const Dome: React.FC<{cx: number; base: number; r: number; draw: number; glow: number}> = ({cx, base, r, draw, glow}) => {
  const len = Math.PI * r;
  return (
    <g>
      <path d={`M ${cx - r} ${base} A ${r} ${r} 0 0 1 ${cx + r} ${base} Z`} fill="url(#domeFill)" opacity={glow} />
      <path
        d={`M ${cx - r} ${base} A ${r} ${r} 0 0 1 ${cx + r} ${base}`}
        fill="none"
        stroke={GOLD}
        strokeWidth={3}
        strokeOpacity={0.85}
        strokeDasharray={`${len * draw} ${len}`}
        filter="url(#glow)"
      />
      {Array.from({length: 13}, (_, i) => {
        const a = Math.PI - (i / 12) * Math.PI;
        return (
          <circle key={i} cx={cx + Math.cos(a) * r} cy={base - Math.sin(a) * r} r={3} fill={CREAM} opacity={draw > i / 12 ? 0.8 : 0} />
        );
      })}
      <ellipse cx={cx} cy={base} rx={r} ry={14} fill="none" stroke={GOLD} strokeOpacity={0.5 * draw} strokeWidth={2} />
    </g>
  );
};

/* ---------- Chambre ---------- */

export const Bed: React.FC<{cx: number; base: number; dot?: number}> = ({cx, base, dot = 1}) => {
  const w = 560;
  const l = cx - w / 2;
  return (
    <g>
      <ellipse cx={cx} cy={base + 6} rx={w / 2 + 20} ry={18} fill="#000" opacity={0.5} />
      {/* tête de lit */}
      <rect x={l} y={base - 230} width={46} height={230} rx={20} fill="#1a1830" stroke={GOLD_SOFT} strokeWidth={3} />
      {/* pied de lit */}
      <rect x={l + w - 26} y={base - 120} width={26} height={120} rx={10} fill="#1a1830" stroke={GOLD_SOFT} strokeWidth={3} />
      {/* sommier et matelas */}
      <rect x={l + 30} y={base - 70} width={w - 40} height={36} rx={6} fill="#14122a" stroke={GOLD_SOFT} strokeWidth={2.5} />
      <path d={`M ${l + 46} ${base - 70} L ${l + 46} ${base - 104} Q ${l + 46} ${base - 112} ${l + 56} ${base - 112} L ${l + w - 40} ${base - 112} Q ${l + w - 30} ${base - 112} ${l + w - 30} ${base - 100} L ${l + w - 30} ${base - 70} Z`} fill="#2d2858" stroke={GOLD_SOFT} strokeWidth={2} />
      {/* couverture */}
      <path d={`M ${l + 200} ${base - 70} L ${l + 210} ${base - 128} Q ${l + 230} ${base - 142} ${l + 300} ${base - 140} L ${l + w - 40} ${base - 134} Q ${l + w - 28} ${base - 130} ${l + w - 30} ${base - 112} L ${l + w - 30} ${base - 70} Z`} fill="#3b3478" stroke={GOLD_SOFT} strokeWidth={2} />
      {/* oreiller */}
      <rect x={l + 60} y={base - 150} width={120} height={44} rx={20} fill="#4a4470" stroke={GOLD_SOFT} strokeWidth={2} />
      {/* pieds */}
      <line x1={l + 40} x2={l + 40} y1={base - 34} y2={base} stroke={GOLD_SOFT} strokeWidth={3} />
      <line x1={l + w - 20} x2={l + w - 20} y1={base - 34} y2={base} stroke={GOLD_SOFT} strokeWidth={3} />
      <Dot x={l + 128} y={base - 135} r={7} intensity={dot} />
    </g>
  );
};

export const Window: React.FC<{cx: number; top: number}> = ({cx, top}) => {
  const w = 260;
  const h = 330;
  const l = cx - w / 2;
  return (
    <g>
      <circle cx={cx} cy={top + h / 2} r={260} fill="url(#dotGlow)" opacity={0.18} />
      <path d={`M ${l} ${top + h} L ${l} ${top + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${l + w} ${top + w / 2} L ${l + w} ${top + h} Z`} fill="#141834" stroke={GOLD_SOFT} strokeWidth={4} />
      <line x1={cx} x2={cx} y1={top} y2={top + h} stroke={GOLD_SOFT} strokeWidth={3} />
      <line x1={l} x2={l + w} y1={top + h * 0.58} y2={top + h * 0.58} stroke={GOLD_SOFT} strokeWidth={3} />
      <rect x={l - 20} y={top + h} width={w + 40} height={10} rx={4} fill="#1a1830" stroke={GOLD_SOFT} strokeWidth={2} />
      <Moon id="winMoon" x={cx + 50} y={top + 95} r={30} />
    </g>
  );
};

/* ---------- Partage ---------- */

export const ShareArrow: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#glow)">
    <path d="M -40 30 Q -40 -20 10 -20 L 10 -45 L 55 -5 L 10 35 L 10 10 Q -25 8 -40 30 Z" fill={GOLD} />
  </g>
);

export const Network: React.FC<{cx: number; cy: number; p: number; t: number}> = ({cx, cy, p, t}) => {
  const nodes = Array.from({length: 16}, (_, i) => {
    const ring = i % 2 ? 330 : 190;
    const a = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
    return {x: cx + Math.cos(a) * ring * (0.9 + rand(i) * 0.2), y: cy + Math.sin(a) * ring * (0.9 + rand(i + 3) * 0.2), d: rand(i + 7) * 0.5};
  });
  return (
    <g>
      <circle cx={cx} cy={cy} r={170} fill="url(#dotGlow)" opacity={0.9} />
      {nodes.map((n, i) => {
        const k = Math.max(0, Math.min(1, (p - n.d) * 2));
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={cx + (n.x - cx) * k} y2={cy + (n.y - cy) * k} stroke={GOLD} strokeOpacity={0.45} strokeWidth={2} />
            {k >= 1 && <Dot x={n.x} y={n.y} r={6 + Math.sin(t * 3 + i) * 1} intensity={0.9} />}
          </g>
        );
      })}
      <Dot x={cx} y={cy} r={12} />
    </g>
  );
};

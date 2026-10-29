import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {CREAM, ICONS_BY_NAME, INK, ITEMS, Icon, ORANGE, PAPER, RED, SKY, TEAL, YELLOW} from './icons';

export const KIT_FPS = 30;
export const KIT_FRAMES = Math.round(83.2 * KIT_FPS);

// Le hook d'origine dure 6,27 s (jusqu'à « …ce qu'il contient. »).
const HOOK_END = 188 / KIT_FPS;

const DISPLAY = '"Inter Display", Inter, sans-serif';
const TEXT = 'Inter, sans-serif';

// Courbes : arrivée longue (ease-out), sortie et chute accélérées (ease-in).
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const prog = (t: number, a: number, b: number, easing = EASE_IN_OUT) => interpolate(t, [a, b], [0, 1], {...clamp, easing});
const win = (t: number, a: number, b: number, fin = 0.4, fout = 0.2) =>
  Math.min(prog(t, a, a + fin, EASE_OUT), 1 - prog(t, b - fout, b, EASE_IN));

/** Ressort amorti en forme close (pas de dépassement au-delà de ~6 %). */
const settle = (t: number, a: number, dur = 0.35) => {
  const u = (t - a) / dur;
  if (u <= 0 || u >= 1.6) return 0;
  return Math.sin(u * Math.PI * 1.6) * Math.exp(-u * 3.2);
};

/* ---------- Chronologie ---------- */

// Moment où chaque objet est cité (début du premier mot).
const ITEM_T = [6.5, 8.98, 12.18, 13.94, 14.86, 15.7, 16.94, 19.12, 21.16, 23.12, 25.92, 27.34, 30.66, 32.44, 33.46, 39.92];
const DROP_DUR = 0.42;
const dropAt = (i: number) => (i < ITEM_T.length - 1 ? ITEM_T[i + 1] - 0.32 : 41.2);
const landAt = (i: number) => dropAt(i) + DROP_DUR;

const SECTIONS: {a: number; b: number; label: string}[] = [
  {a: HOOK_END, b: 41.65, label: "KIT D'URGENCE"},
  {a: 41.65, b: 46.75, label: 'AUTONOMIE'},
  {a: 46.75, b: 51.8, label: 'EN CAS DE CRISE'},
  {a: 51.8, b: 59.55, label: 'LE BON RÉFLEXE'},
  {a: 59.55, b: 65.6, label: "L'ESSENTIEL"},
  {a: 65.6, b: 70.15, label: 'LE GUIDE'},
  {a: 70.15, b: 75.62, label: 'PRÉCAUTION'},
  {a: 75.62, b: 80.3, label: 'CLIMAT'},
  {a: 80.3, b: 83.2, label: "KIT D'URGENCE"},
];

/* ---------- Habillage commun ---------- */

const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 60% at 50% 42%, #fbf6ee 0%, ${CREAM} 55%, #e6dccb 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
      {Array.from({length: 23}, (_, x) =>
        Array.from({length: 40}, (_, y) => <circle key={`${x}-${y}`} cx={30 + x * 46} cy={30 + y * 48} r={2} fill={INK} opacity={0.07} />),
      )}
    </svg>
    {/* Bande orange de sécurité qui défile lentement en bas */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 26,
        background: `repeating-linear-gradient(-45deg, ${ORANGE} 0 26px, ${INK} 26px 52px)`,
        backgroundPosition: `${t * 30}px 0`,
        opacity: 0.9,
      }}
    />
  </AbsoluteFill>
);

const Header: React.FC<{t: number; count: number; lastLand: number}> = ({t, count, lastLand}) => {
  const sec = SECTIONS.find((s) => t >= s.a && t < s.b) ?? SECTIONS[0];
  const enter = prog(t, HOOK_END, HOOK_END + 0.5, EASE_OUT);
  const labelSwap = prog(t, sec.a, sec.a + 0.3, EASE_OUT);
  const bump = settle(t, lastLand, 0.3);
  return (
    <div style={{position: 'absolute', top: 140, left: 60, right: 60, opacity: enter, transform: `translateY(${(1 - enter) * -30}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div
          style={{
            background: ORANGE,
            color: PAPER,
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: 2,
            padding: '12px 24px',
            borderRadius: 14,
            border: `4px solid ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
            opacity: labelSwap,
            filter: `blur(${(1 - labelSwap) * 6}px)`,
          }}
        >
          {sec.label}
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: INK, transform: `scale(${1 + 0.18 * bump})`, display: 'flex', alignItems: 'center', gap: 12}}>
          {String(count).padStart(2, '0')}
          <span style={{opacity: 0.35, fontSize: 40}}>/16</span>
          {count === 16 && t > landAt(15) + 0.2 && (
            <span style={{width: 50, height: 50, borderRadius: 25, background: TEAL, color: PAPER, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${INK}`}}>✓</span>
          )}
        </div>
      </div>
      <div style={{display: 'flex', gap: 6, marginTop: 22}}>
        {ITEM_T.map((_, i) => {
          const on = prog(t, landAt(i), landAt(i) + 0.25, EASE_OUT);
          return (
            <div key={i} style={{flex: 1, height: 14, borderRadius: 7, background: '#d9cfbe', overflow: 'hidden', border: `2px solid ${INK}`}}>
              <div style={{width: `${on * 100}%`, height: '100%', background: ORANGE}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Sous-titres ---------- */

type Word = {w: string; s: number; e: number; gold: boolean};
const CHUNKS = captions as Word[][];
const LEAD = 0.15;

const Captions: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i][0].s - LEAD - 0.05) idx = i;
  if (idx < 0) return null;
  const chunk = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const lastE = chunk[chunk.length - 1].e;
  const end = next && next[0].s - lastE < 0.8 ? next[0].s - LEAD - 0.05 : lastE + 0.7;
  if (t >= end) return null;
  const out = prog(t, end - 0.12, end, EASE_IN);
  return (
    <div
      style={{
        position: 'absolute',
        top: 950,
        width: '100%',
        padding: '0 80px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 16px',
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      {chunk.map((w, i) => {
        const on = prog(t, w.s - LEAD, w.s - LEAD + 0.13, EASE_OUT);
        return (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.18,
              color: w.gold ? ORANGE : INK,
              opacity: 0.2 + 0.8 * on,
              filter: on < 1 ? `blur(${(1 - on) * 6}px)` : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Le sac ---------- */

const BAG = {cx: 540, mouth: 1170, w: 420};

const BagBack: React.FC<{open: number}> = ({open}) => (
  <g>
    {/* bretelles */}
    <path d={`M ${BAG.cx - 150} ${BAG.mouth + 20} Q ${BAG.cx - 200} ${BAG.mouth + 140} ${BAG.cx - 160} ${BAG.mouth + 250}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <path d={`M ${BAG.cx + 150} ${BAG.mouth + 20} Q ${BAG.cx + 200} ${BAG.mouth + 140} ${BAG.cx + 160} ${BAG.mouth + 250}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <rect x={BAG.cx - BAG.w / 2} y={BAG.mouth - 10} width={BAG.w} height={290} rx={60} fill="#c2410c" stroke={INK} strokeWidth={6} />
    {/* intérieur sombre de l'ouverture */}
    <ellipse cx={BAG.cx} cy={BAG.mouth} rx={(BAG.w / 2 - 24) * open} ry={34 * open} fill="#2a1a12" stroke={INK} strokeWidth={5} />
    {/* poignée */}
    <path d={`M ${BAG.cx - 50} ${BAG.mouth - 8} Q ${BAG.cx} ${BAG.mouth - 70} ${BAG.cx + 50} ${BAG.mouth - 8}`} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" opacity={1 - open} />
  </g>
);

const BagFront: React.FC<{open: number; fill: number}> = ({open, fill}) => {
  const top = BAG.mouth + 6;
  const w = BAG.w + 8 + fill * 18;
  return (
    <g>
      <path
        d={`M ${BAG.cx - w / 2} ${top} Q ${BAG.cx} ${top + 30 * open} ${BAG.cx + w / 2} ${top} L ${BAG.cx + w / 2} ${top + 230} Q ${BAG.cx + w / 2} ${top + 280} ${BAG.cx + w / 2 - 60} ${top + 280} L ${BAG.cx - w / 2 + 60} ${top + 280} Q ${BAG.cx - w / 2} ${top + 280} ${BAG.cx - w / 2} ${top + 230} Z`}
        fill={ORANGE}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* fermeture éclair : apparaît quand le sac se ferme */}
      <path d={`M ${BAG.cx - w / 2 + 20} ${top + 4} L ${BAG.cx + w / 2 - 20} ${top + 4}`} stroke={INK} strokeWidth={6} strokeDasharray="10 8" opacity={1 - open} />
      {/* poche avant */}
      <rect x={BAG.cx - 120} y={top + 110} width={240} height={140} rx={34} fill="#ff7a45" stroke={INK} strokeWidth={6} />
      <path d={`M ${BAG.cx - 96} ${top + 140} L ${BAG.cx + 96} ${top + 140}`} stroke={INK} strokeWidth={5} strokeDasharray="10 8" />
      <rect x={BAG.cx - 22} y={top + 150} width={44} height={44} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={BAG.cx - 6} y={top + 158} width={12} height={28} rx={2} fill={RED} />
      <rect x={BAG.cx - 14} y={top + 166} width={28} height={12} rx={2} fill={RED} />
      {/* bande réfléchissante */}
      <rect x={BAG.cx - w / 2 + 14} y={top + 70} width={w - 28} height={18} fill={YELLOW} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/* ---------- Scènes ---------- */

const Svg: React.FC<{children: React.ReactNode; o?: number; style?: React.CSSProperties}> = ({children, o = 1, style}) =>
  o <= 0 ? null : (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined, ...style}}>
      {children}
    </svg>
  );

const Chip: React.FC<{t: number; a: number; b: number; x: number; y: number; children: React.ReactNode; color?: string; size?: number}> = ({t, a, b, x, y, children, color = PAPER, size = 40}) => {
  const v = win(t, a, b, 0.35, 0.2);
  if (v <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * v + 0.06 * settle(t, a, 0.4)}) rotate(${(1 - v) * -6}deg)`,
        opacity: v,
        background: color,
        color: color === PAPER || color === YELLOW ? INK : PAPER,
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        padding: '14px 26px',
        borderRadius: 16,
        border: `5px solid ${INK}`,
        boxShadow: `7px 7px 0 ${INK}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

/** Les objets qui apparaissent puis tombent dans le sac. */
const ItemsScene: React.FC<{t: number}> = ({t}) => {
  const open = 1 - prog(t, 41.3, 41.75, EASE_IN_OUT);
  const count = ITEM_T.filter((_, i) => t >= landAt(i)).length;
  const lastLand = Math.max(...ITEM_T.map((_, i) => (t >= landAt(i) ? landAt(i) : -10)));
  const squash = settle(t, lastLand, 0.32);
  // Après la liste : le sac fermé monte au centre de la jauge des 72 h, puis disparaît.
  const rise = prog(t, 41.65, 42.4, EASE_IN_OUT);
  const bagO = Math.min(prog(t, HOOK_END, HOOK_END + 0.4, EASE_OUT), 1 - prog(t, 46.55, 46.8, EASE_IN));
  const bagTf = `translate(${0} ${-560 * rise}) translate(${BAG.cx} ${BAG.mouth + 140}) scale(${(1 - 0.42 * rise) * (1 + 0.05 * squash)} ${(1 - 0.42 * rise) * (1 - 0.06 * squash)}) translate(${-BAG.cx} ${-(BAG.mouth + 140)})`;

  return (
    <Svg o={bagO}>
      <g transform={bagTf}>
        <BagBack open={open} />
        {ITEM_T.map((a, i) => {
          const C = ITEMS[i];
          const enter = prog(t, a - 0.1, a + 0.35, EASE_OUT);
          const d = prog(t, dropAt(i), dropAt(i) + DROP_DUR, EASE_IN);
          if (enter <= 0 || d >= 1) return null;
          const side = i % 2 ? 1 : -1;
          const y0 = 560;
          const x = 540 + Math.sin(d * Math.PI) * 70 * side;
          const y = y0 + (BAG.mouth + 30 - y0) * d + (1 - enter) * 50;
          const s = (0.6 + 0.4 * enter) * (1 - 0.68 * d);
          const rot = (1 - enter) * -10 * side + d * 28 * side;
          const size = 380;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(${-size / 2} ${-size / 2})`} opacity={enter} style={{filter: enter < 1 ? `blur(${(1 - enter) * 8}px)` : undefined}}>
              <svg width={size} height={size} viewBox="0 0 200 200" overflow="visible">
                <C />
              </svg>
            </g>
          );
        })}
        <BagFront open={open} fill={count / 16} />
      </g>
    </Svg>
  );
};

const Scene72: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 41.75, 46.7, 0.4, 0.25);
  if (o <= 0) return null;
  const p = prog(t, 43.0, 44.5, Easing.bezier(0.33, 0, 0.2, 1));
  const R = 250;
  const c = 2 * Math.PI * R;
  const n = Math.round(72 * p);
  return (
    <>
      <Svg o={o}>
        <circle cx={540} cy={610} r={R} fill="none" stroke="#d9cfbe" strokeWidth={34} />
        <circle cx={540} cy={610} r={R} fill="none" stroke={ORANGE} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 540 610)" />
        <circle cx={540} cy={610} r={R + 19} fill="none" stroke={INK} strokeWidth={5} />
        <circle cx={540} cy={610} r={R - 19} fill="none" stroke={INK} strokeWidth={5} />
        {Array.from({length: 72}, (_, i) => {
          const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
          const long = i % 6 === 0;
          return <line key={i} x1={540 + Math.cos(a) * (R + 40)} y1={610 + Math.sin(a) * (R + 40)} x2={540 + Math.cos(a) * (R + (long ? 62 : 52))} y2={610 + Math.sin(a) * (R + (long ? 62 : 52))} stroke={INK} strokeWidth={long ? 5 : 3} opacity={i < n ? 1 : 0.25} />;
        })}
      </Svg>
      <div style={{position: 'absolute', top: 1110, width: '100%', textAlign: 'center', opacity: o}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 190, color: INK, lineHeight: 1, letterSpacing: -6}}>
          {n}
          <span style={{color: ORANGE}}> h</span>
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: INK, opacity: prog(t, 44.6, 45.0, EASE_OUT), marginTop: 10, letterSpacing: 4}}>D'AUTONOMIE</div>
      </div>
    </>
  );
};

const SceneCrise: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 46.8, 51.85, 0.4, 0.2);
  if (o <= 0) return null;
  const storm = prog(t, 48.2, 48.8, EASE_OUT);
  const flood = prog(t, 48.6, 50.0, EASE_IN_OUT);
  const power = 1 - prog(t, 51.2, 51.35, Easing.linear);
  const lvl = 860 - 110 * flood;
  return (
    <>
      <Svg o={o}>
        {/* nuage d'orage et pluie */}
        <g opacity={storm} transform={`translate(0 ${(1 - storm) * -40})`}>
          {Array.from({length: 14}, (_, i) => {
            const x = 330 + (i % 7) * 70 + (i > 6 ? 35 : 0);
            const y = 470 + (((t * 900 + i * 97) % 300) | 0);
            return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 34} stroke={SKY} strokeWidth={6} strokeLinecap="round" />;
          })}
          <path d="M 330 450 Q 300 380 370 370 Q 390 300 470 320 Q 520 260 600 310 Q 690 300 700 370 Q 770 380 740 450 Z" fill="#8a94a6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 560 440 L 530 520 L 570 520 L 545 600" fill="none" stroke={YELLOW} strokeWidth={10} strokeLinejoin="round" opacity={Math.floor(t * 4) % 3 === 0 ? 1 : 0.2} />
        </g>
        {/* maison */}
        <g>
          <path d="M 380 640 L 540 520 L 700 640 Z" fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <rect x={410} y={640} width={260} height={220} fill={PAPER} stroke={INK} strokeWidth={6} />
          {[440, 580].map((x) => (
            <rect key={x} x={x} y={680} width={60} height={60} fill={power > 0.5 ? YELLOW : '#3a3f4b'} stroke={INK} strokeWidth={5} />
          ))}
          <rect x={510} y={770} width={60} height={90} fill={TEAL} stroke={INK} strokeWidth={5} />
        </g>
        {/* l'eau monte */}
        <path
          d={`M 0 ${lvl} ${Array.from({length: 28}, (_, i) => `Q ${i * 40 + 20} ${lvl + (i % 2 ? 14 : -14) + Math.sin(t * 3 + i) * 4} ${i * 40 + 40} ${lvl}`).join(' ')} L 1080 900 L 0 900 Z`}
          fill={SKY}
          fillOpacity={0.85}
          stroke={INK}
          strokeWidth={5}
        />
        <rect x={0} y={898} width={1080} height={6} fill={INK} />
      </Svg>
      <Chip t={t} a={50.3} b={51.85} x={330} y={1230} color={SKY}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 12}}>
          <span style={{textDecoration: 'line-through', textDecorationThickness: 6}}>EAU</span>
        </span>
      </Chip>
      <Chip t={t} a={51.0} b={51.85} x={750} y={1230} color={YELLOW}>
        <span style={{textDecoration: 'line-through', textDecorationThickness: 6}}>ÉLECTRICITÉ</span>
      </Chip>
    </>
  );
};

const ScenePlace: React.FC<{t: number}> = ({t}) => {
  const doorO = win(t, 51.85, 54.75, 0.4, 0.25);
  const calO = win(t, 54.75, 59.6, 0.4, 0.2);
  const circle = prog(t, 55.9, 56.6, EASE_OUT);
  const check = prog(t, 58.75, 59.05, EASE_OUT);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return (
    <>
      <Svg o={doorO}>
        {/* porte d'entrée et sac accroché à côté */}
        <rect x={230} y={330} width={300} height={560} fill="#b07a4a" stroke={INK} strokeWidth={6} />
        <rect x={250} y={350} width={260} height={540} fill="#8b5a33" stroke={INK} strokeWidth={5} />
        {[400, 560, 720].map((y) => (
          <rect key={y} x={280} y={y} width={200} height={120} rx={8} fill="none" stroke={INK} strokeWidth={4} opacity={0.5} />
        ))}
        <circle cx={480} cy={630} r={14} fill={YELLOW} stroke={INK} strokeWidth={4} />
        <rect x={150} y={890} width={460} height={14} fill={INK} />
        <circle cx={760} cy={430} r={12} fill={INK} />
        <g transform={`translate(760 440) rotate(${Math.sin(Math.max(0, t - 52.0) * 5) * 5 * Math.exp(-Math.max(0, t - 52.0) * 1.5)}) translate(-760 -440)`}>
          <g transform="translate(760 450) scale(0.52) translate(-540 -1170)">
            <BagBack open={0} />
            <BagFront open={0} fill={1} />
          </g>
        </g>
      </Svg>
      <Chip t={t} a={52.9} b={54.75} x={760} y={1230} color={YELLOW}>
        FACILE D'ACCÈS
      </Chip>
      <Svg o={calO}>
        <rect x={250} y={320} width={580} height={560} rx={30} fill={PAPER} stroke={INK} strokeWidth={6} />
        <rect x={250} y={320} width={580} height={110} rx={30} fill={ORANGE} stroke={INK} strokeWidth={6} />
        <rect x={250} y={400} width={580} height={30} fill={ORANGE} />
        <line x1={250} y1={430} x2={830} y2={430} stroke={INK} strokeWidth={6} />
        {[340, 740].map((x) => (
          <rect key={x} x={x - 12} y={290} width={24} height={70} rx={12} fill={INK} />
        ))}
        {months.map((m, i) => {
          const x = 315 + (i % 4) * 150;
          const y = 495 + Math.floor(i / 4) * 130;
          return (
            <g key={i}>
              <rect x={x - 50} y={y - 45} width={100} height={100} rx={16} fill={i === 11 && circle > 0.9 ? YELLOW : '#efe6d6'} stroke={INK} strokeWidth={4} />
              <text x={x} y={y + 22} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={52} fill={INK}>
                {m}
              </text>
            </g>
          );
        })}
        {/* un mois entouré : une vérification par an */}
        <ellipse cx={765} cy={760} rx={72} ry={68} fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${470 * circle} 600`} transform="rotate(-80 765 760)" />
      </Svg>
      <Chip t={t} a={56.0} b={59.6} x={330} y={1230} color={ORANGE}>
        1× PAR AN
      </Chip>
      {calO > 0 && t >= 57.6 && (
        <div style={{position: 'absolute', left: 760, top: 1230, transform: `translate(-50%, -50%) scale(${win(t, 57.6, 59.6, 0.35, 0.2)})`, opacity: win(t, 57.6, 59.6, 0.35, 0.2)}}>
          <Icon C={ICONS_BY_NAME.Medicine} size={230} />
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              width: 84,
              height: 84,
              borderRadius: 42,
              background: TEAL,
              border: `5px solid ${INK}`,
              color: PAPER,
              fontSize: 50,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${check})`,
            }}
          >
            ✓
          </div>
        </div>
      )}
    </>
  );
};

const SceneTrois: React.FC<{t: number}> = ({t}) => {
  const bigO = win(t, 60.85, 63.3, 0.35, 0.25);
  const cards = [
    {a: 63.3, label: 'BOIRE ET MANGER', C: ICONS_BY_NAME.Water, color: SKY},
    {a: 64.25, label: 'AVOIR CHAUD', C: ICONS_BY_NAME.Clothes, color: YELLOW},
    {a: 64.95, label: 'SE SOIGNER', C: ICONS_BY_NAME.FirstAid, color: '#ffb4a8'},
  ];
  return (
    <>
      {bigO > 0 && (
        <div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', opacity: bigO, transform: `scale(${0.8 + 0.2 * bigO})`, filter: bigO < 1 ? `blur(${(1 - bigO) * 8}px)` : undefined}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 520, lineHeight: 1, color: ORANGE, WebkitTextStroke: `10px ${INK}`, textShadow: `16px 16px 0 ${INK}`}}>3</div>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, color: INK, letterSpacing: 6, marginTop: -10}}>CHOSES À RETENIR</div>
        </div>
      )}
      {cards.map((c, i) => {
        const v = win(t, c.a - 0.05, 65.62, 0.4, 0.2);
        if (v <= 0) return null;
        return (
          <div
            key={c.label}
            style={{
              position: 'absolute',
              left: 90,
              right: 90,
              top: 300 + i * 200,
              height: 170,
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              padding: '0 34px',
              background: c.color,
              border: `6px solid ${INK}`,
              borderRadius: 28,
              boxShadow: `10px 10px 0 ${INK}`,
              opacity: v,
              transform: `translateX(${(1 - v) * (i % 2 ? 120 : -120)}px) rotate(${(1 - v) * (i % 2 ? 4 : -4)}deg)`,
            }}
          >
            <Icon C={c.C} size={120} />
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: INK}}>{c.label}</div>
          </div>
        );
      })}
    </>
  );
};

const SceneGuide: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 65.65, 70.2, 0.4, 0.2);
  if (o <= 0) return null;
  const lines = ['Eau et nourriture', 'Trousse de secours', 'Lampe et radio', 'Papiers importants'];
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 290,
          top: 290,
          width: 500,
          height: 620,
          borderRadius: 60,
          background: INK,
          padding: 22,
          opacity: o,
          transform: `translateY(${(1 - o) * 60}px)`,
          boxShadow: `14px 14px 0 rgba(27,27,31,0.18)`,
        }}
      >
        <div style={{width: '100%', height: '100%', borderRadius: 42, background: PAPER, overflow: 'hidden', fontFamily: TEXT}}>
          <div style={{background: ORANGE, color: PAPER, padding: '50px 32px 24px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, borderBottom: `5px solid ${INK}`}}>Kit d'urgence</div>
          <div style={{padding: '20px 30px'}}>
            {lines.map((l, i) => {
              const on = prog(t, 66.2 + i * 0.35, 66.5 + i * 0.35, EASE_OUT);
              return (
                <div key={l} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 0', borderBottom: '3px solid #e6dccb', opacity: 0.3 + 0.7 * on}}>
                  <div style={{width: 46, height: 46, borderRadius: 12, border: `4px solid ${INK}`, background: on > 0.5 ? TEAL : 'transparent', color: PAPER, fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {on > 0.5 ? '✓' : ''}
                  </div>
                  <div style={{fontSize: 32, fontWeight: 700, color: INK}}>{l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Chip t={t} a={67.75} b={70.2} x={540} y={1160} color={PAPER} size={36}>
        SITES DU GOUVERNEMENT
      </Chip>
      <Chip t={t} a={68.95} b={70.2} x={330} y={1290} color={YELLOW} size={36}>
        PRÉFECTURES
      </Chip>
      <Chip t={t} a={69.8} b={70.2} x={770} y={1290} color={SKY} size={36}>
        MAIRIES
      </Chip>
    </>
  );
};

const ScenePrecaution: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 70.2, 75.65, 0.4, 0.2);
  if (o <= 0) return null;
  const shield = prog(t, 71.5, 72.0, EASE_OUT);
  const hazards = [ICONS_BY_NAME.Wave, ICONS_BY_NAME.Flame, ICONS_BY_NAME.Wind, ICONS_BY_NAME.Bolt];
  // L'aiguille part de « probable » et descend vers « peu probable ».
  const needle = 70 - 140 * prog(t, 74.4, 75.2, EASE_IN_OUT);
  return (
    <>
      <Svg o={o}>
        <g transform={`translate(540 600) scale(${0.6 + 0.4 * shield + 0.05 * settle(t, 71.5, 0.4)}) translate(-540 -600)`} opacity={shield}>
          <path d="M 540 330 L 760 410 Q 770 680 540 860 Q 310 680 320 410 Z" fill={TEAL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M 540 380 L 710 442 Q 716 650 540 800 Z" fill="#fff" opacity={0.15} />
          <path d="M 450 600 L 520 670 L 650 520" fill="none" stroke={PAPER} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${330 * prog(t, 71.9, 72.4, EASE_OUT)} 400`} />
        </g>
      </Svg>
      {hazards.map((H, i) => {
        const v = win(t, 72.6 + i * 0.25, 75.65, 0.35, 0.2);
        const a = (i / 4) * Math.PI * 2 - Math.PI * 0.75;
        const push = 1 + 0.06 * settle(t, 72.6 + i * 0.25 + 0.3, 0.4);
        return (
          <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 330 * push - 60, top: 600 + Math.sin(a) * 300 * push - 60, width: 120, height: 120, borderRadius: 60, background: PAPER, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: v * o, transform: `scale(${v})`}}>
            <Icon C={H} size={78} />
          </div>
        );
      })}
      {(
        <Svg o={win(t, 74.1, 75.65, 0.35, 0.2)}>
          <path d="M 330 1330 A 210 210 0 0 1 750 1330" fill="none" stroke="#d9cfbe" strokeWidth={36} />
          <path d="M 330 1330 A 210 210 0 0 1 540 1120" fill="none" stroke={TEAL} strokeWidth={36} />
          <path d="M 540 1120 A 210 210 0 0 1 750 1330" fill="none" stroke={ORANGE} strokeWidth={36} />
          <g transform={`rotate(${needle} 540 1330)`}>
            <line x1={540} y1={1330} x2={540} y2={1150} stroke={INK} strokeWidth={12} strokeLinecap="round" />
          </g>
          <circle cx={540} cy={1330} r={22} fill={INK} />
          <text x={300} y={1395} fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill={INK}>
            PEU PROBABLE
          </text>
          <text x={780} y={1395} textAnchor="end" fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill={INK}>
            PROBABLE
          </text>
        </Svg>
      )}
    </>
  );
};

const SceneClimat: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 75.65, 80.35, 0.4, 0.25);
  if (o <= 0) return null;
  const merc = prog(t, 76.4, 77.6, EASE_IN_OUT);
  const line = prog(t, 77.6, 79.1, EASE_IN_OUT);
  const pts = [
    [140, 1350],
    [330, 1320],
    [520, 1270],
    [710, 1190],
    [900, 1080],
  ];
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return (
    <>
      <Svg o={o}>
        {/* soleil */}
        <g transform={`rotate(${t * 12} 720 520)`}>
          {Array.from({length: 12}, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={720 + Math.cos(a) * 140} y1={520 + Math.sin(a) * 140} x2={720 + Math.cos(a) * 190} y2={520 + Math.sin(a) * 190} stroke={INK} strokeWidth={14} strokeLinecap="round" />;
          })}
        </g>
        <circle cx={720} cy={520} r={115} fill={YELLOW} stroke={INK} strokeWidth={8} />
        {/* thermomètre */}
        <rect x={290} y={330} width={110} height={460} rx={55} fill={PAPER} stroke={INK} strokeWidth={8} />
        <rect x={322} y={770 - 380 * (0.25 + 0.75 * merc)} width={46} height={380 * (0.25 + 0.75 * merc)} rx={23} fill={RED} />
        <circle cx={345} cy={820} r={78} fill={RED} stroke={INK} strokeWidth={8} />
        {[400, 470, 540, 610, 680].map((y) => (
          <line key={y} x1={400} y1={y} x2={432} y2={y} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* courbe des risques, sans valeurs chiffrées */}
        <path d={path} fill="none" stroke={ORANGE} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${1000 * line} 1200`} />
        {line > 0.95 && <path d="M 900 1080 L 860 1078 M 900 1080 L 892 1118" stroke={ORANGE} strokeWidth={16} strokeLinecap="round" />}
        <line x1={120} y1={1380} x2={960} y2={1380} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </Svg>
      {[ICONS_BY_NAME.Wave, ICONS_BY_NAME.Flame, ICONS_BY_NAME.Wind].map((H, i) => {
        const [x, y] = pts[i + 1];
        const v = win(t, 77.9 + i * 0.45, 80.35, 0.3, 0.2);
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 130, width: 100, height: 100, borderRadius: 50, background: PAPER, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: v, transform: `scale(${v})`}}>
            <Icon C={H} size={66} />
          </div>
        );
      })}
      <Chip t={t} a={79.1} b={80.35} x={720} y={850} color={ORANGE} size={44}>
        + DE RISQUES
      </Chip>
    </>
  );
};

const SceneOutro: React.FC<{t: number}> = ({t}) => {
  const o = prog(t, 80.3, 80.75, EASE_OUT);
  if (o <= 0) return null;
  const badge = prog(t, 80.8, 81.2, EASE_OUT);
  return (
    <>
      <Svg o={o}>
        <g transform={`translate(540 640) scale(${0.7 + 0.04 * settle(t, 80.4, 0.4)}) translate(-540 -1310)`}>
          <BagBack open={0} />
          <BagFront open={0} fill={1} />
        </g>
        <g transform={`translate(760 470) scale(${badge})`}>
          <circle r={74} fill={TEAL} stroke={INK} strokeWidth={8} />
          <path d="M -32 0 L -8 26 L 36 -24" fill="none" stroke={PAPER} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Svg>
      <div style={{position: 'absolute', top: 960, width: '100%', textAlign: 'center', opacity: prog(t, 80.6, 81.0, EASE_OUT)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 86, color: INK, lineHeight: 1.05}}>
          Votre kit
          <br />
          est <span style={{color: ORANGE}}>prêt ?</span>
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, color: INK, opacity: 0.7, marginTop: 24, letterSpacing: 2}}>16 OBJETS · 72 H D'AUTONOMIE</div>
      </div>
    </>
  );
};

/* ---------- Effets sonores (discrets : la voix et la musique d'origine passent devant) ---------- */

type Sfx = {at: number; file: string; volume: number};
const SOUNDS: Sfx[] = [
  ...ITEM_T.map((a) => ({at: a - 0.05, file: 'pop', volume: 0.18})),
  ...ITEM_T.map((_, i) => ({at: landAt(i) - 0.02, file: `tick${i % 12}`, volume: 0.3})),
  ...SECTIONS.slice(1).map((s) => ({at: s.a - 0.08, file: 'whoosh', volume: 0.22})),
  {at: 41.45, file: 'click', volume: 0.3},
  {at: 42.9, file: 'riser', volume: 0.22},
  {at: 72.0, file: 'click', volume: 0.25},
  {at: 58.8, file: 'click', volume: 0.25},
  {at: 80.85, file: 'notif', volume: 0.3},
];

/* ---------- Composition ---------- */

export const Kit = () => {
  const frame = useCurrentFrame();
  const t = frame / KIT_FPS;
  const count = ITEM_T.filter((_, i) => t >= landAt(i)).length;
  const lastLand = Math.max(-10, ...ITEM_T.map((_, i) => (t >= landAt(i) ? landAt(i) : -10)));
  // Transition hook → animation : un cercle crème s'ouvre depuis le sac du hook.
  const iris = prog(t, HOOK_END - 0.25, HOOK_END + 0.15, Easing.bezier(0.5, 0, 0.2, 1));

  return (
    <AbsoluteFill style={{background: INK}}>
      {t < HOOK_END + 0.2 && (
        <Sequence durationInFrames={Math.round((HOOK_END + 0.2) * KIT_FPS)} layout="none">
          <AbsoluteFill>
            <OffthreadVideo src={staticFile('kit/hook.mp4')} muted />
          </AbsoluteFill>
        </Sequence>
      )}
      {iris > 0 && (
        <AbsoluteFill style={{clipPath: iris >= 1 ? undefined : `circle(${iris * 1650}px at 540px 520px)`}}>
          <Background t={t} />
          <ItemsScene t={t} />
          <Scene72 t={t} />
          <SceneCrise t={t} />
          <ScenePlace t={t} />
          <SceneTrois t={t} />
          <SceneGuide t={t} />
          <ScenePrecaution t={t} />
          <SceneClimat t={t} />
          <SceneOutro t={t} />
          <Header t={t} count={count} lastLand={lastLand} />
          <Captions t={t} />
        </AbsoluteFill>
      )}
      <Html5Audio src={staticFile('kit/audio.wav')} />
      {SOUNDS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * KIT_FPS)} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

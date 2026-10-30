import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import captions from './captions.json';
import {
  Bed, CREAM, Defs, Dome, Dot, GOLD, Lasso, Moon, Network, Sacks, ShareArrow, Smoke, Stars, Waves, Window,
} from './art';

export const FPS = 30;
export const RAPPEL_FRAMES = Math.round(118.5 * FPS);

const POPPINS = 'Poppins, sans-serif';
const AMIRI = 'Amiri, serif';

// Courbes (cf. skill motion-design) : arrivée longue et douce, sortie plus courte.
const EASE_OUT = Easing.bezier(0.05, 0.7, 0.1, 1);
const EASE_IN = Easing.bezier(0.3, 0, 1, 1);
const EASE_IN_OUT = Easing.bezier(0.4, 0, 0.2, 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 entre a et b. */
const prog = (t: number, a: number, b: number, easing = EASE_IN_OUT) => interpolate(t, [a, b], [0, 1], {...clamp, easing});

/** Visibilité d'un élément présent de a à b (entrée fin s, sortie fout s). */
const win = (t: number, a: number, b: number, fin = 0.45, fout = 0.25) =>
  Math.min(prog(t, a, a + fin, EASE_OUT), 1 - prog(t, b - fout, b, EASE_IN));

/** Calque SVG plein cadre, qui apparaît/disparaît en « blur swap ». */
const Layer: React.FC<{t: number; a: number; b: number; fin?: number; fout?: number; children: React.ReactNode}> = ({t, a, b, fin, fout, children}) => {
  const v = win(t, a, b, fin, fout);
  if (v <= 0) return null;
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{position: 'absolute', inset: 0, opacity: v, filter: v < 1 ? `blur(${(1 - v) * 8}px)` : undefined}}
    >
      {children}
    </svg>
  );
};

/** Bloc HTML positionné, même entrée/sortie. */
const Html: React.FC<{t: number; a: number; b: number; top: number; fin?: number; fout?: number; rise?: number; children: React.ReactNode}> = ({
  t, a, b, top, fin, fout, rise = 18, children,
}) => {
  const v = win(t, a, b, fin, fout);
  if (v <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: v,
        transform: `translateY(${(1 - v) * rise}px) scale(${0.96 + 0.04 * v})`,
        filter: v < 1 ? `blur(${(1 - v) * 6}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Polices : attendre leur chargement avant de rendre ---------- */

const useFonts = () => {
  const [handle] = useState(() => delayRender('polices'));
  useEffect(() => {
    Promise.all(
      ['500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 40px Poppins', '400 40px Amiri', '700 40px Amiri'].map((f) =>
        document.fonts.load(f, f.includes('Amiri') ? 'اللَّه' : 'Aa'),
      ),
    ).then(() => continueRender(handle));
  }, [handle]);
};

/* ---------- Habillage ---------- */

const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 14,
  background: 'rgba(22,18,14,0.88)',
  borderRadius: 999,
  fontFamily: POPPINS,
  color: 'white',
};

const SourcePill: React.FC<{text: string}> = ({text}) => (
  <div style={{...pillBase, padding: '10px 24px', fontSize: 26, fontWeight: 500, color: '#e9e2d4', border: '1px solid rgba(255,255,255,0.06)'}}>
    <span style={{width: 9, height: 9, borderRadius: 5, background: GOLD, boxShadow: `0 0 10px ${GOLD}`}} />
    {text}
  </div>
);

const GoldPill: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 46}) => (
  <div
    style={{
      ...pillBase,
      padding: '14px 32px',
      fontSize: size,
      fontWeight: 600,
      border: `2.5px solid ${GOLD}`,
      boxShadow: '0 0 34px rgba(240,196,90,0.28)',
    }}
  >
    {children}
  </div>
);

const Prophet = () => (
  <GoldPill>
    Le Prophète
    <span style={{fontFamily: AMIRI, color: GOLD, fontSize: 58, lineHeight: 1}} dir="rtl" lang="ar">
      ﷺ
    </span>
  </GoldPill>
);

const SmallPill: React.FC<{children: React.ReactNode; gold?: boolean}> = ({children, gold}) => (
  <div
    style={{
      ...pillBase,
      padding: '9px 22px',
      fontSize: 28,
      fontWeight: 600,
      color: gold ? GOLD : '#d9d2c3',
      border: gold ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.08)',
    }}
  >
    {children}
  </div>
);

const QuoteCard: React.FC<{t: number; l1: string; l2: string; at2: number; gold: 1 | 2; small2?: boolean}> = ({t, l1, l2, at2, gold, small2}) => {
  const v2 = prog(t, at2, at2 + 0.35, EASE_OUT);
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 820,
        padding: '42px 48px 40px',
        borderRadius: 26,
        background: 'rgba(24,19,12,0.9)',
        border: `2px solid rgba(240,196,90,0.55)`,
        boxShadow: '0 0 40px rgba(240,196,90,0.12)',
        textAlign: 'center',
        fontFamily: POPPINS,
        fontWeight: 700,
        fontSize: 50,
        lineHeight: 1.3,
      }}
    >
      <div style={{position: 'absolute', top: -30, left: 26, fontSize: 90, color: GOLD, fontFamily: 'Georgia, serif'}}>“</div>
      <div style={{color: gold === 1 ? GOLD : 'white'}}>{l1}</div>
      <div
        style={{
          color: gold === 2 ? GOLD : '#e8e2d6',
          fontSize: small2 ? 36 : 50,
          fontWeight: small2 ? 600 : 700,
          opacity: v2,
          filter: `blur(${(1 - v2) * 6}px)`,
          marginTop: 6,
        }}
      >
        {l2}
      </div>
    </div>
  );
};

const ArabicTitleCard: React.FC<{sub: string}> = ({sub}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 34px 18px',
      borderRadius: 22,
      background: 'rgba(22,18,14,0.9)',
      border: '1px solid rgba(240,196,90,0.3)',
    }}
  >
    <div dir="rtl" lang="ar" style={{fontFamily: AMIRI, fontWeight: 700, fontSize: 72, color: CREAM, lineHeight: 1.5}}>
      آيَةُ الْكُرْسِيِّ
    </div>
    <div style={{fontFamily: POPPINS, fontSize: 28, fontWeight: 600, color: '#e9e2d4', marginTop: -6}}>{sub}</div>
  </div>
);

/* ---------- Sous-titres karaoké ---------- */

type Word = {w: string; s: number; e: number; gold: boolean};
const CHUNKS = captions as Word[][];

// Les mots s'affichent un peu avant d'être prononcés, comme dans l'original.
const LEAD = 0.2;

const Captions: React.FC<{t: number; top: number}> = ({t, top}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i][0].s - LEAD - 0.05) idx = i;
  if (idx < 0) return null;
  const chunk = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const lastE = chunk[chunk.length - 1].e;
  const end = next && next[0].s - lastE < 0.7 ? next[0].s - LEAD - 0.05 : lastE + 0.9;
  if (t >= end) return null;
  const out = prog(t, end - 0.12, end, EASE_IN);
  const isAllah = chunk.map((w) => w.w).join(' ').includes('Allah !');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        padding: '0 70px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px 12px',
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      {chunk.map((w, i) => {
        const on = prog(t, w.s - LEAD, w.s - LEAD + 0.13, EASE_OUT);
        const gold = w.gold || isAllah;
        return (
          <span
            key={i}
            style={{
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 57,
              lineHeight: 1.15,
              color: gold ? GOLD : 'white',
              background: 'rgba(14,12,20,0.72)',
              padding: '2px 12px 6px',
              borderRadius: 10,
              boxShadow: `inset 0 -5px 0 rgba(84,70,190,${0.35 + 0.65 * on})`,
              opacity: 0.32 + 0.68 * on,
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

/* ---------- Âyat al-Kursî ---------- */

const VERSE_1 = {
  ar: ['اللَّهُ', 'لَا', 'إِلَٰهَ', 'إِلَّا', 'هُوَ', 'الْحَيُّ', 'الْقَيُّومُ'],
  tr: ['Allâhu', 'lâ', 'ilâha', 'illâ', 'huwa', 'l-Ḥayyu', 'l-Qayyûm'],
  at: [72.8, 73.6, 74.4, 75.2, 76.2, 77.2, 78.2],
  fr: 'Allah, pas de divinité à part Lui, le Vivant, Celui qui fait tout tenir',
};
const VERSE_2 = {
  ar: ['لَا', 'تَأْخُذُهُ', 'سِنَةٌ', 'وَلَا', 'نَوْمٌ'],
  tr: ['lâ', 'ta’khudhuhu', 'sinatun', 'wa lâ', 'nawm'],
  at: [84.3, 85.3, 86.3, 87.1, 88.0],
  fr: 'Ni somnolence ni sommeil ne Le prennent',
};

const Sunburst: React.FC<{t: number; o: number}> = ({t, o}) => (
  <AbsoluteFill
    style={{
      opacity: o,
      background: `repeating-conic-gradient(from ${t * 3}deg at 50% 40%, rgba(214,170,92,0.16) 0deg 7deg, rgba(0,0,0,0) 7deg 22deg)`,
      WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 10%, rgba(0,0,0,0.6) 50%, transparent 85%)',
    }}
  />
);

const Octagram: React.FC<{t: number; cx: number; cy: number; size: number; o: number}> = ({t, cx, cy, size, o}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: o}}>
    <circle cx={cx} cy={cy} r={size * 0.7} fill="url(#dotGlow)" opacity={0.25} />
    {[0, 45].map((r) => (
      <rect
        key={r}
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        fill="none"
        stroke={GOLD}
        strokeOpacity={0.65}
        strokeWidth={2}
        transform={`rotate(${r + t * 4} ${cx} ${cy})`}
      />
    ))}
  </svg>
);

const VerseLine: React.FC<{t: number; v: typeof VERSE_1; o: number}> = ({t, v, o}) => {
  const current = v.at.filter((a) => t >= a).length - 1;
  return (
    <div style={{position: 'absolute', top: 690, width: '100%', opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined}}>
      <div dir="rtl" lang="ar" style={{textAlign: 'center', fontFamily: AMIRI, fontWeight: 700, fontSize: 92, color: CREAM, lineHeight: 1.6, padding: '0 50px', textShadow: '0 0 24px rgba(240,196,90,0.45)'}}>
        {v.ar.map((w, i) => {
          const on = prog(t, v.at[i], v.at[i] + 0.35, EASE_OUT);
          return (
            <span key={i} style={{display: 'inline-block', opacity: on, filter: `blur(${(1 - on) * 8}px)`, margin: '0 10px'}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{textAlign: 'center', fontFamily: POPPINS, fontWeight: 600, fontSize: 38, color: 'white', marginTop: 40, padding: '0 60px'}}>
        {v.tr.map((w, i) => {
          const on = prog(t, v.at[i], v.at[i] + 0.2, EASE_OUT);
          return (
            <span key={i} style={{opacity: on, color: i === current && t < v.at[v.at.length - 1] + 1.2 ? GOLD : 'white'}}>
              {w}{' '}
            </span>
          );
        })}
      </div>
      <div
        style={{
          textAlign: 'center',
          fontFamily: POPPINS,
          fontWeight: 500,
          fontSize: 28,
          color: '#b9b2a6',
          marginTop: 14,
          padding: '0 150px',
          opacity: prog(t, v.at[1], v.at[1] + 0.5, EASE_OUT),
        }}
      >
        {v.fr}
      </div>
    </div>
  );
};

const ToiMic: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const v = win(t, a, b, 0.4, 0.25);
  if (v <= 0) return null;
  const p = prog(t, a + 0.3, b - 0.1, Easing.linear);
  const r = 62;
  const c = 2 * Math.PI * r;
  return (
    <div style={{position: 'absolute', top: 1180, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v, transform: `scale(${0.9 + 0.1 * v})`}}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={75} r={r} fill="rgba(22,18,14,0.85)" stroke="rgba(240,196,90,0.3)" strokeWidth={4} />
        <circle cx={75} cy={75} r={r} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 75 75)" filter="url(#glow)" />
        <rect x={65} y={46} width={20} height={36} rx={10} fill="none" stroke={GOLD} strokeWidth={4} />
        <path d="M 56 72 Q 56 94 75 94 Q 94 94 94 72 M 75 94 L 75 104" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: 50, color: GOLD, marginTop: 6, textShadow: '0 0 20px rgba(240,196,90,0.5)'}}>À toi</div>
    </div>
  );
};

/* ---------- Composition ---------- */

const SOURCES: [number, number, string][] = [
  [9.9, 68.7, 'al-Bukhârî 2311 (mu‘allaq) · authentique'],
  [69.9, 101.3, 'Coran · al-Baqara 2:255 (Âyat al-Kursî)'],
  [110.9, 116.2, 'Sahih Muslim · 2674'],
];

const AH = {x: 850, y: 1105};
const SACK_TOP = {x: 540, y: 842};

export const Rappel = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // --- Lunes ---
  const intro = t < 7.05;
  const nightBig = t >= 38.9 && t < 44.3;
  const night3 = t >= 41.1;
  const moonsO = Math.max(win(t, 0, 7.0, 0.3), win(t, 38.9, 44.2), win(t, 65.2, 68.4), win(t, 116.2, 118.5, 0.6));

  // --- Abû Hurayra (point lumineux) : sur le côté, ou sur le tonneau quand il attrape le voleur ---
  const onSack = Math.max(prog(t, 19.9, 20.6) * (1 - prog(t, 31.2, 31.8)), prog(t, 40.0, 40.4) * (1 - prog(t, 41.0, 41.3)), prog(t, 42.2, 42.6));
  const ah = {x: AH.x + (SACK_TOP.x - AH.x) * onSack, y: AH.y + (SACK_TOP.y - AH.y) * onSack - Math.sin(onSack * Math.PI) * 60};

  // --- Fumée (le voleur) : un gaz arrive lentement, sans rebond ---
  const smokeX = (a: number, b: number, leave?: number) =>
    -260 + 640 * prog(t, a, b, EASE_OUT) - (leave !== undefined ? 700 * prog(t, leave, leave + 1.4, EASE_IN) : 0);
  const smokes: {x: number; o: number}[] = [
    {x: smokeX(1.3, 2.4, 3.0), o: win(t, 1.3, 4.2, 0.5, 0.6)},
    {x: smokeX(16.9, 18.3, 29.6), o: win(t, 16.9, 31.0, 0.6, 0.8)},
    {x: smokeX(39.2, 39.9, 40.7), o: win(t, 39.2, 41.3, 0.4, 0.4)},
    {x: smokeX(41.3, 42.0), o: win(t, 41.3, 44.3, 0.4, 0.3)},
  ];

  const captionTop = t >= 92.8 && t < 101.4 ? 1000 : 1300;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 45%, #18130e 0%, #0b0908 70%)'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <Defs />
      </svg>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Stars t={t} />
      </svg>

      {/* Aube */}
      <AbsoluteFill
        style={{
          opacity: win(t, 32.0, 38.7, 0.8, 0.5),
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(150,110,50,0.35) 45%, rgba(214,170,90,0.6) 55.7%, #0d0b09 55.8%)',
        }}
      />

      {/* Rayons (verset du Trône) */}
      <Sunburst t={t} o={win(t, 68.9, 105.2, 0.6, 0.8) * (t > 101.3 ? 0.45 : 1)} />

      {/* Petite lune en haut à droite pendant le récit */}
      <Layer t={t} a={9.9} b={31.9}>
        <Moon id="mTR" x={880} y={300} r={30} />
      </Layer>

      {/* Les trois nuits */}
      {moonsO > 0 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: moonsO}}>
          {[0, 1, 2].map((i) => {
            const big = !intro;
            const who = t >= 65 && t < 68.5;
            const x = 540 + (i - 1) * 170;
            const y = who ? 520 : 400;
            let light = 1;
            if (intro) light = prog(t, i * 0.35, i * 0.35 + 0.4) * (t > 2.5 && i < 2 ? 0.55 : 1);
            else if (nightBig) light = i < 2 ? 0.85 : night3 ? 1 : 0.18;
            else if (t >= 116) light = 0.22;
            const full = (nightBig && night3 && i === 2) || (t >= 65 && t < 68.5 && i === 2);
            return <Moon key={i} id={`m${i}`} x={x} y={y} r={big ? 44 : 50} light={light} full={full} />;
          })}
          {intro &&
            [0, 1, 2].map((i) => {
              const active = i === 2 && t > 2.5;
              return (
                <text key={i} x={540 + (i - 1) * 170} y={502} textAnchor="middle" fontFamily={POPPINS} fontWeight={600} fontSize={active ? 38 : 30} fill={active ? GOLD : '#d8d0c0'} opacity={prog(t, i * 0.35, i * 0.35 + 0.4)}>
                  Nuit {i + 1}
                </text>
              );
            })}
          {nightBig && (
            <text x={540} y={540} textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize={82} fill={GOLD} filter="url(#glow)">
              {night3 ? 'Nuit 3' : 'Nuit 2'}
            </text>
          )}
        </svg>
      )}

      {/* Tonneaux de l'aumône */}
      {(t < 7.05 || (t >= 9.9 && t < 44.3) || t >= 116.2) && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: Math.max(win(t, 0, 7.0, 0.3), win(t, 9.9, 44.25), win(t, 116.2, 118.5, 0.8))}}>
          <Sacks glowMid={Math.max(win(t, 20.4, 31.3) * 0.9, win(t, 40.0, 41.2) * 0.8, win(t, 42.4, 44.2) * 0.8)} />
        </svg>
      )}

      {/* Paroles qui protègent, puis dôme jusqu'au matin (intro) */}
      <Layer t={t} a={4.1} b={5.9}>
        <Waves x={540} y={640} w={300} n={3} t={t} draw={[prog(t, 4.1, 4.7), prog(t, 4.4, 5.0), prog(t, 4.7, 5.3)]} />
      </Layer>
      <Layer t={t} a={5.5} b={7.05} fout={0.2}>
        <Dome cx={540} base={1072} r={360} draw={prog(t, 5.5, 6.1, EASE_OUT)} glow={prog(t, 5.9, 6.5)} />
      </Layer>

      {/* Ces paroles… tu peux les dire ce soir */}
      <Layer t={t} a={7.1} b={9.95}>
        <Moon id="mSoir" x={540} y={450} r={70} />
        <Dot x={540} y={860} r={10} />
        {[
          [330, 920, 0],
          [720, 760, 1],
          [760, 900, 2],
        ].map(([x, y, k]) => (
          <Waves key={k} x={x} y={y} w={110} n={1} t={t + k} draw={[prog(t, 7.7 + k * 0.2, 8.3 + k * 0.2)]} />
        ))}
      </Layer>
      <Html t={t} a={8.9} b={9.95} top={560}>
        <SmallPill gold>ce soir</SmallPill>
      </Html>
      <Html t={t} a={8.9} b={9.95} top={920}>
        <SmallPill>toi</SmallPill>
      </Html>

      {/* Le Prophète ﷺ */}
      {[
        [10.0, 16.1],
        [23.5, 25.9],
        [32.6, 38.6],
        [58.4, 65.1],
      ].map(([a, b]) => (
        <Html key={a} t={t} a={a} b={b} top={380}>
          <Prophet />
        </Html>
      ))}
      {/* Il confie la garde à Abû Hurayra : trait doré du Prophète vers le point */}
      <Layer t={t} a={12.9} b={16.0}>
        <path
          d={`M 560 470 Q 820 560 ${AH.x} ${AH.y - 14}`}
          fill="none"
          stroke={GOLD}
          strokeWidth={2.5}
          strokeOpacity={0.8}
          strokeDasharray={`${900 * prog(t, 12.9, 13.8, EASE_OUT)} 2000`}
          filter="url(#glow)"
        />
      </Layer>
      {/* « je t'emmène au Messager d'Allah » : pointillés vers le voleur */}
      <Layer t={t} a={23.6} b={25.8}>
        <path d="M 520 470 Q 420 650 400 880" fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="4 12" strokeOpacity={0.7 * prog(t, 23.6, 24.4)} />
      </Layer>
      <Html t={t} a={13.1} b={16.2} top={AH.y + 52}>
        <div style={{transform: `translateX(${AH.x - 540 - 120}px)`}}>
          <SmallPill>Abû Hurayra · radiya-llâhu ‘anhu</SmallPill>
        </div>
      </Html>
      <Html t={t} a={14.3} b={16.2} top={735}>
        <SmallPill gold>l’aumône du Ramadan</SmallPill>
      </Html>

      {/* Abû Hurayra */}
      <Layer t={t} a={12.9} b={44.25}>
        <Dot x={ah.x} y={ah.y} r={9} />
      </Layer>

      {/* Le voleur et le lasso d'Abû Hurayra */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        {smokes.map((s, i) => s.o > 0 && <Smoke key={i} x={s.x} y={960} t={t} opacity={s.o} />)}
        {win(t, 20.3, 31.0) > 0 && (
          <Lasso x={380} y={970} t={t} draw={prog(t, 20.3, 21.0, EASE_OUT)} open={prog(t, 29.2, 30.4, EASE_IN)} />
        )}
        {win(t, 40.0, 41.2) > 0 && <Lasso x={380} y={970} t={t} draw={prog(t, 40.0, 40.6, EASE_OUT)} open={prog(t, 40.7, 41.2, EASE_IN)} />}
        {win(t, 42.3, 44.3) > 0 && <Lasso x={380} y={970} t={t} draw={prog(t, 42.3, 43.0, EASE_OUT)} rx={130} ry={60} />}
      </svg>

      {/* Citations */}
      <Html t={t} a={26.2} b={31.1} top={520}>
        <QuoteCard t={t} l1="« Je suis dans le besoin," l2="j’ai une famille… »" at2={27.4} gold={2} />
      </Html>
      <Html t={t} a={36.1} b={38.7} top={540}>
        <QuoteCard t={t} l1="« Il t’a menti." l2="Et il va revenir. »" at2={37.1} gold={2} />
      </Html>
      <Html t={t} a={61.6} b={65.1} top={560}>
        <QuoteCard t={t} l1="« Il t’a dit la vérité…" l2="alors que c’est un grand menteur. »" at2={63.2} gold={1} small2 />
      </Html>

      {/* « Laisse-moi, et je t'apprends des paroles » */}
      <Layer t={t} a={44.35} b={49.7}>
        <Smoke x={540} y={920} t={t} scale={1.1} />
        <Lasso x={540} y={930} t={t} draw={1} rx={200} ry={88} />
        <Dot x={790} y={830} r={9} />
        <Waves x={540} y={640} w={300} n={3} t={t} draw={[prog(t, 46.9, 47.5), prog(t, 47.2, 47.8), prog(t, 47.5, 48.1)]} />
      </Layer>

      {/* Au lit : le verset du Trône, un gardien d'Allah */}
      <Layer t={t} a={49.75} b={58.3}>
        <line x1={120} x2={960} y1={1072} y2={1072} stroke={GOLD} strokeOpacity={0.5 * prog(t, 52.3, 52.9)} strokeWidth={2} filter="url(#glow)" />
        <Dome cx={540} base={1072} r={340} draw={prog(t, 52.9, 53.7, EASE_OUT)} glow={prog(t, 53.3, 54.2)} />
        <Bed cx={540} base={1060} />
        {win(t, 56.0, 57.9) > 0 && <Smoke x={540 + 40 * prog(t, 56.0, 57.9)} y={420 - 180 * prog(t, 56.8, 57.9, EASE_IN)} t={t} scale={0.32} opacity={win(t, 56.0, 57.9, 0.5, 0.6)} />}
      </Layer>
      <Html t={t} a={50.8} b={52.9} top={400}>
        <ArabicTitleCard sub="le verset du Trône" />
      </Html>

      {/* Qui était-ce ? */}
      <Layer t={t} a={65.2} b={68.5}>
        <Smoke x={540} y={960} t={t} scale={1.15 + 0.1 * prog(t, 67.1, 67.8)} />
      </Layer>
      <Html t={t} a={65.4} b={67.2} top={600} rise={30}>
        <div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: 150, color: GOLD, textShadow: '0 0 30px rgba(240,196,90,0.6)', transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>?</div>
      </Html>

      {/* Âyat al-Kursî : titre, puis récitation mot à mot */}
      {(() => {
        const o = win(t, 69.9, 101.35, 0.6, 0.3);
        if (o <= 0) return null;
        const up = prog(t, 72.4, 73.1, EASE_IN_OUT);
        const toMeaning = prog(t, 92.8, 93.4, EASE_IN_OUT);
        const cy = 760 + 30 * up - 160 * toMeaning;
        const size = 520 + 260 * up - 400 * toMeaning;
        return <Octagram t={t} cx={540} cy={cy} size={size} o={o} />;
      })()}
      {(() => {
        const o = win(t, 69.9, 92.9, 0.6, 0.3);
        if (o <= 0) return null;
        const up = prog(t, 72.4, 73.1, EASE_IN_OUT);
        return (
          <div style={{position: 'absolute', top: 640 - 300 * up, width: '100%', textAlign: 'center', opacity: o, transform: `scale(${1 - 0.55 * up})`}}>
            <div dir="rtl" lang="ar" style={{fontFamily: AMIRI, fontWeight: 700, fontSize: 130, color: CREAM, lineHeight: 1.6, textShadow: '0 0 30px rgba(240,196,90,0.5)'}}>
              آيَةُ الْكُرْسِيِّ
            </div>
            <div style={{fontFamily: POPPINS, fontWeight: 600, fontSize: 32, color: '#e9e2d4', marginTop: -20, opacity: win(t, 70.9, 72.6)}}>Âyat al-Kursî · le verset du Trône</div>
          </div>
        );
      })()}
      <VerseLine t={t} v={VERSE_1} o={win(t, 72.7, 84.1, 0.3, 0.3)} />
      <ToiMic t={t} a={79.7} b={84.0} />
      <VerseLine t={t} v={VERSE_2} o={win(t, 84.2, 92.9, 0.3, 0.3)} />
      <ToiMic t={t} a={89.2} b={92.9} />

      {/* Le sens, mot par mot */}
      {[
        [92.9, 96.05, 'اللَّهُ', 120],
        [96.0, 96.9, 'الْحَيُّ', 120],
        [96.85, 98.55, 'الْقَيُّومُ', 120],
        [98.5, 101.35, 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', 70],
      ].map(([a, b, w, size]) => (
        <Html key={a as number} t={t} a={a as number} b={b as number} top={480} fin={0.3} fout={0.15} rise={0}>
          <div dir="rtl" lang="ar" style={{fontFamily: AMIRI, fontWeight: 700, fontSize: size as number, color: CREAM, lineHeight: 1.7, textShadow: '0 0 30px rgba(240,196,90,0.55)'}}>
            {w as string}
          </div>
        </Html>
      ))}

      {/* Toi, tu dors. Lui… ne dort jamais. */}
      <Layer t={t} a={101.4} b={105.3}>
        <g transform="translate(540 600) scale(1.2) translate(-540 -600)">
          <Window cx={540} top={420} />
        </g>
        <Bed cx={540} base={1150} />
      </Layer>

      {/* Ce soir, dans ton lit, récite-le en entier */}
      <Layer t={t} a={105.3} b={108.4}>
        <Dome cx={540} base={1072} r={340} draw={prog(t, 106.4, 107.1, EASE_OUT)} glow={prog(t, 106.8, 107.6)} />
        <Bed cx={540} base={1060} />
      </Layer>
      <Html t={t} a={106.9} b={108.4} top={560}>
        <ArabicTitleCard sub="en entier" />
      </Html>

      {/* Envoie la vidéo à quelqu'un que tu aimes */}
      <Layer t={t} a={108.45} b={110.7}>
        <Dot x={540} y={960} r={11} />
        <g opacity={prog(t, 109.1, 109.5, EASE_OUT)}>
          <ShareArrow x={540} y={820 - 20 * (1 - prog(t, 109.1, 109.6, EASE_OUT))} s={1.3} />
        </g>
      </Layer>
      <Html t={t} a={109.4} b={110.7} top={1050}>
        <SmallPill>quelqu’un que tu aimes</SmallPill>
      </Html>

      {/* Chaque personne… la même récompense */}
      <Layer t={t} a={110.7} b={116.3} fin={0.6} fout={0.5}>
        <Network cx={540} cy={760} p={prog(t, 110.9, 112.8, EASE_OUT)} t={t} />
      </Layer>

      {/* Sources */}
      {SOURCES.map(([a, b, text]) => (
        <Html key={a} t={t} a={a} b={b} top={170} rise={0}>
          <SourcePill text={text} />
        </Html>
      ))}

      <Captions t={t} top={captionTop} />
    </AbsoluteFill>
  );
};

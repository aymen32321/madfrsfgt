import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Palette et typo calquées sur le style "Ce que ça te coûte" : fond nuit, bleu + orange.
const C = {
  bg: '#0a0e16',
  card: '#111723',
  border: '#1f2737',
  text: '#f3f4f6',
  muted: '#6b7280',
  blue: '#3b82f6',
  orange: '#f97316',
};
const FONT = 'Inter, "Inter Display", sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Format français : 1 198,80 €
const euros = (v: number, decimals = 2) => {
  const [int, dec] = v.toFixed(decimals).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec ? `${grouped},${dec} €` : `${grouped} €`;
};

const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 140}});
};

/* ---------- Éléments persistants ---------- */

const Background = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 45% at 50% 38%, rgba(59,130,246,0.16), transparent 70%), ${C.bg}`,
    }}
  >
    <AbsoluteFill
      style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55))'}}
    />
  </AbsoluteFill>
);

const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 22,
      padding: '14px 30px',
      borderRadius: 18,
      background: C.card,
      border: `2px solid ${C.border}`,
      fontSize: 24,
      letterSpacing: 4,
      fontWeight: 600,
      color: '#9ca3af',
      ...style,
    }}
  >
    {children}
  </div>
);

const SECTIONS = ['LE CALCUL', 'LA QUESTION', 'GESTE 1', 'TOTAL'];

const Header: React.FC<{section: string | null; savings: number; showSavings: boolean}> = ({
  section,
  savings,
  showSavings,
}) => {
  const active = section ? SECTIONS.indexOf(section) : -1;
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 30,
      }}
    >
      <div style={{fontSize: 24, letterSpacing: 8, color: C.muted, fontWeight: 600}}>
        CE QUE ÇA TE COÛTE · N°2
      </div>
      <div style={{opacity: showSavings ? 1 : 0, transition: 'none'}}>
        <Pill>
          ÉCONOMIES
          <span style={{color: C.blue, fontSize: 34, letterSpacing: 0, fontWeight: 700}}>
            {euros(savings, 0)}
          </span>
        </Pill>
      </div>
      <div style={{opacity: section ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <Pill style={{color: C.text, padding: '12px 34px'}}>{section ?? ' '}</Pill>
        <div style={{display: 'flex', gap: 10}}>
          {SECTIONS.map((s, i) => (
            <div
              key={s}
              style={{
                width: i === active ? 34 : 12,
                height: 8,
                borderRadius: 4,
                background: i === active ? C.blue : '#273042',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Sous-titre : les mots apparaissent un par un, comme une voix off.
const Caption: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        top: 1470,
        width: '100%',
        padding: '0 90px',
        textAlign: 'center',
        fontSize: 50,
        fontWeight: 500,
        color: C.text,
        lineHeight: 1.3,
      }}
    >
      {words.map((w, i) => {
        const start = 6 + i * 4;
        const o = interpolate(frame, [start, start + 6], [0, 1], clamp);
        const y = interpolate(frame, [start, start + 6], [12, 0], clamp);
        return (
          <span key={i} style={{display: 'inline-block', opacity: o, transform: `translateY(${y}px)`, marginRight: 14}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      top: 470,
      height: 950,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

const BigNumber: React.FC<{value: string; label: string; size?: number; style?: React.CSSProperties}> = ({
  value,
  label,
  size = 200,
  style,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, ...style}}>
    <div style={{fontSize: size, fontWeight: 800, color: C.text, letterSpacing: -6, lineHeight: 1}}>{value}</div>
    <div style={{fontSize: 26, letterSpacing: 7, color: C.muted, fontWeight: 600}}>{label}</div>
  </div>
);

/* ---------- Scènes ---------- */

const Hook = () => {
  const card = usePop(0);
  const num = usePop(18);
  return (
    <Stage>
      <div
        style={{
          transform: `translateY(${interpolate(card, [0, 1], [-120, 0])}px)`,
          opacity: card,
          width: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '26px 30px',
          borderRadius: 30,
          background: 'rgba(30,38,54,0.85)',
          border: `2px solid ${C.border}`,
          marginBottom: 110,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${C.orange}, #ea580c)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            fontWeight: 800,
            color: 'white',
          }}
        >
          €
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 32, fontWeight: 700, color: C.text}}>Abonnement</div>
          <div style={{fontSize: 28, color: '#9ca3af', marginTop: 4}}>Paiement de 9,99 € effectué</div>
        </div>
        <div style={{fontSize: 24, color: C.muted, alignSelf: 'flex-start'}}>maintenant</div>
      </div>
      <BigNumber
        value="9,99 €"
        label="PAR MOIS"
        style={{transform: `scale(${interpolate(num, [0, 1], [0.6, 1])})`, opacity: num}}
      />
    </Stage>
  );
};

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const Invisible = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [8, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Stage>
      <div style={{position: 'relative'}}>
        <BigNumber value="9,99 €" label="PRIX INVISIBLE" style={{opacity: interpolate(strike, [0, 1], [1, 0.3])}} />
        <div
          style={{
            position: 'absolute',
            top: 98,
            left: -30,
            height: 6,
            width: `calc(${strike * 100}% + 60px)`,
            background: C.text,
            borderRadius: 3,
          }}
        />
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 120}}>
        {MONTHS.map((m, i) => {
          const on = interpolate(frame, [30 + i * 4, 36 + i * 4], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 14,
                  background: on > 0.5 ? 'rgba(249,115,22,0.18)' : C.card,
                  border: `2px solid ${on > 0.5 ? C.orange : C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 700,
                  color: on > 0.5 ? C.orange : C.muted,
                  transform: `scale(${1 + 0.12 * Math.sin(on * Math.PI)})`,
                }}
              >
                {m}
              </div>
              <div style={{fontSize: 17, color: C.orange, opacity: on, fontWeight: 600}}>−9,99</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Bar: React.FC<{label: string; value: string; pct: number; color: string}> = ({label, value, pct, color}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
      <span style={{fontSize: 32, color: '#d1d5db'}}>{label}</span>
      <span style={{fontSize: 52, fontWeight: 700, color: C.text}}>{value}</span>
    </div>
    <div style={{height: 14, borderRadius: 7, background: '#1c2433', overflow: 'hidden'}}>
      <div style={{height: '100%', width: `${pct}%`, borderRadius: 7, background: color}} />
    </div>
  </div>
);

const OneYear = () => {
  const frame = useCurrentFrame();
  const card = usePop(0);
  const p = interpolate(frame, [20, 70], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Stage>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: C.blue,
          background: 'rgba(59,130,246,0.12)',
          padding: '10px 24px',
          borderRadius: 12,
          marginBottom: 34,
          opacity: card,
        }}
      >
        12 × 9,99 €
      </div>
      <div
        style={{
          width: 840,
          padding: '50px 54px',
          borderRadius: 34,
          background: C.card,
          border: `2px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 50,
          transform: `scale(${interpolate(card, [0, 1], [0.9, 1])})`,
          opacity: card,
        }}
      >
        <Bar label="1 mois" value="9,99 €" pct={interpolate(p, [0, 0.3], [0, 8.3], clamp)} color={C.blue} />
        <Bar label="1 an" value={euros(9.99 + p * (119.88 - 9.99))} pct={p * 100} color={C.orange} />
      </div>
    </Stage>
  );
};

const TenYears = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [12, 85], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const value = 119.88 + p * (1198.8 - 119.88);
  return (
    <Stage>
      <BigNumber value={euros(value)} label="SUR 10 ANS" size={170} />
      <div style={{display: 'flex', gap: 14, marginTop: 110}}>
        {Array.from({length: 10}, (_, i) => {
          const lit = p * 10 > i;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div
                style={{
                  width: 66,
                  height: 92,
                  borderRadius: 14,
                  background: lit ? C.orange : C.card,
                  border: `2px solid ${lit ? '#fb923c' : C.border}`,
                  boxShadow: lit ? '0 0 30px rgba(249,115,22,0.45)' : 'none',
                }}
              />
              <div style={{fontSize: 18, color: lit ? '#fdba74' : C.muted, fontWeight: 600}}>AN {i + 1}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Icon: React.FC<{kind: 'play' | 'music' | 'cloud'; color: string}> = ({kind, color}) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'play' && <path d="M8 5v14l11-7z" fill={color} />}
    {kind === 'music' && (
      <>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" fill={color} />
        <circle cx="17" cy="16" r="3" fill={color} />
      </>
    )}
    {kind === 'cloud' && <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 1 0 6 18.9h11.5z" />}
  </svg>
);

const SUBS = [
  {name: 'Streaming', kind: 'play' as const},
  {name: 'Musique', kind: 'music' as const},
  {name: 'Cloud', kind: 'cloud' as const},
];

const Question = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = usePop(62);
  return (
    <Stage>
      <div style={{display: 'flex', gap: 26}}>
        {SUBS.map((s, i) => {
          const pop = spring({frame: frame - i * 8, fps, config: {damping: 13}});
          return (
            <div
              key={s.name}
              style={{
                width: 270,
                padding: '40px 0 34px',
                borderRadius: 30,
                background: C.card,
                border: `2px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                opacity: pop,
                transform: `translateY(${interpolate(pop, [0, 1], [60, 0])}px)`,
              }}
            >
              <Icon kind={s.kind} color={i === 0 ? C.orange : C.blue} />
              <div style={{fontSize: 30, fontWeight: 600, color: C.text}}>{s.name}</div>
              <div style={{fontSize: 26, color: C.muted}}>9,99 €/mois</div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize: 150, fontWeight: 800, color: C.blue, marginTop: 50, lineHeight: 1}}>?</div>
      <div
        style={{
          marginTop: 30,
          opacity: total,
          transform: `scale(${interpolate(total, [0, 1], [0.85, 1])})`,
          fontSize: 34,
          color: '#d1d5db',
        }}
      >
        3 abonnements = <b style={{color: C.orange}}>3 596 €</b> sur 10 ans
      </div>
    </Stage>
  );
};

const Toggle: React.FC<{on: number}> = ({on}) => (
  <div
    style={{
      width: 96,
      height: 54,
      borderRadius: 27,
      background: on > 0.5 ? C.blue : '#2a3343',
      position: 'relative',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 6,
        left: 6 + on * 42,
        width: 42,
        height: 42,
        borderRadius: 21,
        background: 'white',
      }}
    />
  </div>
);

export const CUT_FRAME = 32; // frame locale où l'abonnement est coupé

const Cut = () => {
  const frame = useCurrentFrame();
  const off = interpolate(frame, [CUT_FRAME, CUT_FRAME + 8], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const rows = [
    {name: 'Streaming', kind: 'play' as const, on: 1},
    {name: 'Musique', kind: 'music' as const, on: 1},
    {name: "Celui que t'ouvres plus", kind: 'cloud' as const, on: off},
  ];
  // Petit curseur "doigt" qui vient taper le toggle.
  const tap = interpolate(frame, [10, CUT_FRAME], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const press = interpolate(frame, [CUT_FRAME - 3, CUT_FRAME, CUT_FRAME + 6], [1, 0.8, 1], clamp);
  return (
    <Stage>
      <div
        style={{
          position: 'relative',
          width: 860,
          borderRadius: 34,
          background: C.card,
          border: `2px solid ${C.border}`,
          padding: '14px 44px',
        }}
      >
        {rows.map((r, i) => (
          <div
            key={r.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              padding: '34px 0',
              borderBottom: i < rows.length - 1 ? `2px solid ${C.border}` : 'none',
              opacity: i === 2 ? interpolate(off, [0, 1], [0.45, 1]) : 1,
            }}
          >
            <Icon kind={r.kind} color={i === 2 ? C.orange : C.blue} />
            <div
              style={{
                flex: 1,
                fontSize: 32,
                fontWeight: 600,
                color: C.text,
                textDecoration: i === 2 && off < 0.5 ? 'line-through' : 'none',
              }}
            >
              {r.name}
            </div>
            <Toggle on={r.on} />
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: interpolate(tap, [0, 1], [-260, 22]),
            width: 64,
            height: 64,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.25)',
            border: '3px solid rgba(255,255,255,0.8)',
            transform: `scale(${press})`,
            opacity: interpolate(frame, [10, 16, CUT_FRAME + 14, CUT_FRAME + 22], [0, 1, 1, 0], clamp),
          }}
        />
      </div>
      <div
        style={{
          marginTop: 60,
          fontSize: 34,
          color: C.blue,
          fontWeight: 600,
          opacity: interpolate(frame, [CUT_FRAME + 10, CUT_FRAME + 20], [0, 1], clamp),
        }}
      >
        + 1 199 € sur 10 ans
      </div>
    </Stage>
  );
};

const Total = () => {
  const pop = usePop(4);
  return (
    <Stage>
      <BigNumber
        value="1 199 €"
        label="SUR 10 ANS · UN SEUL CLIC"
        size={230}
        style={{transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`, opacity: pop}}
      />
    </Stage>
  );
};

/* ---------- Montage ---------- */

type Scene = {dur: number; section: string | null; caption: string; Comp: React.FC};

const SCENES: Scene[] = [
  {dur: 90, section: null, caption: '9,99 € par mois, ça paraît rien.', Comp: Hook},
  {dur: 100, section: null, caption: 'Pourtant, tu le paies chaque mois sans le voir.', Comp: Invisible},
  {dur: 110, section: 'LE CALCUL', caption: 'Sur un an, ça fait déjà 119,88 €.', Comp: OneYear},
  {dur: 110, section: 'LE CALCUL', caption: 'Sur dix ans : presque 1 200 €.', Comp: TenYears},
  {dur: 120, section: 'LA QUESTION', caption: "Et toi, t'en as combien ?", Comp: Question},
  {dur: 110, section: 'GESTE 1', caption: "Coupe celui que t'as pas ouvert ce mois-ci.", Comp: Cut},
  {dur: 100, section: 'TOTAL', caption: 'Un seul clic. Presque 1 200 € gardés.', Comp: Total},
];

const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur], []);
export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.dur, 0);

const SceneWrap: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [0, 12], [30, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{opacity: o, transform: `translateY(${y}px)`}}>{children}</AbsoluteFill>;
};

export const CeQueCaTeCoute = () => {
  const frame = useCurrentFrame();
  const current = SCENES.findLastIndex((_, i) => frame >= starts[i]);
  const cutAt = starts[5] + CUT_FRAME + 8;
  const savings = interpolate(frame, [cutAt, cutAt + 40], [0, 1199], {...clamp, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <Background />
      <Header section={SCENES[current].section} savings={savings} showSavings={frame >= starts[2]} />
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.dur}>
          <SceneWrap dur={s.dur}>
            <s.Comp />
            <Caption text={s.caption} />
          </SceneWrap>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

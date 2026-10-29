import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';

export const TICKET_FPS = 30;
export const TICKET_FRAMES = Math.round(61.8 * TICKET_FPS);

const DISPLAY = '"Inter Display", Inter, sans-serif';
const TEXT = 'Inter, sans-serif';
const MONO = '"DejaVu Sans Mono", monospace';
const RED = '#ff3b47';
const YELLOW = '#ffc83d';
const GREEN = '#2ecc71';
const INK = '#14112b';

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const prog = (t: number, a: number, b: number, easing = EASE_IN_OUT) => interpolate(t, [a, b], [0, 1], {...clamp, easing});
const win = (t: number, a: number, b: number, fin = 0.4, fout = 0.2) =>
  Math.min(prog(t, a, a + fin, EASE_OUT), 1 - prog(t, b - fout, b, EASE_IN));
/** Petit rebond amorti après un instant a (pour les apparitions). */
const settle = (t: number, a: number, dur = 0.4) => {
  const u = (t - a) / dur;
  return u <= 0 || u >= 1.6 ? 0 : Math.sin(u * Math.PI * 1.6) * Math.exp(-u * 3.2);
};
/** Texte tapé caractère par caractère entre a et b. */
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(s.length * prog(t, a, b, Easing.linear)));

const img = (name: string) => staticFile(`ticket/${name}.png`);

/* ---------- Décor ---------- */

const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 110% 70% at 50% 40%, #3a2a8f 0%, #23185f 45%, #120d33 100%)'}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 13}, (_, i) => (
        <line key={`v${i}`} x1={i * 90} x2={i * 90} y1={0} y2={1920} stroke="#fff" strokeOpacity={0.035} />
      ))}
      {Array.from({length: 22}, (_, i) => (
        <line key={`h${i}`} x1={0} x2={1080} y1={i * 90} y2={i * 90} stroke="#fff" strokeOpacity={0.035} />
      ))}
      {Array.from({length: 60}, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
          return x - Math.floor(x);
        };
        return <circle key={i} cx={r(1) * 1080} cy={r(2) * 1920} r={1 + r(3) * 1.8} fill="#fff" opacity={0.15 + 0.35 * Math.abs(Math.sin(t * (0.5 + r(4)) + i))} />;
      })}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,3,20,0.6))'}} />
  </AbsoluteFill>
);

/* ---------- Briques d'interface ---------- */

/** Élément qui entre en glissant/floutant puis sort ; dir donne le sens d'arrivée. */
const Enter: React.FC<{
  t: number;
  a: number;
  b: number;
  x: number;
  y: number;
  w?: number;
  dir?: 'left' | 'right' | 'up' | 'down' | 'pop';
  anchor?: 'center' | 'bottom' | 'top';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({t, a, b, x, y, w, dir = 'pop', anchor = 'center', children, style}) => {
  const v = win(t, a, b, 0.45, 0.22);
  if (v <= 0) return null;
  const d = 1 - v;
  const off = {left: [-140 * d, 0], right: [140 * d, 0], up: [0, -100 * d], down: [0, 100 * d], pop: [0, 0]}[dir];
  const s = dir === 'pop' ? 0.7 + 0.3 * v + 0.06 * settle(t, a + 0.15) : 1;
  const ty = anchor === 'center' ? '-50%' : anchor === 'bottom' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translate(-50%, ${ty}) translate(${off[0]}px, ${off[1]}px) scale(${s})`,
        transformOrigin: anchor === 'bottom' ? '50% 100%' : '50% 50%',
        opacity: v,
        filter: v < 1 ? `blur(${d * 10}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Personnage ou objet généré (PNG détouré), avec une ombre au sol. */
const Pic: React.FC<{name: string; h?: number; w?: number; shadow?: boolean; style?: React.CSSProperties}> = ({name, h, w, shadow = true, style}) => (
  <div style={{position: 'relative', ...style}}>
    {shadow && <div style={{position: 'absolute', left: '15%', right: '15%', bottom: -6, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(10px)'}} />}
    <Img src={img(name)} style={{position: 'relative', height: h, width: w, display: 'block'}} />
  </div>
);

const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.09)',
      border: '2px solid rgba(255,255,255,0.18)',
      borderRadius: 22,
      color: 'white',
      fontFamily: TEXT,
      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: '#fff', borderRadius: 26, color: INK, fontFamily: TEXT, boxShadow: '0 24px 60px rgba(0,0,0,0.45)', overflow: 'hidden', ...style}}>{children}</div>
);

const Brand: React.FC<{size?: number}> = ({size = 34}) => (
  <span style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 900, fontSize: size, color: RED, textShadow: `2px 2px 0 ${YELLOW}`}}>McDo</span>
);

const Stars: React.FC<{n: number; size?: number}> = ({n, size = 30}) => (
  <span style={{letterSpacing: 2, fontSize: size}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} style={{color: i < Math.round(n) ? YELLOW : 'rgba(255,255,255,0.25)'}}>
        ★
      </span>
    ))}
  </span>
);

const NumDot: React.FC<{n: number; color?: string}> = ({n, color = YELLOW}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 19, background: color, color: INK, fontWeight: 900, fontSize: 22, fontFamily: DISPLAY}}>{n}</span>
);

/* ---------- Sous-titres ---------- */

type Word = {w: string; s: number; e: number; gold: boolean};
const CHUNKS = captions as Word[][];
const LEAD = 0.25;
// Comme l'original : pas de ponctuation finale ni de guillemets dans les sous-titres.
const clean = (w: string) => w.replace(/[«»]/g, '').replace(/[.,:;]+$/, '').trim();

const Captions: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i][0].s - LEAD - 0.04) idx = i;
  if (idx < 0) return null;
  const chunk = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const lastE = chunk[chunk.length - 1].e;
  const end = next && next[0].s - lastE < 0.8 ? next[0].s - LEAD - 0.04 : lastE + 0.6;
  if (t >= end) return null;
  return (
    <div style={{position: 'absolute', top: 1300, width: '100%', padding: '0 70px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 18px'}}>
      {chunk.map((w, i) => {
        const on = prog(t, w.s - LEAD, w.s - LEAD + 0.12, EASE_OUT);
        return (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 58,
              lineHeight: 1.12,
              textTransform: 'uppercase',
              color: w.gold ? RED : 'white',
              opacity: on,
              transform: `translateY(${(1 - on) * 10}px) scale(${1 + 0.08 * settle(t, w.s - LEAD, 0.3)})`,
              filter: on < 1 ? `blur(${(1 - on) * 6}px)` : undefined,
              textShadow: '0 4px 18px rgba(0,0,0,0.55)',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Scènes ---------- */

const Clock: React.FC<{t: number}> = ({t}) => {
  const p = prog(t, 0.2, 1.9, Easing.bezier(0.33, 0, 0.2, 1));
  const minutes = 42 + Math.round(30 * p);
  const hh = 12 + Math.floor(minutes / 60);
  const mm = minutes % 60;
  const ang = p * 180;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <svg width={200} height={200} viewBox="0 0 200 200">
        <circle cx={100} cy={100} r={92} fill="#fff" stroke={RED} strokeWidth={14} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={100 + Math.sin(a) * 70} y1={100 - Math.cos(a) * 70} x2={100 + Math.sin(a) * 80} y2={100 - Math.cos(a) * 80} stroke={INK} strokeWidth={5} />;
        })}
        <line x1={100} y1={100} x2={100 + Math.sin(((ang + 252) * Math.PI) / 180) * 60} y2={100 - Math.cos(((ang + 252) * Math.PI) / 180) * 60} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={100} y1={100} x2={100 + Math.sin((ang * 12 * Math.PI) / 180) * 74} y2={100 - Math.cos((ang * 12 * Math.PI) / 180) * 74} stroke={RED} strokeWidth={4} strokeLinecap="round" />
        <circle cx={100} cy={100} r={9} fill={INK} />
      </svg>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: 'white', textShadow: '0 6px 20px rgba(0,0,0,0.5)'}}>
        {hh}:{String(mm).padStart(2, '0')}
      </div>
    </div>
  );
};

const MenuChip = () => (
  <Glass style={{padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(20,14,50,0.85)'}}>
    <Brand size={36} />
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 28}}>Menu · 11,50 €</span>
  </Glass>
);

const Receipt: React.FC<{t: number}> = ({t}) => {
  const rows: {k: string; v: string; n?: number; at?: number}[] = [
    {k: 'Restaurant n°', v: '1247', n: 1, at: 15.44},
    {k: '24/10/2026', v: '12:42', n: 2, at: 16.46},
    {k: 'Commande n°', v: '47'},
    {k: '1 × Menu Burger', v: '11,50 €'},
    {k: 'TOTAL', v: '11,50 €', n: 3, at: 18.02},
  ];
  const badges = prog(t, 13.98, 14.4, EASE_OUT);
  return (
    <Card style={{width: 440, padding: '26px 30px 30px', borderRadius: 6, fontFamily: MONO, transform: 'rotate(3deg)', clipPath: 'polygon(0 0,100% 0,100% 97%,95% 100%,90% 97%,85% 100%,80% 97%,75% 100%,70% 97%,65% 100%,60% 97%,55% 100%,50% 97%,45% 100%,40% 97%,35% 100%,30% 97%,25% 100%,20% 97%,15% 100%,10% 97%,5% 100%,0 97%)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
        <Brand size={34} />
        <span style={{fontSize: 16, color: '#777'}}>Ticket de caisse</span>
      </div>
      {rows.map((r) => {
        const hl = r.at ? prog(t, r.at, r.at + 0.3, EASE_OUT) : 0;
        return (
          <div key={r.k} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 23, padding: '9px 6px', fontWeight: r.k === 'TOTAL' ? 700 : 400, borderTop: r.k === 'TOTAL' ? '2px dashed #999' : undefined}}>
            <div style={{position: 'absolute', inset: 0, background: YELLOW, opacity: 0.55 * hl, transformOrigin: 'left', transform: `scaleX(${hl})`, borderRadius: 4}} />
            <span style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 8}}>
              {r.n && (
                <span style={{transform: `scale(${badges})`, display: 'inline-flex'}}>
                  <NumDot n={r.n} />
                </span>
              )}
              {r.k}
            </span>
            <span style={{position: 'relative'}}>{r.v}</span>
          </div>
        );
      })}
      <div style={{textAlign: 'center', fontSize: 15, color: '#888', marginTop: 14}}>Merci de votre visite</div>
    </Card>
  );
};

const InfoChips: React.FC<{t: number; until: number}> = ({t, until}) => (
  <>
    {[
      {n: 1, k: 'Restaurant', v: '1247', a: 15.44},
      {n: 2, k: 'Heure', v: '12 h 42', a: 16.46},
      {n: 3, k: 'Prix', v: '11,50 €', a: 18.02},
    ].map((c, i) => (
      <Enter key={c.n} t={t} a={c.a} b={until} x={200} y={330 + i * 92} dir="left">
        <Glass style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px 10px 12px', background: 'rgba(20,14,50,0.85)', whiteSpace: 'nowrap'}}>
          <NumDot n={c.n} />
          <span style={{fontSize: 24, opacity: 0.7}}>{c.k}</span>
          <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30}}>{c.v}</span>
        </Glass>
      </Enter>
    ))}
  </>
);

const Field: React.FC<{label: string; value: string; caret?: boolean; tall?: boolean}> = ({label, value, caret, tall}) => (
  <div style={{marginBottom: 16}}>
    <div style={{fontSize: 15, fontWeight: 700, color: '#8a8aa0', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6}}>{label}</div>
    <div style={{border: '2px solid #e2e2ee', borderRadius: 12, padding: '12px 14px', fontSize: 22, fontWeight: 600, minHeight: tall ? 132 : 30, lineHeight: 1.35, color: INK}}>
      {value}
      {caret && <span style={{display: 'inline-block', width: 3, height: 26, background: INK, marginLeft: 2, verticalAlign: 'middle'}} />}
    </div>
  </div>
);

const ContactForm: React.FC<{t: number}> = ({t}) => {
  const msg = 'Restaurant 1247, commande de 12 h 42 : 30 minutes d’attente et un burger froid.';
  const press = settle(t, 26.35, 0.3);
  const blink = Math.floor(t * 2.5) % 2 === 0;
  return (
    <Card style={{width: 470, padding: '26px 28px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20}}>
        <Brand size={34} />
        <div>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26}}>Nous contacter</div>
          <div style={{fontSize: 16, color: GREEN, fontWeight: 700}}>✓ Site officiel</div>
        </div>
      </div>
      <Field label="N° du restaurant" value={typed('1247', t, 22.2, 22.6)} caret={t >= 22.0 && t < 22.7 && blink} />
      <Field label="Date et heure" value={typed('24/10 · 12 h 42', t, 23.5, 24.1)} caret={t >= 23.4 && t < 24.2 && blink} />
      <Field label="Votre message" value={typed(msg, t, 22.7, 26.2)} caret={t >= 24.2 && t < 26.3 && blink} tall />
      <div style={{background: RED, color: '#fff', textAlign: 'center', borderRadius: 14, padding: '16px 0', fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, transform: `scale(${1 - 0.08 * press})`}}>
        {t >= 26.4 ? 'Envoyé ✓' : 'Envoyer'}
      </div>
    </Card>
  );
};

const RestaurantGrid: React.FC<{t: number}> = ({t}) => {
  const fly = prog(t, 28.0, 28.9, EASE_IN_OUT);
  const dim = prog(t, 29.2, 29.6, EASE_OUT);
  const nums = [1243, 1244, 1245, 1246, 1247, 1248, 1249, 1250];
  return (
    <>
      {nums.map((n, i) => {
        const x = 175 + (i % 4) * 243;
        const y = 560 + Math.floor(i / 4) * 290;
        const target = n === 1247;
        const v = win(t, 26.7 + i * 0.06, 30.45, 0.4, 0.2);
        return (
          <div key={n} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.8 + 0.2 * v) * (target ? 1 + 0.25 * dim : 1)})`, opacity: v * (target ? 1 : 1 - 0.75 * dim), textAlign: 'center'}}>
            <Img src={img('restaurant')} style={{width: 200, filter: target && dim > 0 ? `drop-shadow(0 0 ${30 * dim}px ${YELLOW})` : undefined}} />
            <div style={{display: 'inline-block', marginTop: -6, padding: '4px 14px', borderRadius: 10, background: target && dim > 0.5 ? YELLOW : 'rgba(255,255,255,0.12)', color: target && dim > 0.5 ? INK : '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: 24}}>{n}</div>
          </div>
        );
      })}
      {/* l'avion en papier de la réclamation */}
      {fly > 0 && fly < 1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {(() => {
            const x0 = 540;
            const y0 = 330;
            const x1 = 418;
            const y1 = 850;
            const x = x0 + (x1 - x0) * fly + Math.sin(fly * Math.PI) * 220;
            const y = y0 + (y1 - y0) * fly;
            return (
              <g transform={`translate(${x} ${y}) rotate(${110 - fly * 40}) scale(1.6)`}>
                <path d="M -24 -14 L 26 0 L -24 14 L -14 0 Z" fill="#fff" stroke={INK} strokeWidth={2} />
                <path d="M -14 0 L 26 0" stroke={INK} strokeWidth={2} />
              </g>
            );
          })()}
        </svg>
      )}
    </>
  );
};

const RatingCard: React.FC<{t: number; title: string; from: number; to: number; at: number}> = ({t, title, from, to, at}) => {
  const p = prog(t, at, at + 0.6, EASE_IN_OUT);
  const v = from + (to - from) * p;
  const shake = p > 0 && p < 1 ? Math.sin(t * 60) * 4 : 0;
  return (
    <Glass style={{padding: '16px 26px', background: 'rgba(20,14,50,0.88)', transform: `translateX(${shake}px)`}}>
      <div style={{fontSize: 17, fontWeight: 700, opacity: 0.6, letterSpacing: 1, textTransform: 'uppercase'}}>{title}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: p > 0.5 ? RED : '#fff'}}>{v.toFixed(1).replace('.', ',')}</span>
        <Stars n={v} size={34} />
      </div>
    </Glass>
  );
};

const Email: React.FC<{t: number}> = ({t}) => {
  const hl = prog(t, 35.1, 35.5, EASE_OUT);
  return (
    <Card style={{width: 500, padding: '24px 28px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, borderBottom: '2px solid #eee', paddingBottom: 14, marginBottom: 14}}>
        <Brand size={32} />
        <div>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24}}>Service client</div>
          <div style={{fontSize: 15, color: '#888'}}>Réponse à votre réclamation</div>
        </div>
      </div>
      <div style={{fontSize: 22, lineHeight: 1.45}}>
        Bonjour Thomas,
        <br />
        nous sommes désolés pour votre commande.
      </div>
      <div style={{marginTop: 14, padding: '12px 14px', borderRadius: 12, background: `rgba(255,200,61,${0.15 + 0.6 * hl})`, fontSize: 23, fontWeight: 800}}>
        En geste commercial : <span style={{color: RED}}>2 menus offerts</span>
      </div>
    </Card>
  );
};

const Toggle: React.FC<{on: number}> = ({on}) => (
  <div style={{width: 92, height: 50, borderRadius: 25, background: on > 0.5 ? GREEN : '#55507a', position: 'relative', flexShrink: 0}}>
    <div style={{position: 'absolute', top: 5, left: 5 + 42 * on, width: 40, height: 40, borderRadius: 20, background: '#fff'}} />
  </div>
);

const AttentionPill = () => (
  <div style={{background: YELLOW, color: INK, fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, padding: '10px 30px', borderRadius: 999, boxShadow: '0 10px 30px rgba(255,200,61,0.35)'}}>⚠ ATTENTION</div>
);

const Scale: React.FC<{t: number}> = ({t}) => {
  const tilt = 14 * prog(t, 45.0, 45.8, Easing.bezier(0.34, 1.3, 0.64, 1));
  const L = {x: 540 - 230 * Math.cos((tilt * Math.PI) / 180), y: 560 - 230 * Math.sin((tilt * Math.PI) / 180)};
  const R = {x: 540 + 230 * Math.cos((tilt * Math.PI) / 180), y: 560 + 230 * Math.sin((tilt * Math.PI) / 180)};
  const gold = '#f2c14e';
  const Pan: React.FC<{p: {x: number; y: number}; label: string; pic: string; w: number}> = ({p, label, pic, w}) => (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={p.x} y1={p.y} x2={p.x - 90} y2={p.y + 170} stroke={gold} strokeWidth={4} />
        <line x1={p.x} y1={p.y} x2={p.x + 90} y2={p.y + 170} stroke={gold} strokeWidth={4} />
        <path d={`M ${p.x - 120} ${p.y + 170} Q ${p.x} ${p.y + 230} ${p.x + 120} ${p.y + 170} Z`} fill={gold} stroke="#a87c1c" strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: p.x, top: p.y + 175, transform: 'translate(-50%, -100%)'}}>
        <Img src={img(pic)} style={{width: w, display: 'block'}} />
      </div>
      <div style={{position: 'absolute', left: p.x, top: p.y + 240, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
        <Glass style={{padding: '8px 18px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, background: 'rgba(20,14,50,0.85)'}}>{label}</Glass>
      </div>
    </>
  );
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={528} y={560} width={24} height={420} rx={8} fill={gold} stroke="#a87c1c" strokeWidth={4} />
        <path d="M 430 1000 Q 540 950 650 1000 Z" fill={gold} stroke="#a87c1c" strokeWidth={4} />
        <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={gold} strokeWidth={18} strokeLinecap="round" />
        <circle cx={540} cy={560} r={22} fill={gold} stroke="#a87c1c" strokeWidth={4} />
      </svg>
      <Pan p={L} label="2 menus ≈ 23 €" pic="meal" w={150} />
      <Pan p={R} label="1 client perdu" pic="family" w={210} />
    </>
  );
};

const ShareCard: React.FC<{t: number}> = ({t}) => {
  const people = [
    {n: 'Lucas', c: '#ff7b54'},
    {n: 'Inès', c: '#4fb0ec'},
    {n: 'Karim', c: GREEN},
    {n: 'Jade', c: '#b07cff'},
  ];
  const sel = prog(t, 58.6, 58.9, EASE_OUT);
  const press = settle(t, 59.3, 0.3);
  return (
    <Glass style={{padding: '20px 24px', background: 'rgba(20,14,50,0.9)', width: 460}}>
      <div style={{fontSize: 22, fontWeight: 700, opacity: 0.7, marginBottom: 14}}>Envoyer à…</div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 18}}>
        {people.map((p, i) => (
          <div key={p.n} style={{textAlign: 'center'}}>
            <div style={{width: 76, height: 76, borderRadius: 38, background: p.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, border: `4px solid ${i < 3 && sel > 0.5 ? YELLOW : 'transparent'}`}}>{p.n[0]}</div>
            <div style={{fontSize: 17, marginTop: 6}}>{p.n}</div>
          </div>
        ))}
      </div>
      <div style={{background: RED, borderRadius: 14, textAlign: 'center', padding: '14px 0', fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, transform: `scale(${1 - 0.08 * press})`}}>Envoyer</div>
    </Glass>
  );
};

const Moon = () => (
  <svg width={110} height={110} viewBox="0 0 100 100">
    <defs>
      <mask id="moonMask">
        <circle cx={50} cy={50} r={36} fill="#fff" />
        <circle cx={66} cy={40} r={30} fill="#000" />
      </mask>
    </defs>
    <circle cx={50} cy={50} r={46} fill={YELLOW} opacity={0.18} />
    <circle cx={50} cy={50} r={36} fill={YELLOW} mask="url(#moonMask)" />
  </svg>
);

/* ---------- Effets sonores (discrets, sous la voix d'origine) ---------- */

const SCENE_CUTS = [2.15, 4.5, 7.2, 10.45, 26.5, 30.4, 33.0, 36.3, 39.25, 43.75, 46.6, 53.45, 58.05];
const SOUNDS: {at: number; file: string; volume: number}[] = [
  ...SCENE_CUTS.map((a) => ({at: a - 0.08, file: 'whoosh', volume: 0.2})),
  {at: 6.35, file: 'swipe', volume: 0.25},
  {at: 11.5, file: 'pop', volume: 0.22},
  ...[15.44, 16.46, 18.02].map((a, i) => ({at: a, file: `tick${i + 3}`, volume: 0.3})),
  ...Array.from({length: 26}, (_, i) => ({at: 22.2 + i * 0.15, file: `tick${(i * 5) % 12}`, volume: 0.08})),
  {at: 26.35, file: 'click', volume: 0.3},
  {at: 28.9, file: 'pop', volume: 0.25},
  {at: 32.3, file: 'swipe', volume: 0.2},
  {at: 35.5, file: 'pop', volume: 0.3},
  {at: 38.3, file: 'kaching', volume: 0.3},
  {at: 42.7, file: 'swipe', volume: 0.2},
  {at: 45.0, file: 'click', volume: 0.25},
  {at: 47.9, file: 'click', volume: 0.3},
  {at: 52.9, file: 'swipe', volume: 0.2},
  {at: 59.3, file: 'click', volume: 0.3},
];

/* ---------- Composition ---------- */

export const Ticket = () => {
  const frame = useCurrentFrame();
  const t = frame / TICKET_FPS;
  const sway = (k = 0) => `rotate(${Math.sin(t * 1.3 + k) * 0.8}deg)`;
  const jump = Math.abs(Math.sin((t - 36.3) * 3.4)) * 70;

  return (
    <AbsoluteFill style={{fontFamily: TEXT}}>
      <Background t={t} />

      {/* 1. Thomas attend 30 minutes */}
      <Enter t={t} a={0} b={2.25} x={290} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_crossed" h={760} style={{transform: sway()}} />
      </Enter>
      <Enter t={t} a={7.2} b={10.45} x={290} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_crossed" h={760} style={{transform: sway()}} />
      </Enter>
      <Enter t={t} a={0} b={2.25} x={540} y={420} dir="down">
        <Clock t={t} />
      </Enter>
      <Enter t={t} a={0.1} b={2.25} x={770} y={1180} w={560} anchor="bottom" dir="right">
        <Pic name="counter" w={560} />
      </Enter>
      <Enter t={t} a={0.6} b={2.25} x={770} y={720} dir="up">
        <MenuChip />
      </Enter>

      {/* 2. Le couple arrivé après lui mange déjà */}
      <Enter t={t} a={2.15} b={4.5} x={330} y={1250} anchor="bottom" dir="left">
        <Pic name="couple" w={620} />
      </Enter>
      <Enter t={t} a={2.2} b={4.5} x={800} y={760} anchor="bottom" dir="right">
        <Pic name="counter" w={400} shadow={false} />
      </Enter>
      <Enter t={t} a={2.3} b={4.5} x={330} y={360} dir="down">
        <Glass style={{padding: '10px 20px', fontSize: 28, background: 'rgba(20,14,50,0.85)'}}>
          Thomas <b style={{fontFamily: DISPLAY}}>12 h 42</b>
        </Glass>
      </Enter>
      <Enter t={t} a={2.7} b={4.5} x={740} y={360} dir="down">
        <Glass style={{padding: '10px 20px', fontSize: 28, background: 'rgba(20,14,50,0.85)'}}>
          Couple <b style={{fontFamily: DISPLAY, color: RED}}>12 h 55</b>
        </Glass>
      </Enter>

      {/* 3. Le sac s'ouvre : burger froid */}
      <Enter t={t} a={4.5} b={7.2} x={300} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_bag" h={780} style={{transform: sway(1)}} />
      </Enter>
      <Enter t={t} a={6.3} b={7.2} x={770} y={650} dir="pop">
        <div style={{filter: 'drop-shadow(0 0 40px rgba(120,200,255,0.6))'}}>
          <Pic name="frozen_burger" w={400} shadow={false} />
        </div>
      </Enter>

      {/* 4. « Froid ou chaud, c'est le même prix » */}
      <Enter t={t} a={7.2} b={10.45} x={770} y={1180} w={560} anchor="bottom" dir="right">
        <Pic name="counter" w={560} />
      </Enter>
      <Enter t={t} a={7.5} b={10.45} x={700} y={470} dir="up">
        <Glass style={{padding: '18px 22px', width: 470, background: 'rgba(20,14,50,0.9)'}}>
          <div style={{fontSize: 18, fontWeight: 700, opacity: 0.6}}>Le manager · au comptoir</div>
          <div style={{marginTop: 10, background: '#fff', color: INK, borderRadius: 16, padding: '14px 18px', fontSize: 28, fontWeight: 700, minHeight: 40}}>
            {typed('Froid ou chaud, c’est le même prix, monsieur.', t, 8.8, 10.1)}
          </div>
        </Glass>
      </Enter>

      {/* 5 à 7. Le soir : le ticket, les 3 infos, le formulaire */}
      <Enter t={t} a={10.45} b={26.5} x={300} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_desk" h={720} />
      </Enter>
      <Enter t={t} a={10.6} b={18.6} x={540} y={240} dir="down">
        <Moon />
      </Enter>
      <Enter t={t} a={11.5} b={18.75} x={740} y={360} anchor="top" dir="up">
        <Receipt t={t} />
      </Enter>
      <InfoChips t={t} until={26.5} />
      <Enter t={t} a={18.7} b={26.55} x={790} y={620} dir="right">
        <ContactForm t={t} />
      </Enter>

      {/* 8. La réclamation arrive chez le bon franchisé */}
      <Enter t={t} a={26.55} b={30.45} x={540} y={330} dir="down">
        <Glass style={{padding: '12px 24px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, background: YELLOW, color: INK, border: 'none'}}>Ticket : Restaurant 1247</Glass>
      </Enter>
      {t >= 26.6 && t < 30.5 && <RestaurantGrid t={t} />}

      {/* 9. Un client mécontent = une mauvaise note */}
      <Enter t={t} a={30.4} b={33.0} x={350} y={760} dir="pop">
        <div style={{textAlign: 'center'}}>
          <Img src={img('restaurant')} style={{width: 460}} />
          <div style={{display: 'inline-block', padding: '6px 20px', borderRadius: 12, background: YELLOW, color: INK, fontFamily: DISPLAY, fontWeight: 900, fontSize: 34}}>1247</div>
        </div>
      </Enter>
      <Enter t={t} a={30.6} b={33.0} x={810} y={1250} anchor="bottom" dir="right">
        <Pic name="franchisee" h={720} style={{transform: sway(2)}} />
      </Enter>
      <Enter t={t} a={30.7} b={33.0} x={540} y={360} dir="down">
        <RatingCard t={t} title="Note du restaurant 1247" from={4.6} to={4.2} at={32.25} />
      </Enter>

      {/* 10. Réponse : 2 menus offerts */}
      <Enter t={t} a={33.0} b={36.3} x={280} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_phone" h={780} style={{transform: sway(3)}} />
      </Enter>
      <Enter t={t} a={33.9} b={36.3} x={770} y={330} anchor="top" dir="up">
        <Email t={t} />
      </Enter>
      <Enter t={t} a={35.45} b={36.3} x={780} y={890} dir="pop">
        <Pic name="gift" w={300} shadow={false} />
      </Enter>

      {/* 11. 11,50 € → 23 € */}
      <Enter t={t} a={36.3} b={39.25} x={300} y={1250 - jump} anchor="bottom" dir="left">
        <Pic name="thomas_jump" h={760} shadow={false} />
      </Enter>
      <Enter t={t} a={36.5} b={39.25} x={640} y={470} dir="pop">
        <Pic name="meal" w={230} shadow={false} />
      </Enter>
      <Enter t={t} a={36.7} b={39.25} x={880} y={470} dir="pop">
        <Pic name="meal" w={230} shadow={false} />
      </Enter>
      <Enter t={t} a={36.85} b={39.25} x={640} y={780} dir="pop">
        <Glass style={{padding: '12px 22px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, background: '#fff', color: INK, border: 'none'}}>11,50 €</Glass>
      </Enter>
      <Enter t={t} a={37.6} b={39.25} x={890} y={780} dir="pop">
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, color: YELLOW, textShadow: '0 0 30px rgba(255,200,61,0.6)', whiteSpace: 'nowrap'}}>
          {(11.5 + 11.5 * prog(t, 37.6, 38.6, EASE_OUT)).toFixed(2).replace('.', ',').replace(',00', '')} €
        </div>
      </Enter>

      {/* 12. Pourquoi ça marche : les notes et les avis */}
      <Enter t={t} a={39.25} b={43.75} x={540} y={300} dir="down">
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: '#fff', whiteSpace: 'nowrap'}}>
          Pourquoi ça marche <span style={{color: YELLOW}}>?</span>
        </div>
      </Enter>
      <Enter t={t} a={39.4} b={43.75} x={260} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_tip" h={740} style={{transform: sway(4)}} />
      </Enter>
      <Enter t={t} a={46.6} b={61.8} x={260} y={1250} anchor="bottom" dir="left">
        <Pic name="thomas_tip" h={740} style={{transform: sway(4)}} />
      </Enter>
      <Enter t={t} a={40.4} b={43.75} x={780} y={830} dir="pop">
        <Img src={img('restaurant')} style={{width: 440}} />
      </Enter>
      <Enter t={t} a={41.0} b={43.75} x={780} y={520} dir="up">
        <RatingCard t={t} title="Note sur Google" from={4.6} to={2.1} at={42.6} />
      </Enter>
      <Enter t={t} a={41.4} b={42.6} x={520} y={440} dir="pop">
        <Glass style={{padding: '8px 16px', background: '#fff', color: INK, fontSize: 22, fontWeight: 700}}>
          <Stars n={5} size={22} /> « Rapide ! »
        </Glass>
      </Enter>
      {t >= 42.8 && t < 43.8 && (
        <div style={{position: 'absolute', left: 760 - 520 * prog(t, 42.8, 43.75, Easing.linear), top: 900, opacity: win(t, 42.8, 43.75, 0.2, 0.2)}}>
          <Img src={img('family')} style={{width: 380}} />
        </div>
      )}

      {/* 13. La balance : 2 menus contre un client perdu */}
      {t >= 43.75 && t < 46.65 && (
        <div style={{position: 'absolute', inset: 0, opacity: win(t, 43.75, 46.65, 0.4, 0.2)}}>
          <Scale t={t} />
        </div>
      )}

      {/* 14 à 16. Attention : geste commercial, commande vraiment ratée, sans ticket */}
      <Enter t={t} a={46.6} b={53.45} x={540} y={300} dir="down">
        <AttentionPill />
      </Enter>
      <Enter t={t} a={46.8} b={49.95} x={770} y={470} dir="right">
        <Glass style={{padding: '18px 22px', width: 470, background: 'rgba(20,14,50,0.9)', display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{flex: 1, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30}}>Dédommagement obligatoire</div>
          <Toggle on={1 - prog(t, 47.85, 48.1, EASE_IN_OUT)} />
        </Glass>
      </Enter>
      <Enter t={t} a={48.25} b={49.95} x={880} y={600} dir="pop">
        <div style={{border: `6px solid ${RED}`, color: RED, fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, padding: '2px 22px', borderRadius: 10, transform: 'rotate(-12deg)'}}>NON</div>
      </Enter>
      <Enter t={t} a={49.1} b={49.95} x={700} y={820} dir="pop">
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Pic name="gift" w={170} shadow={false} />
          <Glass style={{padding: '10px 18px', background: YELLOW, color: INK, border: 'none', fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, whiteSpace: 'nowrap'}}>Geste commercial</Glass>
        </div>
      </Enter>
      <Enter t={t} a={50.0} b={52.25} x={770} y={500} dir="right">
        <Glass style={{padding: '18px 22px', width: 470, background: 'rgba(20,14,50,0.9)'}}>
          <div style={{fontSize: 22, opacity: 0.7, marginBottom: 12}}>Seulement si la commande est vraiment ratée</div>
          {[
            {l: '30 min d’attente', a: 50.6},
            {l: 'Burger froid', a: 51.4},
          ].map((r) => (
            <div key={r.l} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', marginTop: 8, borderRadius: 12, background: 'rgba(255,255,255,0.08)', fontFamily: DISPLAY, fontWeight: 800, fontSize: 30}}>
              {r.l}
              <span style={{width: 40, height: 40, borderRadius: 20, background: GREEN, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${prog(t, r.a, r.a + 0.25, EASE_OUT)})`}}>✓</span>
            </div>
          ))}
        </Glass>
      </Enter>
      <Enter t={t} a={52.3} b={53.5} x={760} y={640} dir="pop">
        <div style={{position: 'relative', width: 260, height: 300}}>
          <Card style={{width: 240, height: 290, borderRadius: 6, padding: 20, fontFamily: MONO, fontSize: 18, transform: 'rotate(-6deg)'}}>
            <Brand size={28} />
            {['Restaurant 1247', '24/10 · 12:42', 'TOTAL 11,50 €'].map((l) => (
              <div key={l} style={{marginTop: 18}}>{l}</div>
            ))}
          </Card>
          <svg width={300} height={300} viewBox="0 0 300 300" style={{position: 'absolute', left: -20, top: -5}}>
            <path d="M 40 40 L 260 260 M 260 40 L 40 260" stroke={RED} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${320 * prog(t, 52.5, 52.8)} 400`} />
          </svg>
        </div>
      </Enter>
      <Enter t={t} a={52.95} b={53.5} x={800} y={880} dir="pop">
        <Glass style={{padding: '10px 22px', background: RED, border: 'none', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34}}>0 % de chance</Glass>
      </Enter>

      {/* 17 à 19. Burger froid ? Garde ton ticket. Envoie la vidéo. */}
      <Enter t={t} a={53.45} b={57.2} x={770} y={640} dir="pop">
        <div style={{filter: 'drop-shadow(0 0 40px rgba(120,200,255,0.6))'}}>
          <Pic name="frozen_burger" w={420} shadow={false} />
        </div>
      </Enter>
      <Enter t={t} a={57.15} b={58.1} x={770} y={700} dir="pop">
        <Pic name="wallet" w={330} shadow={false} />
      </Enter>
      <Enter t={t} a={57.3} b={58.1} x={700} y={500} dir="pop">
        <Card style={{padding: '10px 16px', borderRadius: 6, fontFamily: MONO, fontSize: 20, transform: 'rotate(-8deg)'}}>
          <Brand size={24} /> <b>11,50 €</b>
        </Card>
      </Enter>
      <Enter t={t} a={58.1} b={61.8} x={760} y={340} anchor="top" dir="up">
        <ShareCard t={t} />
      </Enter>
      <Enter t={t} a={58.9} b={61.8} x={800} y={1250} anchor="bottom" dir="right">
        <Pic name="friend" h={660} style={{transform: sway(5)}} />
      </Enter>

      <Captions t={t} />

      <Html5Audio src={staticFile('ticket/audio.wav')} />
      {SOUNDS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * TICKET_FPS)} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

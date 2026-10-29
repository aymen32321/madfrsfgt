// Modèle de composition TikTok 1080×1920 (Remotion 4).
// Copier dans src/<projet>/<Nom>.tsx, renommer, puis remplir SCENES (dans le JSX), SOUNDS et les constantes.
// Toutes les animations sont des fonctions pures du temps t (en secondes) : aucun état, aucune horloge réelle.
import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';

export const STORY_FPS = 30;
export const STORY_SECONDS = 20; // durée totale : fin de la voix + ~1 s
export const STORY_FRAMES = Math.round(STORY_SECONDS * STORY_FPS);

const AUDIO: string | null = null; // ex. 'story/voice.mp3' (dans public/) ; null = vidéo sans voix
const ASSETS = 'story'; // sous-dossier de public/ pour les images

/* ---------- Palette et typo (à adapter au style choisi, voir references/styles.md) ---------- */

const C = {
  bg1: '#3a2a8f',
  bg2: '#23185f',
  bg3: '#120d33',
  text: '#ffffff',
  accent: '#ff3b47',
  accent2: '#ffc83d',
  ink: '#14112b',
};
const DISPLAY = '"Inter Display", Inter, sans-serif';
const TEXT = 'Inter, sans-serif';

/* ---------- Temps et courbes ---------- */

// Entrée : longue décélération. Sortie : accélération, plus courte. Mouvement à l'écran : ease-in-out.
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 → 1 entre a et b. */
export const prog = (t: number, a: number, b: number, easing = EASE_IN_OUT) => interpolate(t, [a, b], [0, 1], {...clamp, easing});
/** Visibilité d'un élément présent de a à b (entrée fin s, sortie fout s). */
export const win = (t: number, a: number, b: number, fin = 0.4, fout = 0.2) =>
  Math.min(prog(t, a, a + fin, EASE_OUT), 1 - prog(t, b - fout, b, EASE_IN));
/** Rebond amorti après l'instant a (0 au repos) : multiplier par 0.04–0.08 pour un « pop » sobre. */
export const settle = (t: number, a: number, dur = 0.4) => {
  const u = (t - a) / dur;
  return u <= 0 || u >= 1.6 ? 0 : Math.sin(u * Math.PI * 1.6) * Math.exp(-u * 3.2);
};
/** Texte tapé caractère par caractère entre a et b. */
export const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(s.length * prog(t, a, b, Easing.linear)));
/** Hasard déterministe (même résultat à chaque image). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- Décor ---------- */

const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 110% 70% at 50% 40%, ${C.bg1} 0%, ${C.bg2} 45%, ${C.bg3} 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 60}, (_, i) => (
        <circle key={i} cx={rand(i) * 1080} cy={rand(i + 99) * 1920} r={1 + rand(i + 7) * 1.8} fill="#fff" opacity={0.12 + 0.3 * Math.abs(Math.sin(t * (0.5 + rand(i + 3)) + i))} />
      ))}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5))'}} />
  </AbsoluteFill>
);

/* ---------- Briques ---------- */

type Dir = 'left' | 'right' | 'up' | 'down' | 'pop';

/** Élément positionné (x, y = point d'ancrage) qui entre puis sort entre a et b, avec flou de mouvement. */
export const Enter: React.FC<{
  t: number;
  a: number;
  b: number;
  x: number;
  y: number;
  w?: number;
  dir?: Dir;
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

/** Image détourée (PNG transparent) avec ombre au sol. */
export const Pic: React.FC<{name: string; h?: number; w?: number; shadow?: boolean; style?: React.CSSProperties}> = ({name, h, w, shadow = true, style}) => (
  <div style={{position: 'relative', ...style}}>
    {shadow && <div style={{position: 'absolute', left: '15%', right: '15%', bottom: -6, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(10px)'}} />}
    <Img src={staticFile(`${ASSETS}/${name}.png`)} style={{position: 'relative', height: h, width: w, display: 'block'}} />
  </div>
);

/** Carte « verre » sur fond sombre. */
export const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: 'rgba(20,14,50,0.85)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: 22, color: '#fff', fontFamily: TEXT, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', ...style}}>
    {children}
  </div>
);

/** Carte blanche (ticket, formulaire, e-mail). */
export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: '#fff', borderRadius: 26, color: C.ink, fontFamily: TEXT, boxShadow: '0 24px 60px rgba(0,0,0,0.45)', overflow: 'hidden', ...style}}>{children}</div>
);

/* ---------- Sous-titres (captions.json produit par align_captions.py) ---------- */

type Word = {w: string; s: number; e: number; gold: boolean};
const CHUNKS = captions as Word[][];
// 'caps' : capitales, mots clés en couleur (histoires, faits divers)
// 'karaoke' : casse normale, mots à venir floutés (récits, explications)
// 'pills' : chaque mot sur une pastille sombre soulignée (récits sur fond chargé)
const CAPTION_STYLE = 'caps' as 'caps' | 'karaoke' | 'pills';
const CAPTION_TOP = 1300; // entre 950 et 1330 : jamais plus bas (interface TikTok)
const LEAD = 0.2; // les mots s'affichent un peu avant d'être prononcés
const clean = (w: string) => w.replace(/[«»]/g, '').replace(/\s+/g, ' ').trim().replace(/[.,:;]+$/, '');

const Captions: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i][0].s - LEAD - 0.04) idx = i;
  if (idx < 0) return null;
  const chunk = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const lastE = chunk[chunk.length - 1].e;
  // Bloc gardé jusqu'au suivant si l'écart est court, sinon il s'efface 0,6 s après le dernier mot.
  const end = next && next[0].s - lastE < 0.8 ? next[0].s - LEAD - 0.04 : lastE + 0.6;
  if (t >= end) return null;
  return (
    <div style={{position: 'absolute', top: CAPTION_TOP, width: '100%', padding: '0 70px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 16px'}}>
      {chunk.map((w, i) => {
        const on = prog(t, w.s - LEAD, w.s - LEAD + 0.13, EASE_OUT);
        const caps = CAPTION_STYLE === 'caps';
        const base: React.CSSProperties = {
          fontFamily: DISPLAY,
          fontWeight: caps ? 900 : 800,
          fontSize: caps ? 58 : 54,
          lineHeight: 1.15,
          color: w.gold ? C.accent : C.text,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          textShadow: CAPTION_STYLE === 'pills' ? undefined : '0 4px 18px rgba(0,0,0,0.55)',
          textTransform: caps ? 'uppercase' : undefined,
        };
        const anim: React.CSSProperties =
          CAPTION_STYLE === 'karaoke'
            ? {opacity: 0.25 + 0.75 * on, filter: on < 1 ? `blur(${(1 - on) * 6}px)` : undefined}
            : {opacity: on, transform: `translateY(${(1 - on) * 10}px) scale(${1 + 0.08 * settle(t, w.s - LEAD, 0.3)})`, filter: on < 1 ? `blur(${(1 - on) * 6}px)` : undefined};
        const pill: React.CSSProperties =
          CAPTION_STYLE === 'pills' ? {background: 'rgba(14,12,20,0.72)', padding: '2px 12px 6px', borderRadius: 10, boxShadow: `inset 0 -5px 0 rgba(84,70,190,${0.35 + 0.65 * on})`} : {};
        return (
          <span key={i} style={{...base, ...pill, ...anim}}>
            {caps ? clean(w.w) : w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Effets sonores (banque générée par gen_sfx.py dans public/sfx/) ---------- */

// Avec une voix : volumes 0.15–0.3. Sans voix : 0.4–1. Le pic du son doit tomber sur l'événement.
const SOUNDS: {at: number; file: string; volume: number}[] = [
  // {at: 2.0, file: 'whoosh', volume: 0.2},
];

/* ---------- Composition ---------- */

export const Story = () => {
  const frame = useCurrentFrame();
  const t = frame / STORY_FPS;

  return (
    <AbsoluteFill style={{fontFamily: TEXT}}>
      <Background t={t} />

      {/* Scène 1 : 0 → 3 s (exemple, à remplacer) */}
      <Enter t={t} a={0.1} b={3} x={540} y={600} dir="pop">
        <Glass style={{padding: '24px 34px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 64}}>Titre</Glass>
      </Enter>

      <Captions t={t} />

      {AUDIO && <Html5Audio src={staticFile(AUDIO)} />}
      {SOUNDS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * STORY_FPS)} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

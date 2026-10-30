import React from 'react';
import {AbsoluteFill, interpolate, spring, Easing} from 'remotion';
import {BEATS, STARTS, stateAt, type CardId, type Speaker} from './script';

const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const DISPLAY = '"Inter Display", Inter, sans-serif';
const ORANGE = '#ef7d57';
const BLUE = '#4fb0ec';
const YELLOW = '#f7d046';
const INK = '#26272b';

const pop = (local: number, delay = 0, damping = 12) =>
  spring({frame: local - delay, fps: FPS, config: {damping, stiffness: 160}});

/* ---------- Tableau des scores ---------- */

const Digit: React.FC<{value: number; bump: number}> = ({value, bump}) => (
  <div
    style={{
      width: 84,
      height: 100,
      borderRadius: 14,
      background: INK,
      color: 'white',
      fontSize: 78,
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${1 + 0.35 * bump})`,
      boxShadow: 'inset 0 -6px 0 rgba(255,255,255,0.08)',
    }}
  >
    {value}
  </div>
);

const Scoreboard: React.FC<{frame: number; beatIndex: number}> = ({frame, beatIndex}) => {
  const {score, round, scoreChangedAt, team} = stateAt(beatIndex);
  const since = frame - scoreChangedAt;
  const bump = scoreChangedAt >= 0 ? Math.max(0, Math.sin(Math.min(since, 12) / 12 * Math.PI)) * (since < 12 ? 1 : 0) : 0;
  const changedSide = (() => {
    for (let k = beatIndex; k >= 0; k--) {
      if (BEATS[k].score) {
        const prev = stateAt(k - 1 < 0 ? 0 : k - 1).score;
        return BEATS[k].score![0] !== prev[0] ? 0 : 1;
      }
    }
    return -1;
  })();
  const teamStart = STARTS[BEATS.findIndex((b) => b.team)];
  const teamT = team ? pop(frame - teamStart, 0, 10) : 0;
  const intro = pop(frame, 4, 14);

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateY(${interpolate(intro, [0, 1], [-220, 0])}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: 124,
          width: 900,
          borderRadius: 26,
          border: `7px solid ${YELLOW}`,
          overflow: 'hidden',
          boxShadow: '0 10px 0 rgba(0,0,0,0.12)',
          fontFamily: DISPLAY,
        }}
      >
        <div style={{flex: 1, background: ORANGE, display: 'flex', alignItems: 'center', paddingLeft: 34}}>
          <span style={{fontSize: 62, fontWeight: 900, color: 'white', letterSpacing: 1, fontStyle: 'italic'}}>CLAUDE</span>
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 14px',
            background: `linear-gradient(90deg, ${ORANGE} 50%, ${BLUE} 50%)`,
          }}
        >
          <div style={{display: 'flex', gap: 14, alignItems: 'center', opacity: 1 - teamT, transform: `scale(${1 - 0.4 * teamT})`}}>
            <Digit value={score[0]} bump={changedSide === 0 ? bump : 0} />
            <div style={{width: 10, height: 10, borderRadius: 5, background: INK}} />
            <Digit value={score[1]} bump={changedSide === 1 ? bump : 0} />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 150,
              fontWeight: 900,
              color: YELLOW,
              textShadow: '0 4px 0 rgba(0,0,0,0.15)',
              transform: `scale(${teamT}) rotate(${(1 - teamT) * 90}deg)`,
            }}
          >
            +
          </div>
        </div>
        <div style={{flex: 1, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 40}}>
          <span style={{fontSize: 62, fontWeight: 900, color: 'white', letterSpacing: 1, fontStyle: 'italic'}}>CHAT</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: DISPLAY,
          fontSize: 34,
          fontWeight: 900,
          fontStyle: 'italic',
          color: YELLOW,
          WebkitTextStroke: `2px ${INK}`,
          letterSpacing: 1,
          opacity: round > 0 || team ? 1 : 0,
        }}
      >
        {team ? 'ÉQUIPE' : `MANCHE ${round}`}
      </div>
    </div>
  );
};

/* ---------- Sous-titres ---------- */

const SPEAKER_COLOR: Record<Speaker, string> = {host: '#ffffff', claude: ORANGE, chat: BLUE};
const SPEAKER_NAME: Record<Speaker, string> = {host: 'LE PATRON', claude: 'CLAUDE', chat: 'CHAT'};

const Caption: React.FC<{text: string; speaker: Speaker; local: number; top: number}> = ({text, speaker, local, top}) => {
  const p = pop(local, 2, 14);
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 3,
          color: speaker === 'host' ? INK : 'white',
          background: SPEAKER_COLOR[speaker],
          padding: '6px 16px',
          borderRadius: 10,
          opacity: p,
        }}
      >
        {SPEAKER_NAME[speaker]}
      </div>
      <div
        style={{
          maxWidth: 900,
          padding: '16px 30px',
          borderRadius: 18,
          background: 'rgba(38,40,48,0.82)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          fontSize: 50,
          fontWeight: 500,
          textAlign: 'center',
          lineHeight: 1.25,
          transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
          opacity: p,
        }}
      >
        {words.map((w, i) => {
          const o = interpolate(local, [3 + i * 3, 7 + i * 3], [0, 1], clamp);
          return (
            <span key={i} style={{opacity: o}}>
              {w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Annonce de manche ---------- */

const RoundBurst: React.FC<{n: number; local: number; dur: number}> = ({n, local, dur}) => {
  const p = pop(local, 0, 9);
  const out = interpolate(local, [dur - 8, dur], [1, 0], clamp);
  const rays = `repeating-conic-gradient(from ${local * 2}deg at 50% 46%, rgba(232,69,139,0.85) 0deg 9deg, rgba(0,0,0,0) 9deg 18deg, rgba(247,208,70,0.9) 18deg 27deg, rgba(0,0,0,0) 27deg 36deg)`;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill
        style={{
          background: rays,
          WebkitMaskImage: 'radial-gradient(circle at 50% 46%, transparent 8%, black 22%, black 60%, transparent 85%)',
          transform: `scale(${interpolate(p, [0, 1], [0.4, 1.15])})`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 120}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 190,
            fontWeight: 900,
            fontStyle: 'italic',
            color: YELLOW,
            WebkitTextStroke: `10px ${INK}`,
            paintOrder: 'stroke fill',
            textShadow: '0 14px 0 rgba(0,0,0,0.25)',
            transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(-6deg)`,
            opacity: Math.min(1, p * 2),
            whiteSpace: 'nowrap',
          }}
        >
          MANCHE {n}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Confettis ---------- */

const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Confetti: React.FC<{local: number}> = ({local}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: 70}, (_, i) => {
      const x = rand(i) * 1080;
      const speed = 14 + rand(i + 99) * 14;
      const y = -60 + (local - rand(i + 7) * 12) * speed;
      const rot = local * (6 + rand(i + 3) * 12);
      const colors = [ORANGE, BLUE, YELLOW, '#e8458b', '#ffffff', '#7bd389'];
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + Math.sin(local * 0.15 + i) * 30,
            top: y,
            width: 18,
            height: 30,
            borderRadius: 4,
            background: colors[i % colors.length],
            transform: `rotate(${rot}deg) scaleX(${Math.cos(local * 0.3 + i)})`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/* ---------- Cartes ---------- */

const Card: React.FC<{local: number; border: string; bg?: string; children: React.ReactNode}> = ({local, border, bg = '#ffffff', children}) => {
  const p = pop(local, 2, 13);
  return (
    <div
      style={{
        position: 'absolute',
        top: 330,
        left: 70,
        width: 940,
        borderRadius: 30,
        background: bg,
        border: `8px solid ${border}`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{title: string; color: string; dark?: boolean}> = ({title, color, dark}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '22px 30px',
      background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
      fontFamily: 'Inter, sans-serif',
      fontSize: 32,
      fontWeight: 700,
      color: dark ? 'white' : INK,
    }}
  >
    <div style={{width: 26, height: 26, borderRadius: 7, background: color}} />
    {title}
  </div>
);

const typed = (text: string, local: number, start: number, cps = 1.4) => text.slice(0, Math.max(0, Math.floor((local - start) * cps)));

const Cursor: React.FC<{local: number}> = ({local}) => (
  <span style={{opacity: Math.floor(local / 8) % 2 ? 0 : 1}}>|</span>
);

const ChatBugCard: React.FC<{local: number}> = ({local}) => {
  const msg = 'Essaie de vider le cache et de redémarrer le serveur.';
  return (
    <Card local={local} border={BLUE}>
      <CardHeader title="Réponse de Chat" color={BLUE} />
      <div style={{padding: '30px 34px 40px', fontFamily: 'Inter, sans-serif', fontSize: 44, lineHeight: 1.35, color: INK, minHeight: 200}}>
        {typed(msg, local, 10)}
        <Cursor local={local} />
      </div>
    </Card>
  );
};

const Mono: React.FC<{children: React.ReactNode; color?: string; bg?: string; o?: number}> = ({children, color = '#e5e7eb', bg, o = 1}) => (
  <div
    style={{
      fontFamily: '"DejaVu Sans Mono", monospace',
      fontSize: 31,
      color,
      background: bg,
      padding: '8px 30px',
      opacity: o,
      whiteSpace: 'pre',
    }}
  >
    {children}
  </div>
);

const ClaudeBugCard: React.FC<{local: number}> = ({local}) => {
  const line = (d: number) => interpolate(local, [d, d + 6], [0, 1], clamp);
  return (
    <Card local={local} border={ORANGE} bg="#1d1f27">
      <CardHeader title="Réponse de Claude" color={ORANGE} dark />
      <div style={{padding: '20px 0 30px'}}>
        <Mono color="#9ca3af" o={line(10)}>panier.js · ligne 42</Mono>
        <Mono color="#fca5a5" bg="rgba(239,68,68,0.16)" o={line(22)}>{'- if (panier.articles.length) {'}</Mono>
        <Mono color="#86efac" bg="rgba(34,197,94,0.16)" o={line(36)}>{'+ if (panier?.articles?.length) {'}</Mono>
        <div style={{display: 'flex', gap: 14, padding: '22px 30px 0', opacity: line(52)}}>
          {['panier vide → crash', 'corrigé ✓'].map((t, i) => (
            <div
              key={t}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 28,
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 12,
                background: i ? 'rgba(34,197,94,0.2)' : 'rgba(239,125,87,0.2)',
                color: i ? '#86efac' : '#fdba9a',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const TESTS = ['panier vide', 'paiement refusé', 'code promo expiré', 'stock à zéro', 'adresse invalide'];

const TestsCard: React.FC<{local: number}> = ({local}) => {
  const progress = interpolate(local, [14, 70], [0, 24], {...clamp, easing: Easing.out(Easing.quad)});
  return (
    <Card local={local} border={ORANGE} bg="#1d1f27">
      <CardHeader title="Terminal" color={ORANGE} dark />
      <div style={{padding: '18px 0 28px'}}>
        <Mono color="#9ca3af">{`$ ${typed('npm test', local, 6, 0.8)}`}</Mono>
        {TESTS.map((t, i) => {
          const o = interpolate(local, [18 + i * 9, 22 + i * 9], [0, 1], clamp);
          return (
            <Mono key={t} o={o}>
              <span style={{color: '#86efac'}}>✓</span> {t}
            </Mono>
          );
        })}
        <div style={{margin: '18px 30px 0', height: 16, borderRadius: 8, background: '#2d313d', overflow: 'hidden'}}>
          <div style={{width: `${(progress / 24) * 100}%`, height: '100%', background: '#22c55e'}} />
        </div>
        <Mono color="#86efac">{`${Math.round(progress)} / 24 tests passés`}</Mono>
      </div>
    </Card>
  );
};

const PoemCard: React.FC<{local: number}> = ({local}) => {
  const poem = 'Dans la boucle du soir,\nla variable s’endort.\nUn tableau la rappelle,\net le code repart encore.';
  return (
    <Card local={local} border="#e8458b" bg="linear-gradient(180deg, #2a1f5c 0%, #6b2d7d 70%, #d9488f 100%)">
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 60,
          width: 110,
          height: 110,
          borderRadius: 55,
          background: '#fff3c4',
          boxShadow: '0 0 60px rgba(255,243,196,0.8)',
        }}
      />
      <div
        style={{
          position: 'relative',
          padding: '50px 46px 60px',
          fontFamily: '"DejaVu Serif", serif',
          fontStyle: 'italic',
          fontSize: 50,
          lineHeight: 1.45,
          color: 'white',
          whiteSpace: 'pre-line',
          minHeight: 340,
        }}
      >
        {typed(poem, local, 8, 1.6)}
        <Cursor local={local} />
      </div>
    </Card>
  );
};

const Mini: React.FC<{who: 'claude' | 'chat'}> = ({who}) => (
  <div
    style={{
      width: 120,
      height: who === 'claude' ? 90 : 120,
      borderRadius: who === 'claude' ? 12 : 60,
      background: who === 'claude' ? ORANGE : '#f2f2f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 26,
    }}
  >
    <div style={{width: 13, height: 22, background: INK, borderRadius: 2}} />
    <div style={{width: 13, height: 22, background: INK, borderRadius: 2}} />
  </div>
);

const TeamCard: React.FC<{local: number}> = ({local}) => {
  const a = pop(local, 14);
  const b = pop(local, 26);
  return (
    <Card local={local} border={YELLOW} bg="#1d1f27">
      <div style={{textAlign: 'center', padding: '30px 0 10px', fontFamily: DISPLAY, fontSize: 56, fontWeight: 900, fontStyle: 'italic', color: YELLOW}}>
        LES DEUX
      </div>
      <div style={{display: 'flex', justifyContent: 'space-around', padding: '20px 30px 44px'}}>
        {[
          {who: 'claude' as const, label: 'CODER', color: ORANGE, p: a},
          {who: 'chat' as const, label: 'EXPLIQUER', color: BLUE, p: b},
        ].map((c) => (
          <div
            key={c.who}
            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: c.p, transform: `translateY(${(1 - c.p) * 40}px)`}}
          >
            <div style={{height: 120, display: 'flex', alignItems: 'center'}}>
              <Mini who={c.who} />
            </div>
            <div style={{fontFamily: DISPLAY, fontSize: 46, fontWeight: 900, color: c.color, letterSpacing: 1}}>{c.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CARDS: Record<CardId, React.FC<{local: number}>> = {
  chatBug: ChatBugCard,
  claudeBug: ClaudeBugCard,
  tests: TestsCard,
  poem: PoemCard,
  team: TeamCard,
};

/* ---------- Assemblage ---------- */

export const Overlay: React.FC<{frame: number; beatIndex: number; local: number}> = ({frame, beatIndex, local}) => {
  const beat = BEATS[beatIndex];
  const CardComp = beat.card ? CARDS[beat.card] : null;
  const fadeOut = interpolate(local, [beat.dur - 5, beat.dur], [1, 0], clamp);
  return (
    <AbsoluteFill>
      {beat.celebrate && <Confetti local={local} />}
      <Scoreboard frame={frame} beatIndex={beatIndex} />
      {CardComp && (
        <div style={{opacity: fadeOut}}>
          <CardComp local={local} />
        </div>
      )}
      {beat.caption && beat.speaker && (
        <div style={{opacity: fadeOut}}>
          <Caption text={beat.caption} speaker={beat.speaker} local={local} top={CardComp ? 1440 : 330} />
        </div>
      )}
      {beat.burst && <RoundBurst n={beat.burst} local={local} dur={beat.dur} />}
    </AbsoluteFill>
  );
};

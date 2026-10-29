import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, DUEL_FRAMES, STARTS, beatAt, stateAt, type Shot} from './script';
import {Stage3D, type CamPose} from './Stage3D';
import {Overlay} from './Overlay';

export {DUEL_FRAMES};

const SHOTS: Record<Shot, CamPose> = {
  wide: {pos: [0, 2.6, 10.6], look: [0, 2.15, 0]},
  host: {pos: [0, 2.75, 4.0], look: [0, 2.45, 0]},
  claude: {pos: [-1.25, 1.8, 4.6], look: [-1.6, 1.45, 1.2]},
  chat: {pos: [1.25, 2.05, 4.6], look: [1.6, 1.7, 1.2]},
  claudeCard: {pos: [-1.25, 1.62, 4.8], look: [-1.6, 1.35, 1.2]},
  chatCard: {pos: [1.25, 1.87, 4.8], look: [1.6, 1.62, 1.2]},
  wideCard: {pos: [0, 3.2, 10.8], look: [0, 2.95, 0]},
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];

const cameraAt = (frame: number): CamPose => {
  const {i, beat, local} = beatAt(frame);
  const to = SHOTS[beat.shot];
  const from = i > 0 ? SHOTS[BEATS[i - 1].shot] : to;
  const t = interpolate(local, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const pos = mix(from.pos, to.pos, t);
  const look = mix(from.look, to.look, t);
  // Léger travelling avant pendant le plan.
  const push = 0.04 * (local / beat.dur);
  return {pos: mix(pos, look, push), look};
};

/* ---------- Effets sonores ---------- */

type Sfx = {at: number; file: string; volume?: number};

const SOUNDS: Sfx[] = BEATS.flatMap((b, i): Sfx[] => {
  const s = STARTS[i];
  const out: Sfx[] = [];
  if (i > 0 && b.shot !== BEATS[i - 1].shot && !b.burst) out.push({at: s, file: 'whoosh', volume: 0.35});
  if (b.burst) out.push({at: s, file: 'impact', volume: 0.8}, {at: s + 2, file: 'whoosh', volume: 0.6});
  if (b.card) out.push({at: s + 4, file: 'pop', volume: 0.9});
  if (b.score) out.push({at: s + 6, file: 'kaching', volume: 0.8});
  if (b.card === 'team') out.push({at: s + 30, file: 'notif', volume: 0.8});
  return out;
});

export const LeDuel = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {i, beat, local} = beatAt(frame);
  const st = stateAt(i);
  const gestureT = interpolate(local, [3, 13, beat.dur - 8, beat.dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill>
      <Stage3D
        width={width}
        height={height}
        frame={frame}
        cam={cameraAt(frame)}
        talking={beat.speaker}
        gesture={beat.gesture}
        gestureT={gestureT}
        celebrate={beat.celebrate ? 1 : 0}
        team={st.team}
      />
      <Overlay frame={frame} beatIndex={i} local={local} />
      {SOUNDS.map((s, k) => (
        <Sequence key={k} from={s.at} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

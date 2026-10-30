// Scénario du "Duel" : chaque beat = un plan, qui parle, ce qui est dit, ce qui s'affiche.

export type Speaker = 'host' | 'claude' | 'chat';
export type Shot = 'wide' | 'host' | 'claude' | 'chat' | 'claudeCard' | 'chatCard' | 'wideCard';
export type CardId = 'chatBug' | 'claudeBug' | 'tests' | 'poem' | 'team';
export type Gesture = 'pointLeft' | 'pointRight' | 'think' | 'shrug';

export type Beat = {
  dur: number;
  shot: Shot;
  speaker?: Speaker;
  caption?: string;
  card?: CardId;
  burst?: number; // numéro de manche à annoncer
  gesture?: Gesture;
  score?: [number, number]; // nouveau score à partir de ce beat
  round?: number;
  team?: boolean;
  celebrate?: boolean;
};

export const BEATS: Beat[] = [
  {dur: 60, shot: 'wide', speaker: 'host', caption: 'Un seul poste de dev.'},
  {dur: 40, shot: 'claude', speaker: 'host', caption: 'Claude…'},
  {dur: 40, shot: 'chat', speaker: 'host', caption: '…et Chat.'},
  {dur: 45, shot: 'host', speaker: 'host', caption: '3 manches.'},

  {dur: 40, shot: 'host', burst: 1, round: 1},
  {dur: 75, shot: 'host', speaker: 'host', caption: 'Le site plante en prod. Trouvez le bug.', gesture: 'shrug'},
  {dur: 85, shot: 'chatCard', speaker: 'chat', caption: 'Facile.', card: 'chatBug'},
  {dur: 40, shot: 'host', speaker: 'host', caption: 'Hmm… non.', gesture: 'think'},
  {dur: 95, shot: 'claudeCard', speaker: 'claude', caption: 'Ligne 42. Panier vide, ça plante.', card: 'claudeBug'},
  {dur: 50, shot: 'wide', speaker: 'host', caption: 'Point Claude !', gesture: 'pointLeft', score: [1, 0], celebrate: true},

  {dur: 40, shot: 'host', burst: 2, round: 2},
  {dur: 60, shot: 'host', speaker: 'host', caption: 'Il me faut des tests. Vite.'},
  {dur: 95, shot: 'claudeCard', speaker: 'claude', caption: '24 tests. Tous verts.', card: 'tests'},
  {dur: 50, shot: 'wide', speaker: 'host', caption: '2 à 0.', gesture: 'pointLeft', score: [2, 0], celebrate: true},

  {dur: 40, shot: 'host', burst: 3, round: 3},
  {dur: 75, shot: 'host', speaker: 'host', caption: 'Explique le code au stagiaire… en rimes.'},
  {dur: 95, shot: 'chatCard', speaker: 'chat', caption: 'Avec plaisir !', card: 'poem'},
  {dur: 50, shot: 'wide', speaker: 'host', caption: 'Un point Chat.', gesture: 'pointRight', score: [2, 1], celebrate: true},

  {dur: 70, shot: 'host', speaker: 'host', caption: 'Bon… vous partagez le bureau ?', gesture: 'shrug', team: true},
  {dur: 100, shot: 'wideCard', speaker: 'host', caption: 'Lui pour coder. Lui pour expliquer.', card: 'team', team: true, celebrate: true},
];

export const STARTS = BEATS.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + BEATS[i - 1].dur], []);
export const DUEL_FRAMES = BEATS.reduce((s, b) => s + b.dur, 0);

export const beatAt = (frame: number) => {
  const i = Math.max(0, STARTS.findLastIndex((s) => frame >= s));
  return {i, beat: BEATS[i], local: frame - STARTS[i]};
};

// État "persistant" (score, manche, mode équipe) au beat i.
export const stateAt = (i: number) => {
  let score: [number, number] = [0, 0];
  let round = 0;
  let scoreChangedAt = -1;
  for (let k = 0; k <= i; k++) {
    if (BEATS[k].score) {
      score = BEATS[k].score!;
      scoreChangedAt = STARTS[k];
    }
    if (BEATS[k].round) round = BEATS[k].round!;
  }
  return {score, round, scoreChangedAt, team: !!BEATS[i].team};
};

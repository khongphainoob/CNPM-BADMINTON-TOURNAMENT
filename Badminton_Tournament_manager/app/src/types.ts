export type Player = {
  id: string;
  name: string;
};

export type SetScore = {
  p1: number;
  p2: number;
  winner: 'p1' | 'p2';
};

export type MatchPhase = 'pre' | 'scoring' | 'set-end' | 'match-end';

export type HistoryEntry = {
  scorer: 'p1' | 'p2';
  prevScore: { p1: number; p2: number };
  prevServing: 'p1' | 'p2';
  causedSetEnd: boolean;
};

export type MatchState = {
  phase: MatchPhase;
  court: string;
  tournament: string;
  p1: Player;
  p2: Player;
  serving: 'p1' | 'p2';
  currentSet: { p1: number; p2: number };
  completedSets: SetScore[];
  setsWon: { p1: number; p2: number };
  history: HistoryEntry[];
  undoVisible: boolean;
  elapsedSeconds: number;
};

export type Role = 'spectator' | 'referee' | 'btc' | 'athlete' | 'admin';

export type LiveMatchStatus = 'live' | 'upcoming' | 'completed';

export type LiveMatchData = {
  id: string;
  court: string;
  category: string;
  p1: { name: string };
  p2: { name: string };
  currentScore: { p1: number; p2: number };
  completedSets: Array<{ p1: number; p2: number; winner: 'p1' | 'p2' }>;
  setsWon: { p1: number; p2: number };
  serving: 'p1' | 'p2';
  elapsedSeconds: number;
  status: LiveMatchStatus;
  scheduledTime?: string;
};

export type TournamentInfo = {
  name: string;
  subtitle: string;
  date: string;
  venue: string;
};

export type MatchAction =
  | { type: 'START_MATCH'; serving: 'p1' | 'p2' }
  | { type: 'SCORE'; player: 'p1' | 'p2' }
  | { type: 'UNDO' }
  | { type: 'HIDE_UNDO' }
  | { type: 'CONFIRM_NEXT_SET'; serving: 'p1' | 'p2' }
  | { type: 'TICK' }
  | { type: 'RESET' };

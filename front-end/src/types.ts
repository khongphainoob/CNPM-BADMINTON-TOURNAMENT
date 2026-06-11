export type Player = {
  id: string;
  name: string;
};

export type SideId = 'A' | 'B';
export type PlayerIdx = 0 | 1;
export type CourtSide = 'right' | 'left';
export type ResultType = 'normal' | 'walkover' | 'disqualification';

export type GameScore = { A: number; B: number; winner: SideId };

export type Side = {
  players: Player[];      // 1 = singles, 2 = doubles
  rightIndex: PlayerIdx;  // which player index currently stands in the right service court
};

export type MatchPhase = 'pre' | 'scoring' | 'interval' | 'game-end' | 'match-end';

export type MatchState = {
  phase: MatchPhase;
  isDoubles: boolean;
  pointsPerSet: number;   // race target (e.g. 21); win by 2; cap at pointsPerSet + 9
  gamesToWin: number;     // games needed to win the match (ceil(maxSets/2))
  court: string;
  tournament: string;
  category: string;
  sides: { A: Side; B: Side };
  servingSide: SideId;
  currentGame: { A: number; B: number };
  completedGames: GameScore[];
  gamesWon: { A: number; B: number };
  intervalTaken: boolean;                          // mid-game interval already used this game
  interval: { kind: 'mid'; secondsLeft: number } | null;
  displaySwap: boolean;                            // change-of-ends: swap on-screen top/bottom
  result: { type: ResultType; winner: SideId; note?: string } | null;
  history: Snapshot[];                             // for multi-step undo (within the current game)
  elapsedSeconds: number;
};

// A point-in-time snapshot used to reverse a rally (everything except the timer + history itself).
export type Snapshot = Omit<MatchState, 'history' | 'elapsedSeconds'>;

export type MatchAction =
  | { type: 'SETUP_GAME'; servingSide: SideId; serverIdx: PlayerIdx; receiverIdx: PlayerIdx }
  | { type: 'SCORE'; side: SideId }
  | { type: 'UNDO' }
  | { type: 'END_INTERVAL' }
  | { type: 'END_ABNORMAL'; resultType: 'walkover' | 'disqualification'; winner: SideId; note?: string }
  | { type: 'TICK' }
  | { type: 'RESET' };

export type Role = 'spectator' | 'referee' | 'btc' | 'athlete' | 'admin';

export type LiveMatchStatus = 'live' | 'upcoming' | 'completed';

export type TournamentInfo = {
  name: string;
  subtitle: string;
  date: string;
  venue: string;
};

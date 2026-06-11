import { useReducer, useEffect, useRef } from 'react';
import type {
  MatchState, MatchAction, Snapshot, SideId, PlayerIdx, CourtSide, GameScore,
} from '../types';

// ── Rules helpers (pure) ─────────────────────────────────────────────────────

export function gameCap(pointsPerSet: number): number {
  return pointsPerSet + 9; // 21→30, 15→24, 11→20
}

export function isGameOver(scorer: number, other: number, pointsPerSet: number): boolean {
  if (scorer >= gameCap(pointsPerSet)) return true;
  return scorer >= pointsPerSet && scorer - other >= 2;
}

// First point at which the once-per-game interval triggers (21→11, 15→8, 11→6).
function intervalPoint(pointsPerSet: number): number {
  return Math.floor(pointsPerSet / 2) + 1;
}

const other = (s: SideId): SideId => (s === 'A' ? 'B' : 'A');

// Derive who serves/receives and from which service court, purely from the score + positions.
export function getServeInfo(state: MatchState) {
  const recv = other(state.servingSide);
  const serviceCourt: CourtSide = state.currentGame[state.servingSide] % 2 === 0 ? 'right' : 'left';
  const srv = state.sides[state.servingSide];
  const rcv = state.sides[recv];
  const serverIdx = (serviceCourt === 'right' ? srv.rightIndex : (1 - srv.rightIndex)) as PlayerIdx;
  const receiverIdx = (serviceCourt === 'right' ? rcv.rightIndex : (1 - rcv.rightIndex)) as PlayerIdx;
  return { servingSide: state.servingSide, receivingSide: recv, serviceCourt, serverIdx, receiverIdx };
}

// Which side (if any) is one point from winning the current game.
export function gamePointSide(state: MatchState): SideId | null {
  const { A, B } = state.currentGame;
  const p = state.pointsPerSet;
  if (isGameOver(A + 1, B, p)) return 'A';
  if (isGameOver(B + 1, A, p)) return 'B';
  return null;
}

export function isMatchPoint(state: MatchState): SideId | null {
  const gp = gamePointSide(state);
  if (!gp) return null;
  return state.gamesWon[gp] === state.gamesToWin - 1 ? gp : null;
}

export function isDeuce(state: MatchState): boolean {
  const { A, B } = state.currentGame;
  const p = state.pointsPerSet;
  return A >= p - 1 && B >= p - 1 && A < gameCap(p) && B < gameCap(p);
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function snapshot(s: MatchState): Snapshot {
  const { history: _h, elapsedSeconds: _e, ...rest } = s;
  return rest;
}

function reducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'SETUP_GAME': {
      const { servingSide, serverIdx, receiverIdx } = action;
      const recv = other(servingSide);
      const isLaterGame = state.completedGames.length > 0;
      return {
        ...state,
        servingSide,
        sides: {
          ...state.sides,
          [servingSide]: { ...state.sides[servingSide], rightIndex: serverIdx },
          [recv]: { ...state.sides[recv], rightIndex: receiverIdx },
        },
        currentGame: { A: 0, B: 0 },
        intervalTaken: false,
        interval: null,
        phase: 'scoring',
        // Change ends between games (not before game 1).
        displaySwap: isLaterGame ? !state.displaySwap : state.displaySwap,
        history: [],
      };
    }

    case 'SCORE': {
      if (state.phase !== 'scoring') return state;
      const X = action.side;
      const snap = snapshot(state);

      let servingSide = state.servingSide;
      let sides = state.sides;
      if (X === state.servingSide) {
        // Serving side keeps serve; in doubles its two players swap courts.
        if (state.isDoubles) {
          const s = sides[X];
          sides = { ...sides, [X]: { ...s, rightIndex: (1 - s.rightIndex) as PlayerIdx } };
        }
      } else {
        // Receiving side wins → it gains serve; no positional swap.
        servingSide = X;
      }

      const currentGame = { ...state.currentGame, [X]: state.currentGame[X] + 1 };
      const sX = currentGame[X];
      const sO = currentGame[other(X)];
      const next: MatchState = { ...state, servingSide, sides, currentGame, history: [...state.history, snap] };

      if (isGameOver(sX, sO, state.pointsPerSet)) {
        const completed: GameScore = { A: currentGame.A, B: currentGame.B, winner: X };
        const completedGames = [...state.completedGames, completed];
        const gamesWon = { ...state.gamesWon, [X]: state.gamesWon[X] + 1 };
        if (gamesWon[X] >= state.gamesToWin) {
          return { ...next, completedGames, gamesWon, phase: 'match-end', result: { type: 'normal', winner: X } };
        }
        return { ...next, completedGames, gamesWon, phase: 'game-end' };
      }

      // Once-per-game interval when the leader first reaches the interval point.
      if (!state.intervalTaken && Math.max(sX, sO) === intervalPoint(state.pointsPerSet)) {
        const isDecider =
          state.gamesWon.A === state.gamesToWin - 1 && state.gamesWon.B === state.gamesToWin - 1;
        return {
          ...next,
          intervalTaken: true,
          interval: { kind: 'mid', secondsLeft: 60 },
          phase: 'interval',
          // Deciding game: change ends at the interval.
          displaySwap: isDecider ? !state.displaySwap : state.displaySwap,
        };
      }

      return next;
    }

    case 'END_INTERVAL':
      return { ...state, phase: 'scoring', interval: null };

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const snap = state.history[state.history.length - 1];
      return { ...state, ...snap, history: state.history.slice(0, -1) };
    }

    case 'END_ABNORMAL':
      return {
        ...state,
        phase: 'match-end',
        result: { type: action.resultType, winner: action.winner, note: action.note },
      };

    case 'TICK': {
      let { interval, phase } = state;
      if (phase === 'interval' && interval) {
        const secondsLeft = interval.secondsLeft - 1;
        if (secondsLeft <= 0) { interval = null; phase = 'scoring'; }
        else interval = { ...interval, secondsLeft };
      }
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1, interval, phase };
    }

    case 'RESET':
      return {
        ...state,
        phase: 'pre',
        currentGame: { A: 0, B: 0 },
        completedGames: [],
        gamesWon: { A: 0, B: 0 },
        intervalTaken: false,
        interval: null,
        displaySwap: false,
        result: null,
        history: [],
      };

    default:
      return state;
  }
}

// ── Initial state from API match data ────────────────────────────────────────

function buildInitial(matchData?: any): MatchState {
  const base: MatchState = {
    phase: 'pre',
    isDoubles: false,
    pointsPerSet: 21,
    gamesToWin: 2,
    court: '—',
    tournament: 'Giải đấu',
    category: '',
    sides: {
      A: { players: [{ id: '', name: 'VĐV A' }], rightIndex: 0 },
      B: { players: [{ id: '', name: 'VĐV B' }], rightIndex: 0 },
    },
    servingSide: 'A',
    currentGame: { A: 0, B: 0 },
    completedGames: [],
    gamesWon: { A: 0, B: 0 },
    intervalTaken: false,
    interval: null,
    displaySwap: false,
    result: null,
    history: [],
    elapsedSeconds: 0,
  };
  if (!matchData) return base;

  const toPlayers = (side: 'A' | 'B') =>
    (matchData.participants || [])
      .filter((p: any) => p.side === side)
      .map((p: any) => ({ id: String(p.player?.id ?? ''), name: p.player?.name || 'VĐV' }));

  const partsA = toPlayers('A');
  const partsB = toPlayers('B');
  const cat = matchData.category_code || '';
  const flagged = matchData.is_doubles ?? ['MD', 'WD', 'XD'].includes(cat);
  const isDoubles = !!flagged && partsA.length >= 2 && partsB.length >= 2;
  const maxSets = Number(matchData.max_sets) || 3;

  return {
    ...base,
    isDoubles,
    pointsPerSet: Number(matchData.points_per_set) || 21,
    gamesToWin: Math.ceil(maxSets / 2),
    court: String(matchData.court_label || matchData.court || '—'),
    tournament: matchData.event_label || matchData.tournament_name || 'Giải đấu',
    category: cat,
    sides: {
      A: { players: partsA.length ? partsA : base.sides.A.players, rightIndex: 0 },
      B: { players: partsB.length ? partsB : base.sides.B.players, rightIndex: 0 },
    },
  };
}

// ── Hook (with backend persistence + offline queue) ──────────────────────────

export function useMatch(matchData?: any) {
  const [state, dispatchRaw] = useReducer(reducer, matchData, buildInitial);
  const startedRef = useRef(false);

  const dispatch = (action: MatchAction) => {
    const nextState = reducer(state, action);
    dispatchRaw(action);

    if (!matchData) return;
    const matchId = matchData.id;

    import('../data/api').then(({ competitionApi }) => {
      const pushToQueue = (req: any) => {
        const queue = JSON.parse(localStorage.getItem('referee_sync_queue') || '[]');
        queue.push({ ...req, timestamp: new Date().toISOString() });
        localStorage.setItem('referee_sync_queue', JSON.stringify(queue));
        window.dispatchEvent(new Event('sync_queue_updated'));
      };
      const safeCall = async (req: any, apiCall: () => Promise<any>) => {
        if (!navigator.onLine) { pushToQueue(req); return; }
        try { await apiCall(); } catch { pushToQueue(req); }
      };

      const run = async () => {
        // First game setup → start the match once.
        if (action.type === 'SETUP_GAME' && state.phase === 'pre' && !startedRef.current) {
          startedRef.current = true;
          await safeCall({ type: 'START_MATCH', matchId }, () => competitionApi.startMatch(matchId));
          return;
        }

        if (action.type === 'UNDO') {
          await safeCall({ type: 'UNDO', matchId }, () => competitionApi.undoScore(matchId));
          return;
        }

        if (action.type === 'END_ABNORMAL') {
          await safeCall(
            { type: 'RESULT', matchId, payload: { resultType: action.resultType, winnerSide: action.winner, note: action.note } },
            () => competitionApi.setResult(matchId, { resultType: action.resultType, winnerSide: action.winner, note: action.note }),
          );
          return;
        }

        if (action.type === 'SCORE') {
          const setNo = state.completedGames.length + 1;
          const scoreEvent = {
            setNo,
            scorer: action.side,
            prevScoreA: state.currentGame.A,
            prevScoreB: state.currentGame.B,
            prevServing: state.servingSide,
            causedSetEnd: nextState.completedGames.length > state.completedGames.length,
          };
          await safeCall({ type: 'SCORE', matchId, payload: scoreEvent }, () => competitionApi.addScoreEvent(matchId, scoreEvent));

          // A game just finished → persist its final score.
          if (nextState.completedGames.length > state.completedGames.length) {
            const g = nextState.completedGames[nextState.completedGames.length - 1];
            const setPayload = { setNo: nextState.completedGames.length, scoreA: g.A, scoreB: g.B };
            await safeCall({ type: 'SET', matchId, payload: setPayload }, () => competitionApi.addSetScore(matchId, setPayload));
          }

          // Match finished normally → complete it.
          if (nextState.phase === 'match-end' && nextState.result?.type === 'normal') {
            await safeCall({ type: 'COMPLETE', matchId }, () => competitionApi.completeMatch(matchId));
          }
        }
      };

      run();
    });
  };

  // Match clock — runs while scoring or during an interval.
  useEffect(() => {
    if (state.phase !== 'scoring' && state.phase !== 'interval') return;
    const id = setInterval(() => dispatchRaw({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  return { state, dispatch };
}

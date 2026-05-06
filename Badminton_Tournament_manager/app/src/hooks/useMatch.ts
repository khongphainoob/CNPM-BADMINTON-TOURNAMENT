import { useReducer, useEffect, useRef } from 'react';
import type { MatchState, MatchAction, HistoryEntry, SetScore } from '../types';
import { INITIAL_MATCH } from '../data/mock';

const SETS_TO_WIN = 2;
const POINTS_TO_WIN = 21;
const DEUCE_CAP = 30;

function isSetOver(p1: number, p2: number): boolean {
  if (p1 >= DEUCE_CAP || p2 >= DEUCE_CAP) return true;
  if (p1 >= POINTS_TO_WIN && p1 - p2 >= 2) return true;
  if (p2 >= POINTS_TO_WIN && p2 - p1 >= 2) return true;
  return false;
}

export function isGamePoint(p1: number, p2: number): 'p1' | 'p2' | null {
  if (isSetOver(p1 + 1, p2)) return 'p1';
  if (isSetOver(p1, p2 + 1)) return 'p2';
  return null;
}

const initialState: MatchState = {
  phase: 'pre',
  ...INITIAL_MATCH,
  serving: 'p1',
  currentSet: { p1: 0, p2: 0 },
  completedSets: [],
  setsWon: { p1: 0, p2: 0 },
  history: [],
  undoVisible: false,
  elapsedSeconds: 0,
};

function reducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'START_MATCH':
      return { ...state, phase: 'scoring', serving: action.serving };

    case 'SCORE': {
      const scorer = action.player;
      const entry: HistoryEntry = {
        scorer,
        prevScore: { ...state.currentSet },
        prevServing: state.serving,
        causedSetEnd: false,
      };

      const newScore = {
        p1: state.currentSet.p1 + (scorer === 'p1' ? 1 : 0),
        p2: state.currentSet.p2 + (scorer === 'p2' ? 1 : 0),
      };

      if (isSetOver(newScore.p1, newScore.p2)) {
        const winner: 'p1' | 'p2' = newScore.p1 > newScore.p2 ? 'p1' : 'p2';
        const setResult: SetScore = { ...newScore, winner };
        const newSetsWon = { ...state.setsWon, [winner]: state.setsWon[winner] + 1 };
        const phase = newSetsWon[winner] >= SETS_TO_WIN ? 'match-end' : 'set-end';
        return {
          ...state,
          phase,
          currentSet: newScore,
          completedSets: [...state.completedSets, setResult],
          setsWon: newSetsWon,
          serving: scorer,
          history: [...state.history, { ...entry, causedSetEnd: true }],
          undoVisible: true,
        };
      }

      return {
        ...state,
        currentSet: newScore,
        serving: scorer,
        history: [...state.history, entry],
        undoVisible: true,
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      if (last.causedSetEnd) {
        const completedSets = state.completedSets.slice(0, -1);
        return {
          ...state,
          phase: 'scoring',
          currentSet: last.prevScore,
          completedSets,
          setsWon: {
            p1: completedSets.filter(s => s.winner === 'p1').length,
            p2: completedSets.filter(s => s.winner === 'p2').length,
          },
          serving: last.prevServing,
          history: newHistory,
          undoVisible: false,
        };
      }

      return {
        ...state,
        currentSet: last.prevScore,
        serving: last.prevServing,
        history: newHistory,
        undoVisible: false,
      };
    }

    case 'HIDE_UNDO':
      return { ...state, undoVisible: false };

    case 'CONFIRM_NEXT_SET':
      return {
        ...state,
        phase: 'scoring',
        currentSet: { p1: 0, p2: 0 },
        serving: action.serving,
        undoVisible: false,
      };

    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useMatch() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (state.undoVisible) {
      clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => dispatch({ type: 'HIDE_UNDO' }), 8000);
    }
    return () => clearTimeout(undoTimer.current);
  }, [state.undoVisible, state.history.length]);

  useEffect(() => {
    if (state.phase !== 'scoring') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  return { state, dispatch };
}

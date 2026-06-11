# Referee Scoring Rework — Implementation Plan

Goal: make the referee view score like a real BWF app — singles **and** doubles, correct serving/service-court logic, intervals, change of ends, abnormal endings — built on the current tap-to-score UI (`components/referee/*` + `hooks/useMatch.ts`). See [ADR-0003](./adr/0003-doubles-aware-scoring-engine.md).

## Decisions (from grilling)

1. **Doubles + singles**, full BWF.
2. **Auto-derive** server/receiver/service-court each rally; ref only taps the scoring side. Ref picks serving side + server (+ receiver for doubles) at each game start.
3. **Format from event**: games = `ceil(max_sets/2)` to win; points = `points_per_set`; win by 2; cap = `points_per_set + 9`.
4. **Intervals**: 60s when a side first reaches 11; 120s between games. Auto overlay + countdown, skippable, scoring locked.
5. **Change of ends**: after each game, and at 11 in the deciding game. Prompt **and swap on-screen sides** (score follows the player).
6. **Abnormal endings**: **Walkover** + **Disqualification** only (no retirement). Assign winner, advance bracket, store reason.
7. **Multi-step undo** over full rally history (reverses set/serve/court/interval transitions). No 8s limit.
8. **Live-only rich state**: serving/court/interval/ends in memory; persist set scores + completion + abnormal result; side-level rally events as today.

## Serving algorithm (core, both modes)

State per side: `players[1|2]`, and for doubles `rightIndex` = which player index currently stands in the right service court.

On rally won by side `X`:
- If `X === servingSide`: same side keeps serve; **doubles** → swap that side's two players (`rightIndex` flips). Singles → no swap.
- If `X !== servingSide`: serve passes to `X`; **no** positional swap; `servingSide = X`.
- Increment `X` score.
- **Service court** = serving side score even → right, odd → left.
- **Server** = the serving side's player in that court (singles: the lone player). **Receiver** = diagonally opposite player.

Singles needs no `rightIndex` (court derives directly from score parity); doubles needs it because *which* of two players serves depends on positions that only swap on serve-side wins.

## State model (`types.ts`)

Replace the p1/p2 `MatchState` with side-based:
```
Side = { players: {id,name}[]; gamesWon: number; rightIndex: 0|1 }
MatchState = {
  phase: 'pre'|'scoring'|'interval'|'game-end'|'match-end'
  isDoubles: boolean
  pointsPerSet: number; gamesToWin: number
  court, tournament
  sides: { A: Side; B: Side }
  servingSide: 'A'|'B'
  currentGame: { A: number; B: number }
  completedGames: { A:number; B:number; winner:'A'|'B' }[]
  displaySwap: boolean        // for change-of-ends on-screen swap
  interval?: { kind:'mid'|'game'; secondsLeft:number }
  result?: { type:'normal'|'walkover'|'disqualification'; winner:'A'|'B'; note?:string }
  history: Snapshot[]         // for multi-undo
  elapsedSeconds: number
}
```
Actions: `SETUP_GAME{servingSide, serverIdx, receiverIdx}`, `SCORE{side}`, `UNDO`, `START_INTERVAL/END_INTERVAL`, `CHANGE_ENDS`, `END_ABNORMAL{type,winner,note}`, `TICK`, `RESET`.

`useMatch` initial state derives `isDoubles`, `pointsPerSet`, `gamesToWin` from `matchData.event` and seats both players per side from `matchData.participants` (side A/B, may be 2 each).

## UI components

- **PreMatch** → game setup: singles = pick server; doubles = pick serving side, its server, the receiver. Show both partner names per side.
- **Scoring**: both names per side; highlight current **server** + **L/R service-court** badge; tap side to score; game/match/deuce labels (from format); multi-undo; abnormal-end menu (WO/DQ); triggers interval/ends prompts.
- **IntervalOverlay** (new): 60s/120s countdown, "Tiếp tục" to skip; scoring locked underneath.
- **GameEndPanel** (rename `SetEndPanel`): game result, between-game 120s interval, change-ends prompt, doubles next server/receiver pick.
- **MatchEndScreen**: final result; show result type if WO/DQ.
- **AbnormalEndSheet** (new): pick WO or DQ, offending/absent side, confirm winner.

Change-of-ends swap = flip which side renders top/bottom (`displaySwap`); score stays bound to the side.

## Backend (minimal)

- Schema: add `result_type VARCHAR(16) NOT NULL DEFAULT 'normal'` to `matches` (live DB `ALTER` + `schema.sql`). No enum migration.
- Endpoint: `PATCH /api/competition/matches/:id/result { resultType, winnerSide, note }` → set `status='completed'`, `winner_side`, `result_type`, then reuse `advanceWinner`. Walkover allowed from `upcoming`; DQ from `live`.
- Normal completion unchanged (`completeMatch`). Persistence of sets/score-events unchanged.

## Sequencing

1. State model + serving algorithm in `useMatch` (singles first, then doubles `rightIndex`) → unit-verify serve/court sequences.
2. Format-from-event + deuce/cap.
3. Rewrite PreMatch / Scoring for sides + server/court display.
4. Intervals + change-of-ends (+ on-screen swap).
5. Multi-step undo (snapshot history).
6. Abnormal endings (UI + backend `result_type` + endpoint).
7. Verify full flows: singles 3×21, doubles with serve rotation, deuce/cap, interval at 11, ends swap, WO/DQ advance bracket.

## Risks

- Doubles serve/court correctness is the crux — derive from one well-tested pure function; cover even/odd, serve retention vs change, and game-start re-seat with tests.
- Multi-undo must snapshot enough to reverse serve/court/interval/game transitions — snapshot whole `MatchState` per rally (simplest, correct).
- On-screen end-swap must not desync score↔side binding.

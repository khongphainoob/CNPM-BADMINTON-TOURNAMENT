# Rebuild the scoring engine to be doubles-aware, with live-only serving state

The referee scoring engine (`hooks/useMatch.ts` + `types.ts`) modelled only singles — one player per side, `serving: 'p1'|'p2'`, no service courts — and hardcoded best-of-3 to 21. To match a real BWF scoring app we rebuild it to model both singles and doubles: each side holds 1–2 players, the engine auto-derives **server**, **receiver**, and **service court** (right when the serving side's score is even, left when odd) from the score and who won each rally, given an initial server/receiver chosen at each game start. Format (games, points) is read from the match's **Event** (`max_sets`, `points_per_set`; win by 2; cap at `points_per_set`+9). Rich serving/court/interval/ends state lives **in memory only**; persistence stays at set-score + completion + side-level rally-event granularity (no serving-detail columns).

## Status

accepted

## Considered options

- **Singles-only, done properly** — far simpler, but doubles events (MD/WD/XD) exist and the request is full real-life fidelity. Rejected.
- **Full persistent serving state** (server player, service court, initial server/receiver columns) — enables exact mid-match reload recovery, but adds schema + offline-sync-queue complexity. Rejected for the demo in favour of live-only state (a reload resumes from saved set scores and re-picks the server).

## Consequences

- `MatchState`/`MatchAction` and every referee component (`PreMatch`, `Scoring`, `SetEndPanel`→game-end, `MatchEndScreen`) are rewritten; this is a large, hard-to-reverse change.
- Serving/receiver/court are **derived**, not stored — a future need for exact crash-recovery or per-player serve audit will require the rejected persistent-state option.
- One backend schema addition only: a `result_type` field on `matches` for walkover/disqualification (status stays `completed`, `winner_side` set, bracket advance reuses the existing path). Retirement was explicitly excluded.

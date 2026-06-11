# MVP Implementation Plan — Badminton Tournament

Goal: make the running app match the UI demo (`front-end/UI demo/`) for every feature that has a real backend today. Demo will be presented **live** off a minimal seed, so the create→draw→score→advance→results pipeline must work end-to-end.

## Scope decisions (from grilling)

**IN** — features with real backend:
- Auth (email/password login, register, approval), Admin user mgmt (approve/reject/assign role)
- People (players/athletes, referees, coaches, clubs)
- Tournament / Event / Court management
- Participation: athlete + **coach/team** registration, partner confirm/reject, status lifecycle, auto-seed
- Competition: draw, bracket, referee scoring, results
- Finance (manual payments/expenses), Inventory (restock/issue), News/CMS
- Notifications with **live triggers** (account approved, partner-confirm request) + bell/list
- Spectator public views (home, ranking, schedule, players, news, live, results, bracket)

**OUT** — no backend now, too costly for the timebox:
- Online ticketing + payment gateways (VNPay/MoMo/ZaloPay), QR e-tickets → render static/disabled
- SMS OTP login (`OtpForm`) → email/password only
- `SystemConfigView` (no config endpoint), `LegalReportModal` (no endpoint) → leave as static or hide
- WebSockets — **dropping** `socket.io-client`; live updates stay on 5s polling

## Critical path (blockers — do first, in order)

These break the live demo today. Nothing else matters until these work.

### B1. Referee scoring does not persist
`RefereeApp` → `useMatch`/`Scoring` only posts score events in a shape the backend rejects, and never writes sets or completes the match. Result: scoring a match changes nothing in the DB.

- Decision: **keep the demo UI** (`hooks/useMatch.ts`, `components/referee/Scoring.tsx`), add correct persistence; retire `features/referee/MatchScoreView.tsx`.
- Tasks:
  - In `useMatch` side effects, on set end call `competitionApi.addSetScore(matchId, { setNo, scoreA, scoreB })`; on match end call `competitionApi.completeMatch(matchId)`.
  - Fix score-event payload to match `competition.service.addScoreEvent` (`{ setNo, scorer, prevScoreA, prevScoreB, prevServing, causedSetEnd }`) — or relax the service to accept `{ scorerSide }`. Pick one shape, align both ends.
  - Keep the offline `referee_sync_queue`; ensure `SyncLogView` replays the same corrected calls.
  - Delete `features/referee/MatchScoreView.tsx` once unused.
- Verify: referee scores a full match in the UI → `match_sets` rows exist, match `status='completed'`, `winner_side` set; spectator Results tab shows it after ≤5s.

### B2. Draw generates only round 1; winners don't advance
`competition.service.generateDraw` creates one round; `completeMatch` only sets `winner_side`. Bracket can't progress.

- Decision: **full bracket tree at draw + auto-advance on completion**.
- Schema: add link columns to `matches` — `next_match_id BIGINT REFERENCES matches(id)` and `next_slot side_t` (which side the winner fills). New migration file under `back-end/db/`.
- Tasks:
  - At draw, after placing round 1, generate empty matches for every later round and wire `next_match_id`/`next_slot` bottom-up. BYE matches already auto-complete — propagate their winners immediately.
  - In `completeMatch`, after setting `winner_side`, insert the winning player(s) into the `next_match_id` match on `next_slot`; if that match now has both sides, leave `upcoming` for scheduling.
  - Confirm `BracketView.tsx` renders a multi-round tree from matches grouped by round (adjust if it assumes flat list).
- Verify: draw an 8-player event → 4+2+1 matches created; completing both semifinals populates the final's two sides automatically.

### B3. Backend login error (reported)
Login/signup failed during setup. Reproduce and fix before anything else is demoable.

- Tasks: run `npm run dev` in `back-end/`, capture the stack; likely `.env`/`pg` pool, JWT, or bcrypt hash mismatch. Confirm seeded accounts (e.g. `admin@shuttleops.vn` / `admin123`) authenticate and `/api/auth/me` returns the session.
- Verify: each role logs in and lands on its default route.

## Workstreams (after critical path)

### W1. Spectator parity
Spectator nav exposes only 5 of 9 tabs; `live`, `results`, `bracket`, `tickets` are unreachable.
- Add nav entries for live / results / bracket (tickets stays out per scope, or render static).
- Confirm `fetchDashboard/fetchMatches/fetchAthletes/fetchNews` populate once B1/B2 produce data.
- File: `components/spectator/SpectatorView.tsx:66`.
- Verify: every spectator tab shows real seeded/live data.

### W2. Frontend API gaps
`data/api.ts` missing methods for existing backend routes:
- Add `peopleApi.updateClub`, `updateReferee`, `createCoach` (routes exist).
- Reconcile payment stats (`/stats` vs `/revenue-stats`) and add `getMyPayments` if athlete payment history is shown.
- Verify: BTC can edit a club/referee and add a coach from the UI.

### W3. Wire stubbed editors
- `features/cms/ArticleEditor.tsx`: replace `console.log` with `reportingApi.createNews(...)` (+ `updateNews` for edit).
- Verify: BTC publishes news → appears in spectator News tab.
- `LegalReportModal` stays out of scope (no backend) — hide its entry point or mark "coming soon".

### W4. Notification triggers
Backend already notifies partner on `pending_partner`. Add/confirm triggers for: account approved (admin), participant approved/rejected (BTC). Wire `NotificationBell` + `NotificationView` to `/api/notifications` + unread count poll.
- Verify: approving a pending user creates an in-app notification visible to that user.

### W5. Data-mapping bugs
- Leaderboard service references `r.id`/`r.club` but selects `player_id`/`club_name` — align aliases (`reporting.service.js`).
- Inventory endpoint returns a bare array while others return `{ data, meta }` — standardize or document; `store.ts` already special-cases it.
- `TournamentSettingsView.tsx:60` TODO: send organizer/location/description only if columns added; otherwise drop the fields.

### W6. Cleanup
- Remove `socket.io-client` dep, `lib/socket.ts`, and socket imports (polling only).
- Strip leftover `console.log` debug in `AthleteViews.tsx`, `BtcViews.tsx`, `TournamentSettingsView.tsx`.
- Remove `OtpForm` from the auth flow (email/password only).

## Suggested sequence

1. **B3** (login) → app is usable.
2. **B1** (scoring persistence) → matches produce real results.
3. **B2** (bracket tree + advance) → progression works. *(schema migration here)*
4. **W1** (spectator tabs) → demo surface is complete.
5. **W4 + W3** (notifications, news) → supporting flows.
6. **W2 + W5 + W6** (API gaps, bug fixes, cleanup) → polish.

## Risks / open items

- **B2 is the largest item.** Decide BYE/odd-bracket edge cases up front (3,5,6-player events). Auto-advance must be idempotent if `completeMatch` is retried (offline queue replays).
- Score-event payload shape (B1): one canonical shape must be chosen and applied on both ends, including the offline replay path.
- Minimal-seed live demo means **no margin for these bugs on stage** — rehearse the full create→draw→score→advance→results→leaderboard path against a fresh DB.

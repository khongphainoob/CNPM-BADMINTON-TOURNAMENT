# Keep the demo scoring UI as the single source of truth; add persistence

The referee app shipped with two scoring implementations: the polished demo-faithful UI (`hooks/useMatch.ts` + `components/referee/Scoring.tsx`), which `RefereeApp` routes to but which does not persist sets or completion to the backend, and `features/referee/MatchScoreView.tsx`, which persists correctly but is unwired. For the MVP we keep the demo UI (to preserve the demo's look and the offline sync-queue behavior), add the missing persistence (`addSetScore` + `completeMatch`, plus a single canonical score-event payload shape applied on both ends), and delete `MatchScoreView`.

## Status

accepted

## Consequences

- A future reader will find the correctly-wired `MatchScoreView` deleted in history and the kept UI initially lacking persistence — this records that the choice was deliberate (UI fidelity + one source of truth) rather than an oversight.
- The offline `referee_sync_queue` replay path must use the same corrected calls as the live path.

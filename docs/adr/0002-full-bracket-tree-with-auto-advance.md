# Generate the full bracket tree at draw and auto-advance winners

The original `generateDraw` created only the first round of matches, and `completeMatch` only set `winner_side` — winners never advanced, so a bracket could not progress. We now generate the entire single-elimination tree at draw time (empty matches for every round), link each match to its successor via two new `matches` columns — `next_match_id BIGINT REFERENCES matches(id)` and `next_slot side_t` — and, on `completeMatch`, insert the winner into the linked match's slot. BYE matches auto-complete and propagate immediately.

## Status

accepted

## Considered options

- **Round-by-round manual generation** (BTC clicks to generate the next round from winners): less upfront logic but more clicking during the live demo and still needs an advance endpoint. Rejected for the demo's sake.
- **Single round only**: cheapest, but cannot show progression to a final. Rejected.

## Consequences

- Schema migration required (the two link columns); existing draw/complete logic changes.
- Auto-advance must be **idempotent** — the referee offline queue can replay `completeMatch`, so re-advancing the same winner must not duplicate participants.
- Odd / non-power-of-two brackets (3, 5, 6 players) and BYE propagation are the main edge cases to get right.

# Badminton Tournament Management

Single system for running a badminton tournament end-to-end: account/role approval, athlete & team registration, draw/bracket generation, live referee scoring, public spectator views, finance, inventory, news, and notifications. Vietnamese-language domain ("ShuttleOps").

## Language

**Tournament**:
A dated competition (`tournaments`) at one venue, owning multiple events. Status: draft → live → finished/cancelled.

**Event**:
One competitive category inside a tournament (`events`), e.g. "Đơn nam — VNBAD-2026-03". Unique per (tournament, category). Carries match rules: `max_sets`, `points_per_set`.
_Avoid_: "category" when you mean the per-tournament instance — a **Category** is the catalog code.

**Category**:
Catalog of discipline codes (`categories`): MS, WS, MD, WD, XD. Doubles flag lives here. An **Event** references a **Category**.

**Player**:
A person who competes (`players`), owned by a **Club**. The DB term.

**Athlete**:
The frontend's word for a **Player**, especially a **Player** linked to a **User** account (`players.user_id`). Same entity as **Player**.
_Avoid_: treating athlete and player as different things — they are the same row.

**User**:
A login account (`users`) with a primary role and approval status. A **Player**/**Referee**/**Coach** may or may not be linked to a **User**.
_Avoid_: conflating **User** (account) with **Player** (competitor).

**Role**:
admin, btc, referee, athlete, coach, spectator. **BTC** = Ban tổ chức (organizing committee).

**Participant**:
A **Player** (optionally with a partner for doubles) registered into an **Event** (`event_participants`). Lifecycle status: pending → pending_partner → registered → approved → rejected / supplement_required / checked_in / withdrawn.
_Avoid_: "registration" as a noun for this row — call it a **Participant**.

**Draw**:
The act of seeding **Participants** into a **Bracket** and generating **Matches** for an **Event**.

**Bracket**:
The single-elimination tree of **Matches** for an **Event**. Rounds named by size: Vòng 32 → Vòng 16 → Tứ kết → Bán kết → Chung kết.

**Match**:
One contest between side A and side B (`matches`) within an **Event** and **Round**. Status: upcoming → live → completed/cancelled. Has a `winner_side` and a **result type**.

**Result type**:
How a **Match** ended: `normal` (on points), `walkover` (a side absent — present side wins without play), or `disqualification` (a side removed for misconduct — other side wins). Walkover and disqualification still set `winner_side` and advance the bracket.

**Set / Game**:
A **Set** (`match_sets`) — also called a **Game** in badminton rules — is one race to `points_per_set` points (rally scoring, win by 2, cap at `points_per_set`+9, e.g. 21→30). A match is best-of-`max_sets`.

**Rally / Score Event**:
A **Rally** is one point exchange; the winner scores. Each is recorded as a **Score Event** (`score_events`) to support live scoring and undo.

**Server / Receiver**:
The **Server** is the player putting the shuttle in play; the **Receiver** is diagonally opposite. The serving side keeps serving (and its players swap **Service Courts**) while it wins rallies; losing the rally passes serve to the opponent.

**Service Court**:
The right/left half a serve is played from/to. The serving side serves from the **right** court when its score is even, **left** when odd. In doubles both players hold positions that swap only when their side wins a rally while serving.

**Change of ends**:
Players switch physical ends after each game, and in the deciding game when a side first reaches 11.

**Interval**:
A scheduled pause: a 60-second mid-game interval when a side first reaches 11, and a 120-second break between games.

**Court**:
A physical court (`courts`) in a tournament. Status: live / idle / maintenance. (Distinct from **Service Court**.)

**Referee / Coach / Club / Venue**:
Supporting people/place entities. A **Referee** is assigned to a **Match**. A **Coach** registers a team of **Players**. A **Club** owns **Players**. A **Venue** hosts a **Tournament**.

## Relationships

- A **Tournament** has many **Events** and **Courts**
- An **Event** references one **Category** and has many **Participants** and **Matches**
- A **Draw** turns **Participants** into a **Bracket** of **Matches**
- A **Match** has two sides, many **Sets**, and many **Score Events**; completing it sets `winner_side` and (target) advances the winner to the next **Round** match
- A **Player** belongs to a **Club** and may link to a **User**

## Flagged ambiguities

- "athlete" (frontend) vs "player" (DB/backend) — resolved: same entity; athlete = a player, usually one linked to a user account.
- "registration" — overloaded between the act and the row; the row is a **Participant**.
- "event" — the per-tournament instance (**Event**) vs the discipline code (**Category**).

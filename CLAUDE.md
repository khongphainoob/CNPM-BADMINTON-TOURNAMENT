# CLAUDE.md — ShuttleOps Project Guide

## Commands

### Environment Setup
- **Docker Services (PostgreSQL & Redis):** `docker compose up -d` (from root)
- **Database Reset:** `node db/reset.js` (from `back-end`)

### Running the Application
- **Backend Developer Server:** `npm run dev` (from `back-end`, port 3000)
- **Frontend Developer Server:** `npm run dev` (from `front-end`, port 5173)

### Verification & Testing
- **E2E Bracket & Advancement Test:** `node db/test_bracket.js` (from `back-end`)

---

## Code Style & Architecture Guidelines

### Backend (`back-end/`)
- **Runtime:** Node.js (v20+) with JavaScript ES Modules (`"type": "module"`)
- **Framework:** Vanilla Express.js 5
- **Database Access:** Raw SQL queries via parameterized `query()` or transaction client `getClient()` from `src/config/db.js`
- **Validation:** Zod schemas in `{module}.schema.js`
- **Error Handling:** Use `AppError(status, message, code)` thrown inside services, handled by global middleware
- **Bracket Model:** Matches are linked in a tournament tree using:
  - `next_match_id` (BIGINT REFERENCES matches(id))
  - `next_match_side` (side_t: 'A' or 'B')

### Frontend (`front-end/`)
- **Tech Stack:** React 19 + TypeScript + Vite + Zustand + React Query
- **State Management:** Zustand store in `src/data/store.ts`
- **Styling:** TailwindCSS v4 + inline styles + CSS custom properties (`var(--ink)`, `var(--accent)`, `var(--paper)`)
- **Real-time / Updates:** Auto-refresh polling via `setInterval` (5s interval) in LiveMatchesView (no WebSocket)
- **Routing:** React Router v7

---

## Demo Credentials (seed.sql)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shuttleops.vn` | `admin123` |
| BTC (Organizer) | `phamlam@shuttleops.vn` | `btc123` |
| Referee | `lequanghuy@shuttleops.vn` | `ref123` |
| Athlete | `nguyenhaidang@shuttleops.vn` | `vdv123` |

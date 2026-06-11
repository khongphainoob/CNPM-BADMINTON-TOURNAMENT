# 🔍 PHASE 1 — AUDIT REPORT: ShuttleOps (Badminton Tournament Management)

> Generated: 2026-06-08T16:20+07:00

---

## 1A. Cấu trúc tổng thể

| Câu hỏi | Trả lời |
|---|---|
| Monorepo hay tách thư mục? | **Tách thư mục**: `back-end/` và `front-end/` riêng biệt, root chỉ có `docker-compose.yml` |
| Backend entry point? | `back-end/src/server.js` — **Express.js** (ESM), KHÔNG phải NestJS |
| Frontend entry point? | `front-end/src/main.tsx` → `App.tsx` — React 19 + Vite 8 + React Router v7 |
| Docker Compose đủ service? | ⚠️ **Chỉ có postgres + redis**. THIẾU: backend service, frontend service, nginx |
| Có CLAUDE.md? | ✅ Có — nhưng là template chung, chưa chứa thông tin dự án cụ thể |

### Tech Stack thực tế (KHÁC VỚI PROMPT GỐC)

| Layer | Prompt gốc nói | Thực tế |
|---|---|---|
| Backend framework | NestJS | **Express.js 5** (ESM, vanilla) |
| ORM | TypeORM | **Raw pg (node-postgres)** — query trực tiếp SQL |
| DB Schema | TypeORM entities + migrations | **`db/schema.sql`** file SQL thủ công |
| Validation | class-validator | **Zod** schemas |
| Auth | JWT + bcrypt + RBAC | ✅ Đúng — JWT + bcryptjs + role middleware |
| Frontend CSS | shadcn/ui + TailwindCSS | **TailwindCSS v4** + inline styles + CSS vars |
| State | Zustand + React Query | ✅ Đúng — Zustand store + React Query provider |
| WebSocket | Socket.IO gateway | ⚠️ Client có (`socket.io-client`), **backend CHƯA có Socket.IO server** |

---

## 1B. Audit Backend Modules

### BACKEND MODULES SUMMARY

| Module | Entity/Schema | Service | Controller | Routes | DTO/Validation | Tests | Critical Issues |
|---|---|---|---|---|---|---|---|
| **auth** | ✅ `users`, `roles`, `user_roles`, `permissions` | ✅ Đầy đủ (register, login, me, approve, reject, changeRole, listUsers) | ✅ 8 handlers | ✅ 8 routes | ✅ Zod | ❌ | Không có refresh token |
| **tournament** | ✅ `tournaments`, `events`, `courts`, `venues`, `categories` | ✅ Đầy đủ (CRUD + dashboard + events + courts) | ✅ 16 handlers | ✅ 16 routes | ✅ Zod | ❌ | — |
| **competition** | ✅ `matches`, `match_participants`, `match_sets`, `score_events` | ✅ Đầy đủ (CRUD, scoring, draw generation, undo) | ✅ 14 handlers | ✅ 14 routes | ✅ Zod | ❌ | Draw chỉ tạo vòng 1, chưa tạo vòng 2+ |
| **people** | ✅ `players`, `coaches`, `referees`, `clubs` | ✅ Đầy đủ (CRUD players, clubs, referees, coaches) | ✅ 12 handlers | ✅ 12 routes | ✅ Zod | ❌ | — |
| **participation** | ✅ `event_participants` | ✅ Đầy đủ (register, status, seed, partner confirm/reject, auto-seed) | ✅ 9 handlers | ✅ 9 routes | ✅ Zod | ❌ | — |
| **payment** | ✅ `payments`, `payment_transactions` | ✅ Đầy đủ (CRUD, expenses, stats) | ✅ 8 handlers | ✅ 8 routes | ✅ Zod | ❌ | Mock only — không có VNPay/MoMo thực |
| **notification** | ✅ `notifications`, `notification_templates` | ✅ Đầy đủ (inbox, unread count, mark read, send) | ✅ 6 handlers | ✅ 6 routes | ✅ Zod | ❌ | In-app only, chưa có email/push |
| **reporting** | ✅ `inventory_items`, `inventory_issues`, `news`, `activity_log`, `report_templates` | ✅ Đầy đủ (inventory CRUD, news CRUD, activity log, leaderboard) | ✅ 11 handlers | ✅ 11 routes | ✅ Zod | ❌ | — |

### Backend TODO/FIXME/Placeholder
- **Không tìm thấy TODO/FIXME** nào trong backend code ✅

### Backend Critical Findings
1. ❌ **Không có WebSocket/Socket.IO server** — Frontend import `socket.io-client`, nhưng backend không cài Socket.IO, không có gateway
2. ⚠️ **Không có refresh token** — Chỉ có access token, không có `POST /auth/refresh`, `POST /auth/logout`
3. ⚠️ **Draw chỉ tạo vòng 1** — `generateRandomDraw` chỉ tạo matches vòng đầu tiên, chưa tạo cấu trúc bracket hoàn chỉnh (vòng 2, bán kết, chung kết)
4. ⚠️ **Health endpoint đơn giản** — `/health` chỉ trả `{ status: 'ok' }`, không check DB/Redis connection
5. ⚠️ **.env thiếu REDIS_URL** — File `.env` thực tế không có `REDIS_URL`, backend cũng không dùng Redis ở đâu

---

## 1C. Audit Frontend

### Frontend Pages Summary

| Page/View | Component | Trạng thái | Có API integration? |
|---|---|---|---|
| **Login** | `LoginForm.tsx` | ✅ Hoàn chỉnh | ✅ `POST /api/auth/login` |
| **Register** | `RegisterForm.tsx` | ✅ Hoàn chỉnh | ✅ `POST /api/auth/register` |
| **OTP** | `OtpForm.tsx` | ⚠️ Mock (hardcode `123456`) | ❌ Mock |
| **Tổng quan hệ thống** | `SystemOverviewView.tsx` | ✅ Hoàn chỉnh | ✅ Dashboard API |
| **Quản lý users (Admin)** | `UsersView.tsx` | ✅ Hoàn chỉnh | ✅ Auth API |
| **Config hệ thống (Admin)** | `SystemConfigView.tsx` | ✅ UI hoàn chỉnh | ⚠️ Chưa lưu config |
| **Tournament Hub** | `TournamentHub.tsx` | ✅ Hoàn chỉnh | ✅ Tournament API |
| **Tournament Form** | `TournamentForm.tsx` | ✅ Hoàn chỉnh | ✅ CRUD |
| **Tournament Settings** | `SettingsView.tsx` + `TournamentSettingsView.tsx` | ✅ Hoàn chỉnh | ✅ Update API |
| **Dashboard giải** | `DashboardView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ Dashboard API |
| **Lịch thi đấu** | `ScheduleView.tsx` | ✅ Hoàn chỉnh | ✅ Matches API |
| **Bảng đấu (Bracket)** | `BracketView.tsx` | ✅ Hoàn chỉnh | ✅ Draw API |
| **VĐV** | `AthletesView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ People API |
| **Sân đấu** | `CourtsView.tsx` | ✅ Hoàn chỉnh | ✅ Courts API |
| **Kho vật tư** | `InventoryView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ Inventory API |
| **Tài chính** | `FinanceView.tsx` | ✅ Hoàn chỉnh | ✅ Payment API |
| **Thống kê** | `ReportsView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ Reports API |
| **Trọng tài** | `RefereesView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ People API |
| **Tin tức** | `NewsView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ News API |
| **Cài đặt giải** | `SettingsView` (in BtcViews.tsx) | ✅ Hoàn chỉnh | ✅ Settings API |
| **Referee Scoring** | `RefereeApp.tsx` + `Scoring.tsx` + `PreMatch.tsx` + ... | ✅ Hoàn chỉnh | ✅ Score API + offline queue |
| **Xem trực tiếp** | `LiveMatchesView.tsx` | ✅ Hoàn chỉnh | ✅ Matches API |
| **Tournament Explorer (spectator)** | `TournamentExplorer.tsx` | ✅ Hoàn chỉnh | ✅ Tournament API |
| **Profile** | `UserProfileView.tsx` | ✅ Hoàn chỉnh | ✅ Auth API |
| **Lịch cá nhân** | `MyScheduleView.tsx` | ✅ Hoàn chỉnh | ⚠️ Local data |
| **Athlete Overview** | `AthleteViews.tsx` | ✅ Hoàn chỉnh | ✅ People + Participation API |
| **Athlete Registration** | `AthleteViews.tsx` | ✅ Hoàn chỉnh | ✅ Participation API |
| **Athlete Profile** | `AthleteViews.tsx` | ✅ Hoàn chỉnh | ✅ People API |
| **Ranking** | `AthleteViews.tsx` | ✅ Hoàn chỉnh | ✅ Leaderboard API |
| **Notification** | `NotificationView.tsx` | ✅ Hoàn chỉnh | ✅ Notification API |
| **Registration Hub** | `RegistrationHubView.tsx` | ✅ Hoàn chỉnh | ✅ Participation API |
| **Team Dashboard** | `TeamDashboardView.tsx` | ✅ Hoàn chỉnh | ⚠️ Partial |
| **Not Found (404)** | `NotFound.tsx` | ✅ Hoàn chỉnh | — |

### Frontend Architecture Findings

| Tiêu chí | Trạng thái |
|---|---|
| Pages còn trống/placeholder? | ✅ **0** — tất cả ~35 pages đều có implementation thực |
| API base URL? | ✅ Đọc từ `VITE_API_BASE_URL` env, fallback `http://localhost:3000` |
| Auth token gửi đúng? | ✅ Axios interceptor tự attach `Bearer` token từ `localStorage` |
| 401 auto-redirect? | ✅ Axios response interceptor clear token + redirect `/` |
| Route guard? | ✅ `ProtectedRoute` component check session + role |
| Error Boundary? | ✅ `ErrorBoundary` component bọc toàn bộ app |
| Loading states? | ✅ Auth có loading state, store fetches có console.error fallback |
| WebSocket client? | ⚠️ `socket.io-client` đã setup (`lib/socket.ts`), nhưng `autoConnect: false` và chưa dùng ở đâu ngoài import |

### Frontend TODO/FIXME
- 1 TODO in [TournamentSettingsView.tsx](file:///d:/UIT/FOUNDATIONAL SUBJECTS/SE104-CNPM/Đồ án/front-end/src/features/tournament/TournamentSettingsView.tsx#L60): `// TODO: handle organizer, location, description if backend supports it`

---

## 1D. Audit Infrastructure & Config

| Tiêu chí | Trạng thái | Chi tiết |
|---|---|---|
| Docker Compose | ⚠️ Thiếu | Chỉ có `postgres` (port 5433→5432) + `redis` (port 16379→6379). Không có backend/frontend/nginx service |
| Dockerfile backend | ❌ Không có | — |
| Dockerfile frontend | ❌ Không có | — |
| DB Migrations | ❌ Không dùng migration system | Dùng `db/schema.sql` chạy thủ công |
| DB Seed | ✅ | `db/seed.sql` — đầy đủ data cho demo (5 user accounts, 1 tournament, courts, players, matches, etc.) |
| TypeORM? | **KHÔNG** | Dùng raw `pg` Pool, query SQL trực tiếp |
| CORS | ✅ | `app.use(cors())` — allow all origins |
| Env variables cần | `DATABASE_URL`, `JWT_SECRET`, `PORT` | `.env` hiện tại đủ 3 biến. Redis/Socket chưa dùng |
| Swagger | ✅ | `/api/docs` mount Swagger UI |

### Seed Data Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shuttleops.vn | admin123 |
| BTC | phamlam@shuttleops.vn | btc123 |
| Referee | lequanghuy@shuttleops.vn | ref123 |
| Athlete | nguyenhaidang@shuttleops.vn | vdv123 |
| Coach | truongdoan@shuttleops.vn | vdv123 |
| Spectator | khangia@shuttleops.vn | fan123 |

---

## 1E. Tổng hợp Audit Report

### BACKEND MODULES

```
┌─────────────────┬──────────┬─────────┬────────────┬───────┬────────────────────────────────────────┐
│ Module          │ Entity   │ Service │ Controller │ Tests │ Critical Issues                        │
├─────────────────┼──────────┼─────────┼────────────┼───────┼────────────────────────────────────────┤
│ auth            │ ✅        │ ✅       │ ✅          │ ❌     │ No refresh token, no logout endpoint  │
│ tournament      │ ✅        │ ✅       │ ✅          │ ❌     │ —                                    │
│ competition     │ ✅        │ ✅       │ ✅          │ ❌     │ Draw only round 1, no WS server      │
│ people          │ ✅        │ ✅       │ ✅          │ ❌     │ —                                    │
│ participation   │ ✅        │ ✅       │ ✅          │ ❌     │ —                                    │
│ payment         │ ✅        │ ✅       │ ✅          │ ❌     │ Mock only (no VNPay/MoMo)            │
│ notification    │ ✅        │ ✅       │ ✅          │ ❌     │ in_app only, no email/push           │
│ reporting       │ ✅        │ ✅       │ ✅          │ ❌     │ —                                    │
└─────────────────┴──────────┴─────────┴────────────┴───────┴────────────────────────────────────────┘
```

### FRONTEND
- **Pages hoàn chỉnh: ~35/35** — tất cả đều có implementation
- **Pages trống: 0** ✅
- **API integration: Hoàn chỉnh** — tất cả modules đều có API client matching backend routes
- **Auth flow: Hoàn chỉnh** — login → token → protected routes → 401 redirect

### INFRASTRUCTURE
- **Docker Compose: ⚠️ Thiếu backend/frontend services**
- **DB Migrations: ❌ Dùng schema.sql thủ công**
- **Env Config: ✅ Đủ cho dev** (thiếu: `REDIS_URL` nếu dùng Redis, `VITE_SOCKET_URL` nếu dùng WS)

### TOP 10 CRITICAL ISSUES (sorted by priority)

| # | Issue | Module | Impact |
|---|---|---|---|
| 1 | **Không có Socket.IO server** trên backend — Frontend đã setup client nhưng backend chưa implement | competition | Live scoring không realtime, chỉ polling HTTP |
| 2 | **Draw chỉ tạo vòng 1** — Chưa có bracket structure hoàn chỉnh (vòng 2, bán kết, chung kết) | competition | Bracket view chỉ thấy vòng đầu |
| 3 | **Không có tests** — 0 unit test, 0 e2e test (Playwright config có nhưng empty) | all | Không có safety net khi sửa code |
| 4 | **Docker thiếu backend/frontend service** — Chỉ chạy DB/Redis | infra | Không thể `docker-compose up` để demo toàn bộ |
| 5 | **OTP verification mock** — Hardcode `123456`, chưa có OTP service thực | auth | Demo vẫn work, nhưng misleading UX |
| 6 | **Không có refresh token** — Token hết hạn = phải login lại, không smooth | auth | UX kém nếu session dài |
| 7 | **Redis chưa dùng** — Docker chạy Redis nhưng backend không import/dùng | infra | Wasted resource, could use for caching/sessions |
| 8 | **Health check đơn giản** — Không verify DB connection | infra | Khó debug khi deploy |
| 9 | **SystemConfigView** — UI có nhưng chưa lưu config xuống backend | admin | Cấu hình VNPay/MoMo/Email chỉ là UI tĩnh |
| 10 | **MyScheduleView** — Dùng data local, chưa fetch từ API theo player_id | athlete | VĐV không thấy lịch thi đấu thực |

---

# 📝 REWRITTEN MASTER PROMPT — Tailored cho codebase thực tế

Dưới đây là prompt đã được chỉnh lại phù hợp 100% với codebase hiện tại:

---

```markdown
# 🎯 MASTER PROMPT — Audit & Complete Codebase
# Hệ thống ShuttleOps — Quản lý Giải Cầu Lông Quốc Gia
# Dành cho: AI coding agent (terminal)

---

## BƯỚC 0 — TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ

Đọc toàn bộ prompt này trước. Không được bắt đầu code cho đến khi hoàn tất Phase 1 (audit).

---

## ROLE & CONTEXT

Bạn là senior full-stack engineer được giao nhiệm vụ **audit, stabilize và complete** một codebase
đang dang dở để đạt trạng thái **demo-ready**.

**Dự án:** ShuttleOps — Hệ thống quản lý giải vô địch cầu lông quốc gia

**Tech stack thực tế:**
- Backend: **Express.js 5** (ESM) + **raw pg** (node-postgres) + **Zod** validation + **bcryptjs** + **JWT**
- Frontend: **React 19** + **Vite 8** + **Zustand** + **React Query** + **TailwindCSS v4** + react-router-dom v7
- Auth: JWT access token (24h) + bcrypt + RBAC middleware (`requireAuth`, `requireRole`)
- DB: **PostgreSQL 16** (schema.sql + seed.sql, KHÔNG dùng ORM/migration system)
- Infra: Docker Compose (chỉ postgres + redis hiện tại)
- API Docs: Swagger UI tại `/api/docs`

**Cấu trúc thư mục:**
```
root/
├── back-end/
│   ├── src/
│   │   ├── server.js              ← Entry point (Express app)
│   │   ├── config/db.js           ← pg Pool, query(), getClient()
│   │   ├── config/swagger.js      ← Swagger spec
│   │   ├── middleware/auth.js     ← requireAuth, requireRole
│   │   ├── middleware/error.js    ← AppError, notFound, errorHandler
│   │   ├── utils/                 ← pagination, response, slug, validation
│   │   └── modules/
│   │       ├── auth/              ← auth.{routes,controller,service,schema}.js
│   │       ├── tournament/        ← tournament.{routes,controller,service,schema}.js
│   │       ├── competition/       ← competition.{routes,controller,service,schema}.js
│   │       ├── people/            ← people.{routes,controller,service,schema}.js
│   │       ├── participation/     ← participation.{routes,controller,service,schema}.js
│   │       ├── payment/           ← payment.{routes,controller,service,schema}.js
│   │       ├── notification/      ← notification.{routes,controller,service,schema}.js
│   │       └── reporting/         ← reporting.{routes,controller,service,schema}.js
│   ├── db/
│   │   ├── schema.sql             ← Full PostgreSQL schema (DROP + CREATE)
│   │   ├── seed.sql               ← Demo data (users, tournaments, matches, etc.)
│   │   └── reset.sh               ← Helper script
│   ├── .env                       ← DATABASE_URL, JWT_SECRET, PORT
│   └── package.json               ← express, pg, bcryptjs, jsonwebtoken, zod
│
├── front-end/
│   ├── src/
│   │   ├── main.tsx               ← Entry (QueryClient, AuthProvider, BrowserRouter)
│   │   ├── App.tsx                ← Routes + RBAC nav + AppShell
│   │   ├── data/
│   │   │   ├── auth.tsx           ← AuthContext + useAuth hook
│   │   │   ├── api.ts             ← All API clients (authApi, tournamentApi, etc.)
│   │   │   ├── store.ts           ← Zustand store + fetch functions
│   │   │   └── constants.ts       ← Type definitions + defaults
│   │   ├── lib/
│   │   │   ├── api-client.ts      ← Axios instance + token interceptor
│   │   │   └── socket.ts          ← Socket.IO client (autoConnect: false)
│   │   ├── hooks/useMatch.ts      ← Match scoring reducer (offline-capable)
│   │   ├── components/
│   │   │   ├── auth/              ← AuthScreen
│   │   │   ├── shared/            ← AppShell, ErrorBoundary, Modal, Toast, Icon, NotFound
│   │   │   ├── btc/               ← BtcViews.tsx (52KB — Dashboard,Schedule,Bracket,Athletes,Courts,etc.)
│   │   │   ├── referee/           ← RefereeApp, Scoring, PreMatch, SetEndPanel, MatchEndScreen
│   │   │   ├── user/              ← LiveMatchesView, TournamentExplorer, UserProfile, MySchedule
│   │   │   └── athlete/           ← AthleteViews.tsx (Overview, Registration, Profile, Ranking)
│   │   ├── features/
│   │   │   ├── auth/              ← LoginForm, RegisterForm, OtpForm
│   │   │   ├── admin/             ← UsersView, SystemConfigView, SystemOverviewView
│   │   │   ├── tournament/        ← TournamentHub, TournamentForm, BracketView, ScheduleView, etc.
│   │   │   ├── registration/      ← RegistrationHub, RegistrationForm, TeamDashboard, ApprovalModal
│   │   │   ├── finance/           ← FinanceView, ExpenseForm, PaymentModal
│   │   │   ├── referee/           ← MatchScoreView, MatchAssignmentModal, SyncLogView
│   │   │   ├── notification/      ← NotificationView
│   │   │   ├── cms/               ← ArticleEditor
│   │   │   └── reports/           ← LegalReportModal
│   │   └── types.ts               ← Match scoring types
│   ├── .env.example               ← VITE_API_BASE_URL, VITE_SOCKET_URL
│   └── package.json               ← react 19, zustand, @tanstack/react-query, axios, socket.io-client
│
├── docker-compose.yml             ← postgres:16 (port 5433) + redis:7 (port 16379)
├── CLAUDE.md                      ← Generic coding guidelines (needs project-specific rewrite)
└── docs/                          ← Documentation folder
```

**API Route Map (backend):**
```
/health                            → GET  health check
/api/docs                          → Swagger UI

/api/auth/register                 → POST  register
/api/auth/login                    → POST  login
/api/auth/me                       → GET   current user (auth required)
/api/auth/change-password          → POST  change password (auth required)
/api/auth/users                    → GET   list users (admin)
/api/auth/users/:id/approve        → PATCH approve user (admin)
/api/auth/users/:id/reject         → PATCH reject user (admin)
/api/auth/users/:id/role           → PATCH change role (admin)

/api/tournaments                   → GET/POST list/create
/api/tournaments/:id               → GET/PUT/DELETE detail
/api/tournaments/:id/status        → PATCH change status
/api/tournaments/:id/events        → GET/POST list/create events
/api/tournaments/:id/events/:eid   → PUT/DELETE event
/api/tournaments/:id/courts        → GET/POST list/create courts
/api/tournaments/:id/courts/:cid   → PUT/PATCH/DELETE court
/api/tournaments/:id/dashboard     → GET  dashboard stats
/api/tournaments/venues            → GET/POST venues

/api/competition/events/:id/draw   → POST  generate bracket draw
/api/competition/matches           → GET/POST list/create matches
/api/competition/matches/:id       → GET/PUT match detail
/api/competition/matches/:id/schedule  → PATCH schedule match
/api/competition/matches/:id/start     → PATCH start match
/api/competition/matches/:id/complete  → PATCH complete match
/api/competition/matches/:id/participants → POST add participant
/api/competition/matches/:id/sets         → POST add set score
/api/competition/matches/:id/score-events → GET/POST score events
/api/competition/matches/:id/undo         → POST undo last score

/api/participation/events/:eventId/participants → GET  list participants
/api/participation/events/:eventId/register     → POST register
/api/participation/events/:eventId/auto-seed    → POST auto-seed
/api/participation/participants                 → GET  list all
/api/participation/participants/:id             → GET  detail
/api/participation/participants/:id/status      → PATCH update status
/api/participation/participants/:id/seed        → PATCH assign seed
/api/participation/participants/:id/confirm-partner → POST
/api/participation/participants/:id/reject-partner  → POST
/api/participation/participants/:id             → DELETE withdraw

/api/notifications                → GET   list (auth)
/api/notifications/unread-count   → GET   unread count
/api/notifications/:id/read       → PATCH mark read
/api/notifications                → POST  send notification (admin/btc)

/api/payments                     → GET/POST  list/create (admin/btc)
/api/payments/mine                → GET   my payments
/api/payments/revenue-stats       → GET   stats
/api/payments/expenses            → POST  create expense
/api/payments/:id                 → GET   detail
/api/payments/:id/status          → PATCH update status
/api/payments/:id/transactions    → POST  record transaction

/api/reports/news                 → GET/POST/PUT  news
/api/reports/leaderboard          → GET   player ranking
/api/reports/inventory            → GET/POST/PUT  inventory items
/api/reports/inventory/:sku/issue → POST  issue inventory
/api/reports/activity-log         → GET   activity log
/api/reports/templates            → GET   report templates
```

**Demo Accounts (từ seed.sql):**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shuttleops.vn | admin123 |
| BTC | phamlam@shuttleops.vn | btc123 |
| Referee | lequanghuy@shuttleops.vn | ref123 |
| Athlete | nguyenhaidang@shuttleops.vn | vdv123 |
| Coach | truongdoan@shuttleops.vn | vdv123 |
| Spectator | khangia@shuttleops.vn | fan123 |

**Mục tiêu cuối:** App chạy được local (hoặc docker-compose up) → mở browser → demo được 5 luồng chính
mà không bị crash, không có màn hình trắng, không có console error nghiêm trọng.

---

## PHASE 1 — AUDIT CODEBASE (KHÔNG VIẾT CODE)

> Audit đã thực hiện. Xem báo cáo phía trên.

**Kết luận:** Codebase đã khá hoàn chỉnh (~85% done). Backend 8/8 modules đều có service + controller + routes + schema thực.
Frontend có 35+ views đều implemented. Vấn đề chính là:
1. Thiếu WebSocket server (live scoring chỉ HTTP polling)
2. Bracket draw chỉ tạo vòng 1
3. Không có tests
4. Docker thiếu service cho backend/frontend

---

## PHASE 2 — TRIAGE & PLANNING

### 🔴 P0 — Blocker (app không chạy được nếu thiếu)

1. ~~App crash khi start~~ ✅ Không — backend Express chạy bình thường
2. ~~Docker Compose fail~~ ⚠️ Docker chỉ có DB/Redis, nhưng dev vẫn chạy bằng `npm run dev`
3. ~~Database không connect~~ ✅ Nếu Postgres đang chạy + env đúng
4. ~~Auth hoàn toàn broken~~ ✅ Auth hoạt động
5. ~~Frontend màn hình trắng~~ ✅ Không — frontend load bình thường

**→ Không có P0 blocker.** App chạy được.

### 🟡 P1 — Demo-critical (5 luồng chính)

**Luồng 1: Auth** ✅ DONE — Login → JWT → RBAC → Dashboard → Protected Routes

**Luồng 2: Tournament Management** ✅ MOSTLY DONE
- BTC tạo giải → tạo events → quản lý courts → dashboard
- ⚠️ Cần verify: Tournament status transitions (draft → live → finished)

**Luồng 3: Bracket & Draw** ⚠️ PARTIAL
- ✅ Generate draw vòng 1 hoạt động
- ❌ **Chưa tạo matches vòng 2+** (bán kết, chung kết) 
- ❌ Bracket view chỉ thấy vòng 1
- **FIX CẦN:** Extend `generateRandomDraw` hoặc tạo bracket structure API

**Luồng 4: Live Scoring** ⚠️ PARTIAL
- ✅ Referee UI ghi điểm hoàn chỉnh (useMatch reducer, offline queue)
- ✅ API: startMatch, addScoreEvent, undoScore, completeMatch
- ❌ **Chưa có WebSocket server** → Tab khán giả phải reload để thấy điểm mới
- **FIX CẦN:** Thêm Socket.IO vào backend, broadcast score updates

**Luồng 5: Registration** ✅ MOSTLY DONE
- ✅ VĐV đăng ký event → BTC duyệt → auto-seed
- ⚠️ Payment flow chỉ mock (đủ cho demo)
- ⚠️ Cần verify end-to-end: athlete login → chọn event → register → BTC approve

### 🟢 P2 — Nice-to-have

- Export PDF/Excel
- Email notification thực
- Refresh token + logout endpoint
- Docker service cho backend + frontend
- Complete bracket (multi-round)
- Health check improve (verify DB/Redis)
- Test coverage

---

### EXECUTION PLAN

```
Thứ tự ưu tiên:

1. Verify Auth end-to-end                     → 15 phút
   - Chạy seed, test login các account
   - Verify route guards + role-based nav

2. Verify Tournament + Events flow             → 20 phút
   - BTC login → tạo giải → tạo event → quản lý courts
   - Verify status transitions

3. Fix Bracket Draw — tạo multi-round         → 60 phút
   - Extend generateRandomDraw tạo matches vòng 2, bán kết, chung kết
   - Hoặc: tạo endpoint riêng advance winner
   - Update BracketView hiển thị multi-round

4. Add Socket.IO server cho Live Scoring       → 45 phút
   - npm install socket.io (backend)
   - Tạo scoring gateway trong server.js
   - Broadcast score-update khi addScoreEvent
   - Frontend connect socket khi xem live match

5. Verify Registration E2E                     → 20 phút
   - Athlete login → xem events → đăng ký → BTC approve
   - Verify participation status changes

6. Fix Frontend UX issues                      → 30 phút
   - MyScheduleView fetch từ API thực
   - SystemConfigView: disable save hoặc implement backend
   - OTP: show hint rõ hơn hoặc bypass cho demo accounts
   
7. Docker + CLAUDE.md (P2)                     → 30 phút
   - Thêm Dockerfile cho backend + frontend
   - Thêm services vào docker-compose.yml
   - Rewrite CLAUDE.md với project-specific info
```

**Dừng lại. Hỏi xác nhận plan trước khi code.**

---

## PHASE 3 — IMPLEMENTATION

### Nguyên tắc bắt buộc

**Về code quality:**
- Backend là **JavaScript ES Modules** (không phải TypeScript) — giữ đúng convention hiện tại
- Frontend là **TypeScript** — giữ strict typing
- Validation dùng **Zod** — không dùng class-validator
- DB query dùng **parameterized SQL** ($1, $2) — không string concatenation
- Không xóa test/code có sẵn
- Match existing code style (2-space indent, single quotes, etc.)

**Về database:**
- Schema changes → thêm ALTER vào file mới `db/alter_xxx.sql`, KHÔNG sửa schema.sql
- Seed data changes → thêm vào cuối seed.sql hoặc file riêng

**Về Frontend:**
- Không hardcode URL — dùng `apiClient` từ `lib/api-client.ts`
- State management qua `data/store.ts` (Zustand) + `data/api.ts` (API clients)
- Components follow existing pattern: inline styles + CSS custom properties (`var(--ink)`, `var(--accent)`, etc.)
- Import icons từ `components/shared/Icon.tsx`

---

### 3A. Verify Auth (không cần sửa — đã hoạt động)

```bash
# Reset DB + seed:
# Trong Docker/psql:
psql -U postgres -d badminton_tournament < db/schema.sql
psql -U postgres -d badminton_tournament < db/seed.sql

# Start backend:
cd back-end && npm run dev

# Test login:
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shuttleops.vn","password":"admin123"}' | jq .

# Test me:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shuttleops.vn","password":"admin123"}' | jq -r '.data.token')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me | jq .
```

---

### 3B. Fix Bracket (Multi-Round Draw)

Hiện tại `generateRandomDraw()` chỉ tạo matches vòng 1.

**Cách fix đơn giản nhất (adapter approach):**
- Giữ nguyên logic vòng 1
- Tạo thêm matches placeholder cho vòng 2+ (không có participants — sẽ fill khi vòng 1 xong)
- Hoặc: khi `completeMatch`, tự tạo match vòng tiếp theo + gán winner vào

```javascript
// competition.service.js — thêm logic khi complete match:
// 1. Tìm match cùng event, round tiếp theo
// 2. Nếu chưa có, tạo mới
// 3. Gán winner vào side A hoặc B
```

---

### 3C. Add Socket.IO Server

```bash
cd back-end && npm install socket.io
```

```javascript
// server.js — thêm sau khi tạo app:
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

const httpServer = createServer(app);
const io = new SocketServer(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-match', (matchId) => socket.join(`match-${matchId}`));
});

// Export io để các service dùng:
export { io };

// Thay app.listen bằng:
httpServer.listen(port, ...);
```

```javascript
// competition.service.js — sau khi addScoreEvent:
// import { io } from '../../server.js';   // hoặc singleton pattern
// io.to(`match-${matchId}`).emit('score-update', scoreData);
```

---

### 3D. Verify Registration E2E

```bash
# Login as athlete:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenhaidang@shuttleops.vn","password":"vdv123"}' | jq -r '.data.token')

# List events in tournament:
curl -s http://localhost:3000/api/tournaments/1/events | jq .

# Register for an event:
curl -s -X POST http://localhost:3000/api/participation/events/1/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId": 1}' | jq .
```

---

## PHASE 4 — WRITE CLAUDE.md

Sau khi fix xong, **THAY THẾ** nội dung CLAUDE.md hiện tại bằng thông tin project-specific:

```markdown
# CLAUDE.md — ShuttleOps: Badminton Tournament Management System

## Quick Start
\`\`\`bash
# 1. Start PostgreSQL (via Docker):
docker-compose up -d postgres

# 2. Initialize database:
# Connect to postgres container and run:
psql -U postgres -d badminton_tournament < db/schema.sql
psql -U postgres -d badminton_tournament < db/seed.sql

# 3. Start backend:
cd back-end && cp .env.example .env && npm install && npm run dev
# → http://localhost:3000  (API)
# → http://localhost:3000/api/docs  (Swagger)

# 4. Start frontend:
cd front-end && cp .env.example .env && npm install && npm run dev
# → http://localhost:5173
\`\`\`

## Architecture
- **Backend**: Express.js 5 (ESM) + raw pg + Zod + JWT
- **Frontend**: React 19 + Vite 8 + Zustand + React Query + TailwindCSS v4
- **Database**: PostgreSQL 16 (schema.sql, no ORM)
- **Ports**: Backend 3000, Frontend 5173, Postgres 5433, Redis 16379

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shuttleops.vn | admin123 |
| BTC | phamlam@shuttleops.vn | btc123 |
| Referee | lequanghuy@shuttleops.vn | ref123 |
| Athlete | nguyenhaidang@shuttleops.vn | vdv123 |
| Coach | truongdoan@shuttleops.vn | vdv123 |
| Spectator | khangia@shuttleops.vn | fan123 |

## Backend Module Pattern
Each module in `src/modules/<name>/` has 4 files:
- `<name>.routes.js` — Express Router with middleware
- `<name>.controller.js` — Request handlers (try/catch → next(error))
- `<name>.service.js` — Business logic (raw SQL queries)
- `<name>.schema.js` — Zod validation schemas

## Frontend State Pattern
- Auth: `data/auth.tsx` → React Context + localStorage token
- API: `data/api.ts` → Axios clients matching backend routes
- Store: `data/store.ts` → Zustand store + fetch* functions
- API Client: `lib/api-client.ts` → Axios instance with auth interceptor

## Module Status
| Module | Backend | Frontend | Notes |
|--------|---------|----------|-------|
| auth | ✅ | ✅ | Login, Register, OTP(mock), RBAC |
| tournament | ✅ | ✅ | CRUD + Dashboard + Events + Courts |
| competition | ✅ | ✅ | Matches + Scoring + Draw (round 1 only) |
| people | ✅ | ✅ | Players, Coaches, Referees, Clubs |
| participation | ✅ | ✅ | Registration + Status + Seeding |
| payment | ✅ | ✅ | Mock only (no real gateway) |
| notification | ✅ | ✅ | in_app only |
| reporting | ✅ | ✅ | Inventory, News, Activity Log, Leaderboard |

## Known Issues
1. WebSocket server not implemented (live scoring = HTTP only)
2. Draw only generates round 1 matches
3. No refresh token / logout endpoint
4. OTP verification is mocked (hardcoded 123456)
5. Zero test coverage
6. Redis running but unused

## Code Conventions
- Backend: JavaScript ESM, 2-space indent, single quotes
- Frontend: TypeScript, 2-space indent, single quotes
- CSS: TailwindCSS v4 + CSS custom properties (var(--ink), var(--accent), etc.)
- SQL: Parameterized queries ($1, $2...), no string concat
- Validation: Zod schemas (not class-validator)
```

---

## PHASE 5 — FINAL DEMO VERIFICATION

```bash
# 1. Start all services
docker-compose up -d postgres
cd back-end && npm run dev &
cd front-end && npm run dev &

# 2. Verify backend health
curl http://localhost:3000/health | jq .

# 3. Verify auth flow
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shuttleops.vn","password":"admin123"}' | jq -r '.data.token')
echo "Token: $TOKEN"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me | jq .

# 4. Verify tournament
curl -s http://localhost:3000/api/tournaments | jq .

# 5. Verify matches
curl -s "http://localhost:3000/api/competition/matches?tournament_id=1" | jq .

# 6. Frontend loads
# Mở http://localhost:5173 → AuthScreen → login với admin@shuttleops.vn / admin123
```

**Demo Script 5 phút:**
1. Mở browser → thấy AuthScreen → login BTC (phamlam@shuttleops.vn / btc123)
2. Vào Giải đấu → chọn "Giải Cầu Lông Các CLB Toàn Quốc 2026"
3. Xem Dashboard → thấy stats, courts, live matches
4. Vào Bảng đấu → generate draw cho event → thấy bracket
5. Mở tab mới login Referee (lequanghuy@shuttleops.vn / ref123) → chọn giải → vào Lịch thi đấu → chọn trận live → ghi điểm
6. Login Athlete (nguyenhaidang@shuttleops.vn / vdv123) → xem tổng quan → đăng ký thi đấu
```

---

## Open Questions

> [!IMPORTANT]
> **Cần bạn xác nhận trước khi thực hiện:**

1. **Bracket multi-round:** Bạn muốn tạo full bracket structure (vòng 2, bán kết, chung kết) khi generate draw, hay chỉ cần auto-advance winner khi complete match?

2. **WebSocket:** Có cần thiết cho demo không? Nếu không, có thể thêm auto-refresh mỗi 5s trên LiveMatchesView thay cho WebSocket.

3. **Scope ưu tiên:** Trong danh sách P1, bạn muốn focus vào fix gì trước?
   - (a) Bracket multi-round
   - (b) WebSocket live scoring
   - (c) Verify + fix UX issues trên các màn hình chi tiết
   - (d) Tất cả theo thứ tự

4. **Frontend UX:** Bạn muốn kiểm tra/cải thiện cụ thể screens nào? Ví dụ:
   - Filters trên danh sách VĐV/matches?
   - Màn hình chi tiết giải đấu/trận đấu?
   - Mobile responsive?
   - Loading/empty states?

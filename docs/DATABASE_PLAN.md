# Plan triển khai Database — CNPM Badminton Tournament

> Bản cập nhật theo cấu trúc **8 module** thống nhất với plan của nhóm.
> Stack: **PostgreSQL 16 + Prisma** (đề xuất; có thể đổi sang Knex nếu giáo viên yêu cầu SQL tay).
> File DDL SQL đầy đủ: `back-end/db/schema.sql`. Seed dữ liệu mẫu: `back-end/db/seed.sql`.
> Thư mục `docs/` chỉ giữ tài liệu/ERD/API docs; SQL chạy thật đặt trong `back-end/db/`.

---

## 0. Tóm tắt phân công

| Người | Module phụ trách |
|---|---|
| Người 1 | **M4 Competition** + **M5 Participation** |
| Người 2 | **M1 Auth** + **M7 Payment** + **M8 Reporting** (kèm Inventory, News, ActivityLog) |
| Người 3 | **M2 People** + **M3 Tournament** (kèm Court) + **M6 Notification** |

---

## 1. Quy ước chung

- **DBMS:** PostgreSQL 16.
- **Naming:** `snake_case` cho bảng/cột.
- **Khóa chính:** `BIGSERIAL` cho hầu hết bảng; `CHAR(2)` cho `categories.code`.
- **Audit:** Mọi bảng nghiệp vụ có `created_at TIMESTAMPTZ DEFAULT now()`, bảng có sửa đổi thêm `updated_at` + trigger.
- **Ràng buộc:** Dùng `ENUM` thật của PostgreSQL cho status/role; `CHECK` cho các invariant.
- **Soft delete:** Dùng cột `deleted_at TIMESTAMPTZ NULL` ở bảng nhạy cảm (user, athlete, match). Các bảng tra cứu (court, news) hard delete.
- **Index:** Index trên mọi FK; composite index cho các truy vấn lọc thường dùng.

---

## 2. Module 1 — Authentication & Authorization (Người 2)

### Thực thể
- `users` — tài khoản đăng nhập (mọi role)
- `roles` — bảng tra cứu vai trò (admin, btc, referee, athlete, spectator)
- `user_roles` — N–N user ↔ role (1 user có thể có nhiều role: VĐV kiêm trọng tài)
- `permissions` *(optional)* — quyền chi tiết, ví dụ `match.score.write`
- `role_permissions` *(optional)* — N–N role ↔ permission

### Bảng chính
```text
users(id PK, email UNIQUE, phone UNIQUE NULL, password_hash, name,
      primary_role_id FK→roles,
      status ENUM(approved,pending,rejected,incomplete),
      requested_role_id FK→roles NULL,
      note, created_at, updated_at, deleted_at)

roles(id PK, code UNIQUE, label)
user_roles(user_id, role_id, PK(user_id, role_id))
permissions(id PK, code UNIQUE, label)
role_permissions(role_id, permission_id, PK(role_id, permission_id))
```

### API gợi ý
`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/admin/users/:id/approve`, `PUT /api/admin/users/:id/role`.

### Lưu ý
- Mật khẩu hash bằng **bcrypt** (cost 10–12); không bao giờ lưu plain text.
- JWT (access 15p + refresh 7d) hoặc session cookie httpOnly. Plan này dùng JWT cho đơn giản.

---

## 3. Module 2 — People Management (Người 3)

### Thực thể
- `clubs` — đơn vị/tỉnh/CLB (Hà Nội, TP.HCM, CAND, Quân Đội, Becamex…). **Đổi tên từ "Team" để tránh xung đột nghĩa với "đội đôi" ở Module 4.**
- `players` — VĐV (gồm trường rating, tier, status hồ sơ)
- `coaches` — HLV
- `referees` — Trọng tài (có cert ENUM A/B)
- Cả 3 đều có FK tùy chọn → `users` (1 người có thể có tài khoản hoặc chưa)

### Bảng chính
```text
clubs(id PK, code UNIQUE, name, province, created_at)

players(id PK, user_id FK→users NULL, club_id FK→clubs, name,
        gender ENUM(M,F), dob DATE, rating INT, tier CHAR(1),
        profile_status ENUM(approved,pending,incomplete),
        note, created_at, updated_at, deleted_at)

coaches(id PK, user_id FK→users NULL, club_id FK→clubs,
        name, phone, created_at)

referees(id PK, user_id FK→users NULL, name, cert ENUM(QG_A,QG_B),
         phone, created_at)
```

### API gợi ý
CRUD `players`/`coaches`/`referees`, `PUT /api/players/:id/approve|reject`, `GET /api/clubs?province=...`.

---

## 4. Module 3 — Tournament Management (Người 3)

### Thực thể
- `tournaments` — giải đấu (tên, ngày, địa điểm, ngân sách, status)
- `events` — **nội dung thi đấu cụ thể của 1 giải** (vd. "MS — Đơn nam giải VNBAD-2026"). Mỗi event thuộc 1 tournament + 1 category, có cấu hình riêng (số set, điểm tối đa). **Thay cho thiết kế cũ chỉ có `categories` tĩnh.**
- `categories` — bảng tra cứu loại nội dung (MS, WS, MD, WD, XD)
- `venues` — địa điểm tổ chức (sau này có thể tách nhà thi đấu)
- `courts` — **sân đấu trong giải** (mỗi tournament có nhiều sân). Bổ sung vì UI BTC có view "Sân đấu".

### Bảng chính
```text
categories(code PK CHAR(2), label, is_doubles BOOL)

venues(id PK, name, address, province)

tournaments(id PK, code UNIQUE, name, name_en,
            venue_id FK→venues, start_date, end_date,
            status ENUM(draft,live,finished,cancelled),
            format, budget BIGINT, revenue BIGINT,
            created_at, updated_at)

events(id PK, tournament_id FK, category_code FK,
       label, max_sets INT DEFAULT 3, points_per_set INT DEFAULT 21,
       UNIQUE(tournament_id, category_code))

courts(id PK, tournament_id FK, label, floor,
       status ENUM(live,idle,maintenance), updated_at)
```

### API gợi ý
`GET /api/tournaments`, `POST /api/tournaments` (admin), `GET /api/tournaments/:id/events`, `PATCH /api/courts/:id`.

---

## 5. Module 4 — Competition Core (Người 1)

### Thực thể
- `matches` — trận đấu (thuộc 1 event, có court, referee, time, status, winner)
- `match_participants` — bên A / bên B của trận. **Đơn = 1 row/side, đôi = 2 row/side.** Thay cho việc tạo bảng `teams` phụ.
- `match_sets` — từng set (set_no, score_a, score_b, winner)
- `score_events` — **lịch sử ghi điểm cho chức năng UNDO**. Bắt buộc thêm vì UI có nút Undo (xem `useMatch.ts`).

### Bảng chính
```text
matches(id PK, code UNIQUE, event_id FK→events,
        round, court_id FK→courts NULL, referee_id FK→referees NULL,
        scheduled_at TIMESTAMPTZ, started_at TIMESTAMPTZ NULL,
        ended_at TIMESTAMPTZ NULL,
        status ENUM(upcoming,live,completed,cancelled),
        winner_side ENUM(A,B) NULL,
        created_at, updated_at, deleted_at)

match_participants(id PK, match_id FK, side ENUM(A,B),
                   player_id FK→players,
                   seed INT NULL,
                   UNIQUE(match_id, side, player_id))

match_sets(id PK, match_id FK, set_no INT,
           score_a INT DEFAULT 0, score_b INT DEFAULT 0,
           winner ENUM(A,B) NULL,
           UNIQUE(match_id, set_no))

score_events(id PK, match_id FK, set_no INT,
             scorer ENUM(A,B),
             prev_score_a INT, prev_score_b INT,
             prev_serving ENUM(A,B),
             caused_set_end BOOL,
             created_at TIMESTAMPTZ)
```

### Logic nghiệp vụ
1. Trọng tài bấm cộng điểm → INSERT 1 row `score_events`, UPDATE `match_sets.score_a/b`.
2. Khi 1 bên đạt `points_per_set` (mặc định 21) và chênh ≥ 2 → set kết thúc → set `match_sets.winner`, tạo set mới.
3. Bên nào thắng `ceil(max_sets/2)` set trước → match `completed`, set `winner_side`.
4. Undo → lấy row mới nhất của `score_events`, rollback `match_sets`, DELETE row đó.

### API gợi ý
`POST /api/matches`, `POST /api/matches/:id/score` (body: `{scorer: 'A'|'B'}`), `POST /api/matches/:id/undo`, `GET /api/matches?status=live`.

---

## 6. Module 5 — Participation / Registration (Người 1)

### Thực thể
- `event_participants` — đăng ký 1 player (hoặc cặp đôi) vào 1 event của 1 giải, có seed.
- Đối với đôi: 2 row cùng `partnership_key` (UUID nội bộ) để gom thành 1 cặp.

### Bảng chính
```text
event_participants(id PK, event_id FK→events, player_id FK→players,
                   partner_id FK→players NULL,
                   seed INT NULL,
                   status ENUM(registered,checked_in,withdrawn),
                   registered_at TIMESTAMPTZ DEFAULT now(),
                   UNIQUE(event_id, player_id))
```

### Logic
- Đôi: 2 row giống nhau ở `event_id`, cross-reference qua `partner_id`. Có thể CHECK partner ↔ player phải reciprocal.
- Trước khi tạo bracket (Module 4), Module 5 phải có đủ participants.

### API gợi ý
`POST /api/events/:id/register`, `GET /api/events/:id/participants`, `POST /api/events/:id/seeding` (BTC chốt hạt giống).

---

## 7. Module 6 — Notification (Người 3)

### Thực thể
- `notification_templates` — mẫu thông báo (subject, body, biến thay thế)
- `notifications` — bản ghi gửi đến 1 user, với channel (in-app / email / sms)

### Bảng chính
```text
notification_templates(id PK, code UNIQUE, channel ENUM(in_app,email,sms),
                       subject, body_template, created_at)

notifications(id PK, user_id FK→users, template_id FK→notification_templates NULL,
              channel ENUM(in_app,email,sms),
              subject, body,
              status ENUM(pending,sent,failed,read),
              sent_at TIMESTAMPTZ NULL,
              read_at TIMESTAMPTZ NULL,
              meta JSONB DEFAULT '{}'::jsonb,
              created_at)
```

### Sự kiện trigger gửi notification
- Đăng ký tài khoản → "Hồ sơ chờ duyệt"
- BTC duyệt/từ chối → "Hồ sơ được duyệt / Bị từ chối"
- Lịch trận mới → "Bạn có trận vào 15:30 sân 4"
- Kho vật tư critical → "Cảnh báo tồn kho thấp" (tới BTC)

---

## 8. Module 7 — Payment (Người 2)

### Thực thể
- `payments` — bản ghi 1 lần thanh toán (lệ phí đăng ký, tài trợ thu vào)
- `payment_transactions` — chi tiết giao dịch với cổng thanh toán (VNPay, Momo, chuyển khoản, tiền mặt)

### Bảng chính
```text
payments(id PK, code UNIQUE, user_id FK→users NULL,
         event_participant_id FK→event_participants NULL,
         amount BIGINT, currency CHAR(3) DEFAULT 'VND',
         purpose ENUM(registration_fee,sponsor,refund,prize,other),
         status ENUM(pending,paid,failed,refunded),
         created_at, paid_at TIMESTAMPTZ NULL)

payment_transactions(id PK, payment_id FK→payments,
                     gateway ENUM(vnpay,momo,bank_transfer,cash),
                     gateway_txn_id VARCHAR(128) UNIQUE,
                     amount BIGINT,
                     status ENUM(pending,success,failed),
                     raw_response JSONB,
                     created_at)
```

### Lưu ý
- 1 `payment` có thể có nhiều `payment_transactions` (retry).
- Sponsor thu vào và prize chi ra cùng lưu ở đây để dễ làm Reporting tổng hợp.

---

## 9. Module 8 — Reporting + Ops phụ trợ (Người 2)

> Module 8 gốc chỉ có Report template. Tôi gộp thêm **Inventory, News, ActivityLog** vào đây vì 3 cái này UI BTC đều có và đều phục vụ dashboard/báo cáo.

### Thực thể
- `report_templates` — định nghĩa báo cáo (loại, SQL view, tham số)
- `inventory_items` — kho vật tư (cầu, dây, khăn)
- `inventory_issues` — cấp phát vật tư cho trận
- `news` — bài đăng tin tức
- `activity_log` — nhật ký mọi mutation

### Bảng chính
```text
report_templates(id PK, code UNIQUE, title, description,
                 query_sql TEXT, params_schema JSONB, created_at)

inventory_items(sku PK, name, unit, stock INT, min_stock INT, issued INT,
                status ENUM(ok,warn,critical) GENERATED ALWAYS AS (...) STORED,
                updated_at)

inventory_issues(id PK, sku FK→inventory_items, match_id FK→matches NULL,
                 qty INT CHECK (qty > 0),
                 issued_by FK→users,
                 issued_at TIMESTAMPTZ DEFAULT now())

news(id PK, tournament_id FK→tournaments NULL,
     title, body TEXT, tag VARCHAR(32),
     published_at TIMESTAMPTZ,
     created_by FK→users, created_at)

activity_log(id PK, actor_user_id FK→users NULL,
             action VARCHAR(64), target_type VARCHAR(32), target_id BIGINT,
             message TEXT, meta JSONB DEFAULT '{}'::jsonb,
             created_at TIMESTAMPTZ DEFAULT now())
```

### Báo cáo cần có
- Doanh thu/chi phí theo tournament (sum `payments` theo `purpose`).
- Tỉ lệ trận hoàn thành theo ngày.
- Tồn kho hiện tại + danh sách critical.
- Hoạt động trọng tài (matches/đã chấm).
- BXH VĐV (rút từ matches đã hoàn tất).

---

## 10. Bảng tổng hợp 23 bảng

| # | Bảng | Module | Người |
|---|---|---|---|
| 1 | users | M1 | 2 |
| 2 | roles | M1 | 2 |
| 3 | user_roles | M1 | 2 |
| 4 | permissions | M1 (opt) | 2 |
| 5 | role_permissions | M1 (opt) | 2 |
| 6 | clubs | M2 | 3 |
| 7 | players | M2 | 3 |
| 8 | coaches | M2 | 3 |
| 9 | referees | M2 | 3 |
| 10 | categories | M3 | 3 |
| 11 | venues | M3 | 3 |
| 12 | tournaments | M3 | 3 |
| 13 | events | M3 | 3 |
| 14 | courts | M3 | 3 |
| 15 | matches | M4 | 1 |
| 16 | match_participants | M4 | 1 |
| 17 | match_sets | M4 | 1 |
| 18 | score_events | M4 | 1 |
| 19 | event_participants | M5 | 1 |
| 20 | notification_templates | M6 | 3 |
| 21 | notifications | M6 | 3 |
| 22 | payments | M7 | 2 |
| 23 | payment_transactions | M7 | 2 |
| 24 | report_templates | M8 | 2 |
| 25 | inventory_items | M8 | 2 |
| 26 | inventory_issues | M8 | 2 |
| 27 | news | M8 | 2 |
| 28 | activity_log | M8 | 2 |

→ Tổng **28 bảng**.

---

## 11. Sơ đồ phụ thuộc (cao → thấp)

```text
Tầng tra cứu:      categories · roles · permissions · venues · report_templates · notification_templates
Tầng người dùng:   users → user_roles · clubs → players/coaches/referees
Tầng giải đấu:     tournaments → events · tournaments → courts
Tầng đăng ký:      events → event_participants
Tầng thi đấu:      events + courts + referees → matches → match_participants/match_sets/score_events
Tầng tài chính:    event_participants → payments → payment_transactions
Tầng vận hành:     matches → inventory_issues; users → news; users/matches → activity_log; users → notifications
```

**Thứ tự CREATE TABLE đúng phụ thuộc** đã được sắp xếp trong file `schema.sql`.

---

## 12. Roadmap (4 tuần, song song 3 người)

| Tuần | Người 1 (M4+M5) | Người 2 (M1+M7+M8) | Người 3 (M2+M3+M6) |
|---|---|---|---|
| 1 | Setup PG+Prisma chung; viết schema M4/M5 | Schema M1 + bcrypt + JWT | Schema M2 + M3 |
| 2 | API matches + score + undo | API auth + middleware role | API players/clubs + tournaments/events/courts |
| 3 | Bracket generate; participation seed | Payment VNPay sandbox | Notification (in-app trước) |
| 4 | Test E2E match flow | Inventory + Report + Log | Hoàn thiện, hỗ trợ test |

**Checkpoint Tuần 1 (quan trọng):** chốt schema xong, migration đầu chạy clean, seed user mẫu chạy được. Nếu schema còn đổi sau tuần 1 sẽ rất tốn công.

---

## 13. Risk cần chốt sớm

| # | Vấn đề | Quyết định gợi ý |
|---|---|---|
| R1 | Đôi nam nữ (XD) — ràng buộc 1 nam + 1 nữ ở `event_participants`? | App-level validation (đơn giản); DB CHECK qua trigger nếu cần. |
| R2 | Live score real-time? | Polling 5s ở Sprint 4, WebSocket nếu kịp. |
| R3 | Sponsor và prize có nên cùng bảng `payments`? | Có — phân biệt qua `purpose`. Report dễ. |
| R4 | Notification gửi thật (email/SMS) hay chỉ in-app? | Demo cuối kỳ: in-app + log. Email/SMS để mock. |
| R5 | Multi-tenant (nhiều giải song song)? | Mọi bảng nghiệp vụ FK về `tournaments` hoặc `events`. Đã có sẵn. |

---

## 14. Bước tiếp theo

- (a) `back-end/db/schema.sql` đã viết sẵn DDL cho toàn bộ 28 bảng → import vào pgAdmin để xem.
- (b) `back-end/db/seed.sql` chứa dữ liệu mẫu rút từ `legacy.ts` của front-end.
- (c) SQL chạy thật được tách khỏi `docs/`; thư mục này chỉ giữ tài liệu/ERD/API docs.
- (d) Khi nhóm thống nhất, mình có thể chuyển sang Prisma schema và migration.

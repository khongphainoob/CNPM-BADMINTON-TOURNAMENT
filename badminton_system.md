# 🏸 Hệ thống Quản lý Giải đấu Cầu lông Quốc gia
> **National Badminton Tournament Management System**  
> Phiên bản tài liệu: v2.1 | Cập nhật: 2025  
> Stack: Express.js · PostgreSQL 16 · Next.js · Redis · Socket.IO

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Yêu cầu chức năng (FR)](#2-yêu-cầu-chức-năng-fr)
3. [Yêu cầu phi chức năng (NFR)](#3-yêu-cầu-phi-chức-năng-nfr)
4. [Thiết kế hệ thống (System Design)](#4-thiết-kế-hệ-thống-system-design)
5. [Thiết kế cơ sở dữ liệu (Database Design)](#5-thiết-kế-cơ-sở-dữ-liệu-database-design)
6. [Class Diagram](#6-class-diagram)
7. [API Design](#7-api-design)
8. [Bảng tham số hệ thống](#8-bảng-tham-số-hệ-thống)

---

## 1. Tổng quan hệ thống

### 1.1 Giới thiệu

Hệ thống Quản lý Giải đấu Cầu lông Quốc gia là nền tảng phần mềm phục vụ việc tổ chức, vận hành và theo dõi các giải đấu cầu lông cấp quốc gia tại Việt Nam. Hệ thống hỗ trợ đầy đủ vòng đời của một giải đấu: từ khởi tạo, đăng ký, thi đấu đến báo cáo pháp lý.

### 1.2 Stakeholders

| Actor | Vai trò | Quyền hạn chính |
|---|---|---|
| **Admin** | Quản trị viên hệ thống | Toàn quyền hệ thống, quản lý tài khoản, cấu hình tham số |
| **BTC (Ban tổ chức)** | Tổ chức giải đấu | Tạo giải, duyệt hồ sơ, xếp lịch, xuất báo cáo |
| **VĐV (Vận động viên)** | Thi đấu | Đăng ký thi đấu, xem lịch, xem kết quả |
| **HLV (Huấn luyện viên)** | Hỗ trợ VĐV | Xem thông tin VĐV, theo dõi kết quả |
| **Trọng tài** | Điều hành trận đấu | Ghi điểm, xác nhận kết quả |
| **Khán giả** | Theo dõi | Xem lịch, kết quả, bảng xếp hạng (không cần đăng nhập) |

### 1.3 Phạm vi hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG QUẢN LÝ GIẢI ĐẤU                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  │   IAM    │  │   CMS    │  │Tournament│  │  People  │   │
│  │  (Auth)  │  │(Nội dung)│  │ (Giải)  │  │  (VĐV)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  │ Register │  │Competition│  │  Score  │  │ Payment  │   │
│  │ (Đăng ký)│  │ (Bracket)│  │(Ghi điểm)│  │(Thanh toán│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  │Notification│  │ Offline │  │ Report  │  │  Config  │   │
│  │(Thông báo)│  │  Sync   │  │(Báo cáo) │  │(Tham số) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Yêu cầu chức năng (FR)

### FR-01: Module Xác thực & Phân quyền (IAM)

#### FR-01.1 Đăng ký tài khoản
- **Mô tả:** Người dùng mới có thể tự đăng ký tài khoản với email hoặc số điện thoại.
- **Luồng chính:**
  1. Người dùng điền form: họ tên, email, SĐT, mật khẩu, xác nhận mật khẩu, vai trò đăng ký.
  2. Hệ thống validate: email/SĐT chưa tồn tại, mật khẩu đủ mạnh (≥8 ký tự, có chữ hoa, số, ký tự đặc biệt).
  3. Hệ thống tạo tài khoản với `status = pending`, gửi OTP xác thực qua email/SMS.
  4. Người dùng nhập OTP → tài khoản chuyển sang `status = active`.
- **Ngoại lệ:** Email/SĐT đã tồn tại → báo lỗi. OTP sai quá 5 lần → khóa phiên.

#### FR-01.2 Đăng nhập
- **Mô tả:** Người dùng đăng nhập bằng email/SĐT và mật khẩu.
- **Luồng chính:**
  1. Nhập email/SĐT + mật khẩu.
  2. Hệ thống xác thực, trả về Access Token (JWT, TTL 15 phút) + Refresh Token (TTL 30 ngày).
  3. Client lưu token, đính kèm vào mọi request tiếp theo.
- **Ràng buộc:** Tối đa 5 lần sai/phút → tài khoản bị tạm khóa 15 phút.

#### FR-01.3 Xác thực OTP
- **Mô tả:** Xác thực danh tính qua mã OTP 6 chữ số.
- **Quy tắc:**
  - OTP hiệu lực 5 phút.
  - Tối đa 5 lần nhập sai → OTP bị hủy.
  - Tối đa 3 lần gửi lại/phiên, chờ 60 giây giữa 2 lần.
  - Kênh: email hoặc SMS.

#### FR-01.4 Phân quyền RBAC
- **Mô tả:** Hệ thống phân quyền theo vai trò (Role-Based Access Control).
- **Roles:** `admin`, `btc`, `referee`, `player`, `audience`
- **Luồng:** User → UserRole → Role → RolePermission → Permission → Resource
- **Ràng buộc:** 1 user có thể có nhiều role. UNIQUE(user_id, role_id).

#### FR-01.5 Quản lý phiên đăng nhập
- **Mô tả:** Refresh Token tự động gia hạn khi hết hạn.
- **Logout:** Thu hồi Refresh Token (is_revoked = true).
- **Quản lý thiết bị:** Lưu device_info, cho phép đăng xuất từ xa.

---

### FR-02: Module Quản lý Nội dung (CMS)

#### FR-02.1 Quản lý bài viết / tin tức
- **Mô tả:** BTC/Admin tạo, chỉnh sửa, xóa bài viết về giải đấu.
- **Trạng thái bài viết:** `draft` → `published` → `archived`
- **Tính năng:**
  - Soạn thảo nội dung HTML (có XSS sanitization).
  - Upload thumbnail.
  - Gắn tag, tự động sinh slug từ tiêu đề.
  - Lên lịch xuất bản.

#### FR-02.2 Quản lý tag
- **Mô tả:** Tạo, sửa, xóa tag. Gắn nhiều tag cho 1 bài viết (N-N qua `article_tag_map`).

---

### FR-03: Module Quản lý Giải đấu

#### FR-03.1 Khởi tạo giải đấu
- **Mô tả:** BTC tạo hồ sơ giải đấu mới.
- **Thông tin cần thiết:**
  - Tên giải, đơn vị tổ chức, mô tả.
  - Ngày bắt đầu, ngày kết thúc (start_date ≤ end_date).
  - Banner, file thể lệ (URL).
  - Slug tự động sinh, phải duy nhất.
- **Trạng thái ban đầu:** `draft`

#### FR-03.2 Vòng đời trạng thái giải
```
draft → open_registration → ongoing → finished
                                    ↘ cancelled
```
- Mọi chuyển trạng thái được ghi vào `tournament_status_log`.
- Hệ thống tự động gửi thông báo đến tất cả actors liên quan khi đổi trạng thái.
- `display_status` ánh xạ: `open_registration` → "Mở đăng ký", `ongoing` → "Thi đấu", `finished` → "Kết thúc".

#### FR-03.3 Cấu hình nội dung thi đấu (Event)
- **Mô tả:** Mỗi giải có nhiều nội dung thi đấu (hạng mục).
- **Thuộc tính Event:**

| Thuộc tính | Giá trị hợp lệ |
|---|---|
| `discipline` | `singles` / `doubles` / `mixed_doubles` |
| `gender` | `male` / `female` / `mixed` / `open` |
| `format_type` | `round_robin` / `single_elimination` / `group_knockout` |
| `age_group` | `U17` / `U21` / `Open` / `Senior` / `Masters` |

- **Ràng buộc:** Nếu `discipline = mixed_doubles` thì hai VĐV đăng ký phải khác giới.

#### FR-03.4 Quản lý địa điểm & sân
- **Mô tả:** Mỗi giải có thể có nhiều địa điểm thi đấu (venue), mỗi venue có nhiều sân (court).
- **Trạng thái sân:** `available` / `in_use` / `maintenance`
- **Ràng buộc lịch:** Không xếp 2 trận cùng sân cùng giờ. Khoảng cách tối thiểu giữa 2 trận trên cùng 1 sân: 30 phút.

#### FR-03.5 Đăng ký đoàn thi đấu (Team)
- **Mô tả:** CLB/tỉnh/đơn vị đăng ký tham gia giải.
- **Bảng:** `tournament_team_registrations` — UNIQUE(tournament_id, team_id).
- **Trạng thái:** `pending` / `approved` / `rejected`

---

### FR-04: Module Quản lý Người tham gia

#### FR-04.1 Quản lý VĐV (Player)
- **Mô tả:** CRUD thông tin vận động viên.
- **Thông tin:** Họ tên, ngày sinh, giới tính, số CCCD (UNIQUE), ảnh CCCD, ảnh 3×4.
- **Liên kết tài khoản:** `POST /players/:id/link-user` gán player → user.
- **Trạng thái:** `active` / `suspended` / `retired`

#### FR-04.2 Quản lý HLV (Coach)
- **Mô tả:** CRUD thông tin huấn luyện viên, liên kết với CLB.
- **Thông tin bổ sung:** Số giấy phép HLV (UNIQUE), ngày sinh, giới tính.

#### FR-04.3 Quản lý Trọng tài (Referee)
- **Mô tả:** CRUD thông tin trọng tài.
- **Chứng chỉ:** `QG_A` / `QG_B` (cấp quốc gia)
- **Ràng buộc phân công:** ≤4 trận/ngày, không trùng giờ, không cùng CLB với VĐV.

---

### FR-05: Module Đăng ký Thi đấu

#### FR-05.1 VĐV đăng ký nội dung
- **Mô tả:** VĐV đăng ký tham gia một hoặc nhiều nội dung thi đấu trong giải.
- **Luồng:**
  1. VĐV chọn nội dung → điền thông tin → nộp hồ sơ.
  2. Hệ thống validate ràng buộc đơn/đôi.
  3. Tạo `event_entry` với `status = pending`.
  4. Gửi email xác nhận đã nhận hồ sơ.
- **Ràng buộc CHECK trong DB:**
```sql
CHECK (
  (entry_type = 'individual' AND player2_id IS NULL)
  OR
  (entry_type = 'pair' AND player2_id IS NOT NULL)
)
```
- **Ràng buộc mixed_doubles:** Kiểm tra `players.gender` của player1 ≠ player2 ở tầng Service.

#### FR-05.2 Duyệt hồ sơ
- **Mô tả:** BTC/Admin duyệt từng hồ sơ đăng ký.
- **Quyết định:** `approve` / `reject` / `request_supplement`
- **Trạng thái entry:** `pending` → `approved` / `rejected` / `supplement_required`
- **Ràng buộc:** Khi `rejected`, cột `rejection_reason` NOT NULL.

#### FR-05.3 Tiếp nhận hồ sơ
- **Mô tả:** Ghi nhận thông tin người tiếp nhận hồ sơ vật lý.
- **Bảng:** `document_receipts` — lưu (received_by, received_at, completeness, notes).

#### FR-05.4 Xếp hạt giống (Seed)
- **Mô tả:** BTC gán số hạt giống cho VĐV/đội trước khi tạo bracket.
- **Tùy chọn:** Tự động xếp theo `ranking_points` nếu `seed_auto_assign = true`.

---

### FR-06: Module Thi đấu & Bracket

#### FR-06.1 Tạo sơ đồ thi đấu (Bracket)
- **Mô tả:** Hệ thống tự động tạo bracket sau khi đóng đăng ký và duyệt hồ sơ.
- **Cấu trúc phân cấp:**
```
Tournament
  └── Event (nội dung: đơn nam, đôi nữ...)
        └── Stage (giai đoạn: vòng bảng, loại trực tiếp)
              └── Group (bảng: Bảng A, Bảng B)
                    └── Round (vòng: Tứ kết, Bán kết, Chung kết)
                          └── Match (trận đấu)
                                └── MatchSet (set 1, 2, 3)
```
- **Thuật toán Single Elimination:** Xếp theo seed, BYE cho số lẻ.
- **Thuật toán Round-Robin:** Mỗi cặp VĐV gặp nhau 1 lần trong bảng.
- **Group Knockout:** Vòng bảng (round-robin) → knockout từ top của mỗi bảng.

#### FR-06.2 Điều phối lịch thi đấu
- **Mô tả:** BTC xếp lịch cụ thể cho từng trận: sân, ngày, giờ, trọng tài.
- **Ràng buộc:**
  - 1 sân không có 2 trận trùng giờ.
  - 1 VĐV không có 2 trận trùng giờ.
  - Khoảng cách tối thiểu giữa 2 trận liên tiếp: 30 phút.
- **Trạng thái lịch:** `upcoming` / `live` / `done` / `postponed`

#### FR-06.3 Phân công Trọng tài
- **Mô tả:** BTC phân công trọng tài cho từng trận qua `referee_assignments`.
- **Vai trò:** `main_referee` / `line_judge` / `service_judge`
- **Ràng buộc:**
  - Trọng tài ≤4 trận/ngày.
  - Không được trùng giờ với trận khác.
  - Không cùng CLB với VĐV tham gia trận.
  - BTC có thể hoán đổi trọng tài trước giờ đấu tối thiểu 15 phút.

#### FR-06.4 Ghi điểm (Scoring)
- **Mô tả:** Trọng tài ghi điểm từng điểm từng set qua ứng dụng mobile/web.
- **Quy tắc:**
  - Mỗi set 21 điểm, cách biệt ≥2 điểm, deuce cap tại 30 điểm.
  - Best-of-3 (mặc định) hoặc cấu hình trong `system_configs`.
  - Undo trong vòng 8 giây.
  - Ghi vào `score_events` (append-only).
- **Undo:** Thêm dòng mới với `is_undone = true`, không sửa dòng cũ.

#### FR-06.5 Xác nhận kết quả
- **Mô tả:** BTC xác nhận kết quả trận sau khi trọng tài ghi điểm.
- **Quy trình:** Trọng tài nhập → BTC duyệt (`is_validated = true`) → Hệ thống tự động cập nhật bracket và BXH.

---

### FR-07: Module Đồng bộ Offline

#### FR-07.1 Ghi điểm ngoại tuyến
- **Mô tả:** Ứng dụng trọng tài hoạt động khi không có mạng, tự đồng bộ khi có mạng lại.
- **Cơ chế:**
  1. Mọi sự kiện ghi điểm được lưu vào hàng đợi cục bộ với `client_event_id` (UUID).
  2. Khi có mạng, hàng đợi được đẩy lên server theo thứ tự `client_ts`.
  3. Server idempotent theo `client_event_id`: gửi lại không tạo bản ghi trùng.
  4. Sau sync thành công, xóa hàng đợi cục bộ.
- **Xử lý xung đột:** Chiến lược `first_wins` (giữ bản đến trước), cảnh báo BTC.
- **Phiên sync:** Ghi lại trong `sync_sessions` với `match_id` để truy vết.

---

### FR-08: Module Bảng xếp hạng & Thống kê

#### FR-08.1 Bảng xếp hạng theo nội dung
- **Mô tả:** Mỗi `event` có bảng xếp hạng riêng trong `leaderboard_entries`.
- **Hệ thống điểm:** Thắng = 3, Thua sau 3 set = 1, Thua sớm = 0.
- **Tie-break:** 1. Đối đầu trực tiếp (`head_to_head_result`) → 2. Hiệu số set → 3. Hiệu số điểm.
- **Cập nhật:** Trong vòng 3 giây sau khi trận kết thúc.

#### FR-08.2 Dashboard thống kê (BTC)
- **Nội dung:** Số trận đã hoàn tất/đang live/sắp diễn ra, số sân đang dùng, top BXH, VĐV nổi bật.
- **Refresh:** Tự động mỗi 3 giây.
- **Export:** Excel (.xlsx) / PDF.

#### FR-08.3 Cập nhật ranking VĐV
- **Mô tả:** Sau khi giải kết thúc (`status = finished`), hệ thống tự động cộng dồn `leaderboard_entries.total_points` vào `players.ranking_points`.

---

### FR-09: Module Thanh toán

#### FR-09.1 Thu lệ phí đăng ký
- **Mô tả:** VĐV thanh toán lệ phí đăng ký qua cổng thanh toán.
- **Gateway hỗ trợ:** VNPay, MoMo, chuyển khoản ngân hàng, tiền mặt.
- **Luồng:**
  1. Tạo `payment` với `status = pending`.
  2. Redirect sang cổng thanh toán.
  3. Nhận webhook callback → cập nhật `payment_transactions`.
  4. Khi thành công: `payments.status = paid`.
- **Idempotency:** UNIQUE(gateway, gateway_txn_id) chống xử lý webhook 2 lần.

#### FR-09.2 Quản lý chi phí tổ chức
- **Mô tả:** BTC nhập chứng từ chi phí, phân loại theo hạng mục ngân sách.
- **Phân loại:** `venue_rental` / `referee_fee` / `prize` / `supplies` / `marketing` / `other`
- **Phê duyệt:** `draft` → `submitted` → `approved` → `paid`
- **Cảnh báo ngân sách:** Khi `actual_spent ≥ planned × warning_ratio (85%)`.
- **Khoá cứng:** Không thể chi vượt `planned × hard_cap_ratio (100%)`.
- **Audit:** Mọi thay đổi `planned_amount` được ghi vào `budget_line_history`.

---

### FR-10: Module Thông báo

#### FR-10.1 Gửi thông báo
- **Kênh hỗ trợ:** Email / Push notification / SMS
- **Trigger tự động:**
  - Đăng ký thành công → email xác nhận.
  - Hồ sơ được duyệt/từ chối → email phản hồi.
  - Trạng thái giải thay đổi → thông báo tất cả actors.
  - Nhắc lịch thi đấu trước 30 phút.
- **Cơ chế:** Queue bất đồng bộ (BullMQ + Redis). Retry 3 lần, chờ 5 phút giữa mỗi lần.

#### FR-10.2 Quản lý template
- **Mô tả:** Admin quản lý mẫu nội dung thông báo theo kênh và ngôn ngữ (vi/en).
- **Template engine:** Handlebars (render biến động).

---

### FR-11: Module Báo cáo Pháp lý

#### FR-11.1 Xuất báo cáo
- **Loại báo cáo:** `summary` / `financial` / `attendance` / `other`
- **Format:** PDF (có checksum SHA-256) / Excel
- **Versioning:** UNIQUE(tournament_id, kind, version) — không ghi đè bản cũ.
- **Truy vết:** Lưu `params_snapshot` (JSONB) để biết tham số lọc khi xuất.
- **Submission:** Ghi `submission_code` (mã công văn) khi nộp cho cơ quan chủ quản.

---

## 3. Yêu cầu phi chức năng (NFR)

### NFR-01: Hiệu năng (Performance)

| Chỉ số | Ngưỡng |
|---|---|
| API response time (p95) | ≤ 500ms |
| API response time (p99) | ≤ 1000ms |
| Dashboard refresh latency | ≤ 3 giây |
| Score event broadcast latency | ≤ 500ms |
| BXH cập nhật sau trận kết thúc | ≤ 3 giây |
| Concurrent Users (CCU) | ≥ 5.000 |
| Database query (p95) | ≤ 100ms |

### NFR-02: Độ tin cậy (Reliability)

| Chỉ số | Ngưỡng |
|---|---|
| Uptime | ≥ 99.5% |
| RTO (Recovery Time Objective) | ≤ 30 phút |
| RPO (Recovery Point Objective) | ≤ 1 giờ |
| Backup DB | Mỗi 6 giờ (full), mỗi 30 phút (WAL) |
| Data retention | ≥ 3 năm |

### NFR-03: Bảo mật (Security)

- **Xác thực:** JWT (Access Token 15 phút, Refresh Token 30 ngày, rotation).
- **Mật khẩu:** Băm bằng BCrypt/Argon2, không lưu plaintext.
- **Giao tiếp:** HTTPS/TLS 1.3 bắt buộc.
- **Rate Limiting:** 5 lần đăng nhập sai/phút → khóa tạm.
- **Input validation:** Zod schema trên mọi endpoint.
- **SQL Injection:** Sử dụng parameterized queries, không string concatenation.
- **XSS:** Sanitize toàn bộ nội dung HTML đầu vào.
- **CORS:** Chỉ cho phép origin đã whitelist.
- **Sensitive data:** `is_sensitive = true` → ẩn giá trị trong log và API response.
- **Audit log:** Mọi hành động nhạy cảm ghi vào `audit_logs`.

### NFR-04: Khả năng mở rộng (Scalability)

- **Horizontal scaling:** Backend stateless, scale theo chiều ngang.
- **Database:** PostgreSQL với read replica cho truy vấn đọc nặng.
- **Cache:** Redis (TTL 60 giây) cho system_configs và leaderboard.
- **Queue:** BullMQ cho notification async, tránh blocking request.
- **WebSocket:** Socket.IO với Redis adapter để broadcast qua nhiều instance.

### NFR-05: Khả dụng (Availability)

- **Môi trường:** Dev / Staging / Production tách biệt.
- **Deployment:** Docker Compose (dev), Kubernetes (prod).
- **Health check:** `/health` endpoint, liveness + readiness probe.
- **Zero-downtime deploy:** Rolling update.

### NFR-06: Khả năng bảo trì (Maintainability)

- **Code style:** ESLint + Prettier, enforce bằng CI.
- **Testing:** Unit test ≥70% coverage, Integration test cho mọi API endpoint.
- **Documentation:** Swagger/OpenAPI tự động sinh từ code.
- **Migration:** Chạy migration trước deploy, rollback được.
- **Logging:** Structured JSON logging, tập trung qua ELK hoặc Loki.

### NFR-07: Khả dụng Offline

- **PWA:** Ứng dụng trọng tài hỗ trợ offline (Service Worker).
- **Queue:** Hàng đợi cục bộ tối đa 500 sự kiện.
- **Sync:** Idempotent theo `client_event_id`, tự đồng bộ khi có mạng.
- **Conflict:** Chiến lược `first_wins`, cảnh báo BTC khi có xung đột.

### NFR-08: Quốc tế hóa (i18n)

- **Ngôn ngữ hỗ trợ:** Tiếng Việt (vi) và Tiếng Anh (en).
- **Notification template:** Có `subject_vi/en` và `body_vi/en`.
- **Múi giờ:** Lưu tất cả timestamp dạng `TIMESTAMPTZ` (UTC), hiển thị theo `Asia/Ho_Chi_Minh`.

---

## 4. Thiết kế hệ thống (System Design)

### 4.1 Kiến trúc tổng thể

```
                              ┌─────────────────┐
                              │   CDN / Nginx   │
                              │  (Load Balancer)│
                              └────────┬────────┘
                                       │ HTTPS
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
      ┌────────▼────────┐    ┌─────────▼─────────┐   ┌────────▼────────┐
      │  Next.js Web    │    │   Next.js Admin    │   │  Mobile PWA     │
      │  (Public site)  │    │   (BTC Dashboard)  │   │  (Referee App)  │
      └────────┬────────┘    └─────────┬─────────┘   └────────┬────────┘
               │                       │                       │
               └───────────────────────┼───────────────────────┘
                                       │ REST API / WebSocket
                              ┌────────▼────────┐
                              │  Express.js API │
                              │  (Backend)      │
                              │                 │
                              │ ┌─────────────┐ │
                              │ │  Middleware  │ │
                              │ │ Auth·Zod·Log│ │
                              │ └─────────────┘ │
                              │                 │
                              │ ┌─────────────┐ │
                              │ │   Modules   │ │
                              │ │ auth|tour.. │ │
                              │ └─────────────┘ │
                              └──────┬──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────▼───────┐   ┌─────────▼────────┐   ┌────────▼────────┐
     │  PostgreSQL 16 │   │   Redis 7        │   │   MinIO / S3    │
     │  (Primary DB)  │   │  Cache · Queue   │   │  (File Storage) │
     │                │   │  · Sessions      │   │                 │
     └────────┬───────┘   └──────────────────┘   └─────────────────┘
              │
     ┌────────▼───────┐
     │  PostgreSQL    │
     │  (Read Replica)│
     └────────────────┘
```

### 4.2 Kiến trúc phân tầng (Layered Architecture)

```
┌────────────────────────────────────────────────────┐
│                    ROUTES LAYER                     │
│  Khai báo endpoint, gắn middleware, gọi controller │
├────────────────────────────────────────────────────┤
│                  CONTROLLER LAYER                   │
│  Nhận request, validate Zod, gọi service, trả resp │
├────────────────────────────────────────────────────┤
│                   SERVICE LAYER                     │
│  Xử lý business logic, gọi repo, throw errors      │
├────────────────────────────────────────────────────┤
│                  REPOSITORY LAYER                   │
│  Chứa câu SQL, chỉ làm việc với DB Pool            │
├────────────────────────────────────────────────────┤
│                   DATABASE LAYER                    │
│  PostgreSQL 16 · pg Pool · Parameterized queries   │
└────────────────────────────────────────────────────┘
```

**Quy tắc:**
- Routes: mỏng, chỉ khai báo endpoint và middleware.
- Controllers: validate đầu vào, không chứa business logic.
- Services: business rules, gọi nhiều repo nếu cần, throw lỗi domain.
- Repos: pure SQL, không gọi nhau, không biết về HTTP.

### 4.3 Cấu trúc thư mục Backend

```
backend/
├── src/
│   ├── server.js              # Entry point, đăng ký tất cả routes
│   ├── config/
│   │   ├── database.js        # pg Pool config
│   │   ├── redis.js           # Redis client
│   │   └── env.js             # Validate .env với Zod
│   ├── common/
│   │   ├── validateBody.js    # Middleware Zod validation
│   │   ├── parsePagination.js # Parse page/limit/offset
│   │   ├── authenticate.js    # JWT middleware
│   │   ├── authorize.js       # Role guard middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── asyncWrapper.js    # Wrap async route handlers
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repo.js
│   │   │   └── auth.schema.js   # Zod schemas
│   │   ├── tournaments/
│   │   ├── events/
│   │   ├── players/
│   │   ├── matches/
│   │   ├── bracket/
│   │   ├── payments/
│   │   ├── notifications/
│   │   └── reports/
│   ├── database/
│   │   ├── migrations/        # Numbered SQL migration files
│   │   └── seeds/             # Seed data
│   └── websocket/
│       └── score.gateway.js   # Socket.IO gateway
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
└── package.json
```

### 4.4 Cấu trúc thư mục Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── tournaments/[slug]/    # Trang giải đấu công khai
│   │   │   ├── live/                  # Live score
│   │   │   └── login/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── tournaments/
│   │   │   ├── players/
│   │   │   └── settings/
│   │   └── (referee)/
│   │       └── score-entry/[matchId]/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── bracket/
│   │   │   └── BracketView.tsx
│   │   ├── score/
│   │   │   └── ScoreEntry.tsx
│   │   └── layout/
│   ├── lib/
│   │   ├── api-client.ts      # axios wrapper
│   │   ├── auth.ts
│   │   └── websocket.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMatch.ts
│   │   └── useOfflineQueue.ts
│   └── store/
│       ├── authStore.ts       # zustand
│       └── scoreStore.ts
├── middleware.ts               # Next.js route guard theo role
└── package.json
```

### 4.5 Sequence Diagram: Luồng Ghi điểm (Online)

```
Referee App          API Server          PostgreSQL        Socket.IO
     │                   │                   │                │
     │── POST /matches/:id/sets ──────────────>│               │
     │   { set_number, score_p1, score_p2,    │               │
     │     client_event_id, client_ts }        │               │
     │                   │                   │                │
     │                   │── INSERT score_events ─────────────>│
     │                   │   (append-only)   │                │
     │                   │<──────────────────│                │
     │                   │── UPDATE match_sets ──────────────>│
     │                   │<──────────────────│                │
     │<──── 201 Created ─│                   │                │
     │                   │── broadcast 'score:update' ──────> │
     │                   │   {matchId, sets, live_score}      │── emit to all viewers
```

### 4.6 Sequence Diagram: Luồng Đăng ký Thi đấu

```
VĐV              API Server         PostgreSQL       Email Service
 │                   │                  │                │
 │─ POST /events/:id/entries ──────────>│               │
 │  { player1_id, player2_id?,          │               │
 │    entry_type, id_card_image_url }    │               │
 │                   │── Validate discipline rules      │
 │                   │   (single: player2=null,         │
 │                   │    pair: player2≠null,           │
 │                   │    mixed: gender check)          │
 │                   │── CHECK event.registration_open_at│
 │                   │── CHECK entry_count < max_participants
 │                   │── INSERT event_entries ─────────>│
 │                   │   (status=pending)    │           │
 │                   │<──────────────────────│           │
 │                   │─────────────────────────────────>│
 │                   │   trigger email confirm          │── send email
 │<── 201 { entry } ─│                                  │
```

### 4.7 State Machine: Tournament

```
              ┌──────────┐
         ─────► draft    │
              └────┬─────┘
                   │ BTC publish
                   ▼
         ┌──────────────────┐
         │ open_registration│◄── re-open (if cancelled)
         └────────┬─────────┘
                  │ BTC start
                  ▼
           ┌─────────┐
           │ ongoing │
           └────┬────┘
                │ all matches done
                ▼
          ┌──────────┐
          │ finished │
          └──────────┘
              ▲  ▲
              │  │ (from any state)
         ┌────┴──────┐
         │ cancelled │
         └───────────┘
```

### 4.8 State Machine: Match

```
        ┌───────────┐
  ──────► scheduled │
        └─────┬─────┘
              │ referee starts
              ▼
         ┌────────┐
         │  live  │◄── score updates
         └────┬───┘
              │ all sets done + BTC validates
              ▼
        ┌───────────┐
        │ completed │
        └───────────┘
            ▲
            │ (from scheduled or live)
       ┌────┴──────┐
       │ cancelled │
       └───────────┘
```

### 4.9 Thiết kế Bracket Engine

#### Single Elimination
```
Round 1        QF         SF          Final
A ─┐
   ├─ W1 ─┐
B ─┘       │
           ├─ W5 ─┐
C ─┐       │       │
   ├─ W2 ─┘       │
D ─┘               ├─ WINNER
E ─┐               │
   ├─ W3 ─┐       │
F ─┘       │       │
           ├─ W6 ─┘
G ─┐       │
   ├─ W4 ─┘
H ─┘

BYE: Nếu số VĐV không phải lũy thừa 2, ghép BYE với seed thấp nhất
```

#### Round-Robin Scoring
```
Thắng = 3 điểm
Thua sau set 3 = 1 điểm  
Thua sớm = 0 điểm

Tie-break thứ tự:
1. Đối đầu trực tiếp (head_to_head_result JSONB)
2. Set ratio: sets_won / sets_lost
3. Point ratio: points_for / points_against
```

---

## 5. Thiết kế cơ sở dữ liệu (Database Design)

### 5.1 Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Bảng | snake_case, số nhiều | `tournament_status_logs` |
| Cột | snake_case | `created_at`, `is_active` |
| PK | `id UUID PRIMARY KEY` | `id` |
| FK | `{bảng_ref}_id` | `tournament_id`, `player1_id` |
| Index | `idx_{bảng}_{cột}` | `idx_matches_round_id` |
| Soft-delete | `deleted_at TIMESTAMPTZ NULL` | `deleted_at` |
| Timestamp | `TIMESTAMPTZ` (UTC) | `created_at`, `updated_at` |

### 5.2 Module 1 — Xác thực & Phân quyền

#### Bảng `users`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | Khóa chính |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email đăng nhập |
| phone | VARCHAR(20) | NULL, UNIQUE | Số điện thoại |
| password_hash | VARCHAR(255) | NOT NULL | Mật khẩu băm (BCrypt/Argon2) |
| full_name | VARCHAR(150) | NOT NULL | Họ và tên |
| date_of_birth | DATE | NULL | Ngày sinh |
| status | VARCHAR(20) | NOT NULL, DEFAULT: pending | active / locked / pending / deleted |
| remember_me | BOOLEAN | NOT NULL, DEFAULT: false | Ghi nhớ đăng nhập |
| preferred_language | VARCHAR(10) | NOT NULL, DEFAULT: vi | vi / en |
| avatar_url | VARCHAR(512) | NULL | URL ảnh đại diện |
| last_login_at | TIMESTAMPTZ | NULL | Lần đăng nhập gần nhất |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT: now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT: now() | |
| deleted_at | TIMESTAMPTZ | NULL | Soft-delete |

#### Bảng `otp_tokens`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| code_hash | VARCHAR(255) | NOT NULL | Mã OTP đã băm |
| channel | VARCHAR(10) | NOT NULL | email / sms |
| purpose | VARCHAR(30) | NOT NULL | register / login / reset_password |
| attempt_count | SMALLINT | DEFAULT: 0 | Số lần nhập sai |
| expires_at | TIMESTAMPTZ | NOT NULL | Hết hạn sau 5 phút |
| is_used | BOOLEAN | DEFAULT: false | Đã dùng chưa |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |

#### Bảng `roles`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(50) | NOT NULL, UNIQUE | admin / btc / referee / player / audience |
| description | TEXT | NULL | |

#### Bảng `user_roles`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| role_id | UUID | FK → roles.id | |
| granted_by | UUID | FK → users.id, NULL | Người cấp quyền |
| granted_at | TIMESTAMPTZ | DEFAULT: now() | |
> **UNIQUE(user_id, role_id)**

#### Bảng `permissions`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| resource | VARCHAR(80) | NOT NULL | Tài nguyên (tournament, match...) |
| action | VARCHAR(40) | NOT NULL | create / read / update / delete |
| description | TEXT | NULL | |

#### Bảng `role_permissions`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| role_id | UUID | FK → roles.id | |
| permission_id | UUID | FK → permissions.id | |
> **UNIQUE(role_id, permission_id)**

#### Bảng `refresh_tokens`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| is_revoked | BOOLEAN | DEFAULT: false | |
| device_info | TEXT | NULL | User-agent, IP |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |

---

### 5.3 Module 2 — CMS

#### Bảng `articles`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(320) | NOT NULL, UNIQUE | |
| content | TEXT | NOT NULL | HTML đã sanitize |
| thumbnail_url | VARCHAR(512) | NULL | |
| status | VARCHAR(20) | DEFAULT: draft | draft / published / archived |
| published_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |
| updated_at | TIMESTAMPTZ | DEFAULT: now() | |
| deleted_at | TIMESTAMPTZ | NULL | Soft-delete |

#### Bảng `tags` + `article_tag_map`
```sql
tags (id UUID PK, name VARCHAR(80) UNIQUE, slug VARCHAR(100) UNIQUE)
article_tag_map (article_id UUID FK, tag_id UUID FK, PRIMARY KEY (article_id, tag_id))
```

---

### 5.4 Module 3 — Giải đấu

#### Bảng `tournaments`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| organizer_id | UUID | FK → users.id | BTC tạo giải |
| name | VARCHAR(200) | NOT NULL | |
| slug | VARCHAR(220) | NOT NULL, UNIQUE | |
| description | TEXT | NULL | |
| status | VARCHAR(30) | DEFAULT: draft | draft/open_registration/ongoing/finished/cancelled |
| display_status | VARCHAR(30) | DEFAULT: draft | Mở đăng ký / Thi đấu / Kết thúc |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | CHECK(end_date >= start_date) |
| banner_url | VARCHAR(512) | NULL | |
| regulations_url | VARCHAR(512) | NULL | |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |
| updated_at | TIMESTAMPTZ | DEFAULT: now() | |
| deleted_at | TIMESTAMPTZ | NULL | |

#### Bảng `tournament_status_log`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| tournament_id | UUID | FK → tournaments.id | |
| from_status | VARCHAR(30) | NOT NULL | |
| to_status | VARCHAR(30) | NOT NULL | |
| changed_by | UUID | FK → users.id | |
| reason | TEXT | NULL | |
| changed_at | TIMESTAMPTZ | DEFAULT: now() | |

#### Bảng `tournament_team_registrations`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| tournament_id | UUID | FK → tournaments.id | |
| team_id | UUID | FK → teams.id | |
| registered_by | UUID | FK → users.id | |
| status | VARCHAR(20) | DEFAULT: pending | pending / approved / rejected |
| registered_at | TIMESTAMPTZ | DEFAULT: now() | |
> **UNIQUE(tournament_id, team_id)**

#### Bảng `venues` và `courts`
```sql
venues (id UUID PK, tournament_id FK, name, address, total_courts SMALLINT, created_at)
courts (id UUID PK, venue_id FK, name VARCHAR(50), floor_type, status DEFAULT: available)
  -- status: available / in_use / maintenance
```

#### Bảng `events`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| tournament_id | UUID | FK → tournaments.id | |
| name | VARCHAR(150) | NOT NULL | |
| discipline | VARCHAR(20) | NOT NULL | singles / doubles / mixed_doubles |
| gender | VARCHAR(10) | NOT NULL | male / female / mixed / open |
| age_group | VARCHAR(40) | NULL | U17 / U21 / Open / Senior |
| format_type | VARCHAR(30) | NOT NULL | round_robin / single_elimination / group_knockout |
| max_participants | SMALLINT | NOT NULL | |
| sets_per_match | SMALLINT | DEFAULT: 3 | |
| points_per_set | SMALLINT | DEFAULT: 21 | |
| registration_open_at | TIMESTAMPTZ | NULL | |
| registration_close_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |

---

### 5.5 Module 4 — Người tham gia

#### Bảng `teams`
```sql
teams (id UUID PK, name VARCHAR(150), short_name, province_code UNIQUE,
       logo_url, contact_email, contact_phone, created_at, deleted_at)
```

#### Bảng `players`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NULL | Tài khoản liên kết |
| team_id | UUID | FK → teams.id, NULL | CLB hiện tại |
| full_name | VARCHAR(150) | NOT NULL | |
| date_of_birth | DATE | NOT NULL | |
| gender | VARCHAR(10) | NOT NULL | male / female |
| id_card_number | VARCHAR(20) | NOT NULL, UNIQUE | Số CCCD |
| id_card_image_url | VARCHAR(512) | NULL | |
| avatar_url | VARCHAR(512) | NULL | Ảnh 3×4 |
| ranking_tier | VARCHAR(10) | NULL | |
| ranking_points | INT | DEFAULT: 0 | Điểm xếp hạng tích lũy |
| status | VARCHAR(20) | DEFAULT: active | active / suspended / retired |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |
| deleted_at | TIMESTAMPTZ | NULL | |

#### Bảng `coaches`
```sql
coaches (id UUID PK, user_id FK NULL, team_id FK NULL,
         full_name, date_of_birth DATE NULL, gender VARCHAR(10) NULL,
         license_number UNIQUE NULL, status DEFAULT: active, created_at)
```

#### Bảng `referees`
```sql
referees (id UUID PK, user_id FK NULL,
          full_name, license_number UNIQUE,
          license_level VARCHAR(10) -- QG_A / QG_B,
          status DEFAULT: active, created_at)
```

---

### 5.6 Module 5 — Đăng ký Thi đấu

#### Bảng `event_entries`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| event_id | UUID | FK → events.id | |
| player1_id | UUID | FK → players.id | VĐV chính |
| player2_id | UUID | FK → players.id, NULL | VĐV đối tác (đôi) |
| team_id | UUID | FK → teams.id, NULL | |
| entry_type | VARCHAR(15) | NOT NULL | individual / pair |
| seed_number | SMALLINT | NULL | |
| status | VARCHAR(25) | DEFAULT: pending | pending/approved/rejected/supplement_required |
| rejection_reason | TEXT | NULL | NOT NULL khi status=rejected |
| id_card_image_url | VARCHAR(512) | NULL | |
| registered_at | TIMESTAMPTZ | DEFAULT: now() | |
| approved_at | TIMESTAMPTZ | NULL | |
| approved_by | UUID | FK → users.id, NULL | |

```sql
-- Ràng buộc CHECK trong DB
ALTER TABLE event_entries ADD CONSTRAINT chk_pair_logic
  CHECK (
    (entry_type = 'individual' AND player2_id IS NULL)
    OR (entry_type = 'pair' AND player2_id IS NOT NULL)
  );
```

#### Bảng `document_receipts`
```sql
document_receipts (id UUID PK, entry_id FK → event_entries.id,
                   received_by FK → users.id, received_at TIMESTAMPTZ,
                   completeness VARCHAR(20) -- complete / incomplete,
                   notes TEXT NULL)
```

---

### 5.7 Module 6 — Lõi Thi đấu

#### Bảng `stages`
```sql
stages (id UUID PK, event_id FK, name, stage_type, stage_order SMALLINT,
        settings JSONB DEFAULT '{}', created_at)
-- stage_type: round_robin / single_elimination / double_elimination
```

#### Bảng `groups`
```sql
groups (id UUID PK, stage_id FK, name, group_order SMALLINT)
```

#### Bảng `rounds`
```sql
rounds (id UUID PK, group_id FK, name, round_number SMALLINT, is_complete BOOLEAN DEFAULT false)
```

#### Bảng `matches`
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| round_id | UUID | FK → rounds.id | |
| court_id | UUID | FK → courts.id, NULL | |
| match_number | INT | NOT NULL | |
| status | VARCHAR(20) | DEFAULT: scheduled | scheduled/live/completed/cancelled |
| opponent1 | JSONB | NULL | {id, score, result, position} — null=BYE/TBD |
| opponent2 | JSONB | NULL | Tương tự opponent1 |
| winner_entry_id | UUID | FK → event_entries.id, NULL | |
| special_result | VARCHAR(20) | NULL | walkover / disqualified / retired |
| scheduled_at | TIMESTAMPTZ | NULL | |
| started_at | TIMESTAMPTZ | NULL | |
| ended_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | DEFAULT: now() | |
> **Không có referee_id trực tiếp — lấy qua referee_assignments WHERE role='main_referee'**

#### Bảng `match_sets`
```sql
match_sets (id UUID PK, match_id FK, set_number SMALLINT,
            score_p1 SMALLINT DEFAULT 0, score_p2 SMALLINT DEFAULT 0,
            is_validated BOOLEAN DEFAULT false,
            entered_by FK NULL, entered_at, validated_at)
```

#### Bảng `referee_assignments`
```sql
referee_assignments (id UUID PK, match_id FK, referee_id FK,
                     role VARCHAR(20) -- main_referee/line_judge/service_judge,
                     status DEFAULT: pending -- pending/approved/cancelled,
                     assigned_by FK, assigned_at TIMESTAMPTZ)
```

---

### 5.8 Module 7 — Lịch sử Ghi điểm & Offline Sync

#### Bảng `score_events` (append-only)
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| client_event_id | UUID | NOT NULL, UNIQUE | Chống trùng khi sync offline |
| match_id | UUID | FK → matches.id | |
| set_id | UUID | FK → match_sets.id, NULL | |
| action | VARCHAR(20) | NOT NULL | score / undo / set_win / match_win |
| scoring_side | VARCHAR(5) | NULL | A / B |
| score_before | JSONB | NOT NULL | {score_p1, score_p2} |
| score_after | JSONB | NOT NULL | {score_p1, score_p2} |
| service_side_before | VARCHAR(5) | NULL | A / B |
| service_side_after | VARCHAR(5) | NULL | A / B |
| is_undone | BOOLEAN | DEFAULT: false | |
| is_offline | BOOLEAN | DEFAULT: false | |
| entered_by | UUID | FK → users.id | |
| client_ts | TIMESTAMPTZ | NOT NULL | Thời điểm tại thiết bị |
| server_ts | TIMESTAMPTZ | DEFAULT: now() | Thời điểm server nhận |

#### Bảng `sync_sessions`
```sql
sync_sessions (id UUID PK, referee_id FK, device_id VARCHAR(100),
               match_id FK NULL,  -- L11: biết phiên thuộc trận nào
               disconnected_at, reconnected_at,
               total_queued INT, total_pushed INT, total_rejected INT, total_conflict INT,
               status DEFAULT: syncing -- syncing/completed/error,
               completed_at, error_notes, created_at)
```

---

### 5.9 Module 8 — Bảng xếp hạng

#### Bảng `leaderboard_entries`
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | UUID PK | |
| event_id | UUID FK | |
| entry_id | UUID FK | FK → event_entries.id |
| rank_position | SMALLINT | Vị trí xếp hạng |
| matches_played | SMALLINT DEFAULT 0 | |
| matches_won | SMALLINT DEFAULT 0 | |
| matches_lost | SMALLINT DEFAULT 0 | |
| sets_won | SMALLINT DEFAULT 0 | |
| sets_lost | SMALLINT DEFAULT 0 | |
| points_diff | INT DEFAULT 0 | Hiệu số điểm |
| total_points | SMALLINT DEFAULT 0 | Điểm thưởng BXH |
| head_to_head_result | JSONB NULL | {entry_id: "W"/"L"} cho tie-break |
| status | VARCHAR(15) DEFAULT live | live / finished |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

---

### 5.10 Module 9 — Thanh toán

#### Bảng `payments`
```sql
payments (id UUID PK, entry_id FK NULL, tournament_id FK, payer_user_id FK,
          amount BIGINT CHECK > 0, currency DEFAULT 'VND',
          type VARCHAR(20) -- registration_fee/other,
          status DEFAULT: pending -- pending/paid/failed/refunded,
          description, due_date, paid_at, created_at)
```

#### Bảng `payment_transactions`
```sql
payment_transactions (id UUID PK, payment_id FK,
                      gateway VARCHAR(20) -- vnpay/momo/bank_transfer/cash,
                      gateway_txn_id VARCHAR(200),
                      UNIQUE(gateway, gateway_txn_id),  -- L02: composite unique
                      amount BIGINT, status, signature_valid BOOLEAN,
                      raw_payload JSONB, created_at)
```

#### Bảng `expense_records` & `budget_lines`
```sql
budget_lines (id UUID PK, tournament_id FK, category,
              planned_amount BIGINT, actual_spent BIGINT DEFAULT 0,
              warning_ratio NUMERIC(4,3) DEFAULT 0.85,
              hard_cap_ratio NUMERIC(4,3) DEFAULT 1.00,
              is_locked BOOLEAN DEFAULT false)

budget_line_history (id UUID PK, budget_line_id FK,
                     old_planned BIGINT, new_planned BIGINT,
                     changed_by FK, changed_at)  -- L14: audit trail ngân sách

expense_records (id UUID PK, tournament_id FK, budget_line_id FK NULL,
                 category, vendor_name, invoice_number,
                 amount BIGINT CHECK > 0, expense_date DATE,
                 payment_method, file_url, status DEFAULT: draft,
                 entered_by FK, approved_by FK NULL, approved_at, created_at)
```

---

### 5.11 Module 10 — Thông báo

```sql
notification_templates (id UUID PK, code VARCHAR(60) UNIQUE, name, channel,
                         subject_vi, subject_en, body_vi, body_en,
                         variables JSONB, is_active DEFAULT true)

notifications (id UUID PK, template_id FK NULL, recipient_id FK → users.id,
               channel, title, body, data JSONB,
               status DEFAULT: pending -- pending/sent/failed/read,
               scheduled_at, sent_at, read_at,
               retry_count SMALLINT DEFAULT 0, created_at)
```

---

### 5.12 Module 11 — Báo cáo Pháp lý

```sql
report_templates (id UUID PK, code UNIQUE, name,
                  kind -- summary/financial/attendance/other,
                  description, schema JSONB, is_active DEFAULT true)

legal_reports (id UUID PK, tournament_id FK, template_id FK,
               kind, version INT DEFAULT 1,
               generated_by FK, status DEFAULT: generating,
               file_url, sha256 VARCHAR(64),
               params_snapshot JSONB, submission_code,
               notes, generated_at, submitted_at,
               UNIQUE(tournament_id, kind, version))
```

---

### 5.13 Module 12 — Tham số Hệ thống

```sql
system_configs (id UUID PK, key VARCHAR(120) UNIQUE,
                value TEXT, value_type VARCHAR(15),
                default_value TEXT, module VARCHAR(60),
                label_vi, label_en, description,
                allowed_values TEXT, min_value NUMERIC, max_value NUMERIC,
                is_sensitive BOOLEAN DEFAULT false,
                is_readonly BOOLEAN DEFAULT false,
                updated_by FK NULL, updated_at, created_at)

system_config_logs (id UUID PK, config_key FK → system_configs.key,
                    old_value TEXT, new_value TEXT,
                    changed_by FK → users.id,
                    reason TEXT NULL, changed_at)  -- append-only
```

---

### 5.14 Index Recommendations

```sql
-- Module 1: Auth
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_otp_tokens_user_id_purpose ON otp_tokens(user_id, purpose) WHERE is_used = false;

-- Module 3: Tournament
CREATE INDEX idx_tournaments_status ON tournaments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_tournament_id ON events(tournament_id);

-- Module 5: Entries
CREATE INDEX idx_event_entries_event_id ON event_entries(event_id);
CREATE INDEX idx_event_entries_player1_id ON event_entries(player1_id);
CREATE INDEX idx_event_entries_status ON event_entries(event_id, status);

-- Module 6: Competition
CREATE INDEX idx_matches_round_id ON matches(round_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_sets_match_id ON match_sets(match_id);
CREATE INDEX idx_referee_assignments_match_id ON referee_assignments(match_id);
CREATE INDEX idx_referee_assignments_referee_id ON referee_assignments(referee_id);

-- Module 7: Score Events
CREATE INDEX idx_score_events_match_id_client_ts ON score_events(match_id, client_ts);
CREATE INDEX idx_score_events_client_event_id ON score_events(client_event_id);

-- Module 8: Leaderboard
CREATE INDEX idx_leaderboard_event_id ON leaderboard_entries(event_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(event_id, rank_position);

-- Module 9: Payments
CREATE INDEX idx_payments_entry_id ON payments(entry_id);
CREATE INDEX idx_payments_status ON payments(tournament_id, status);
CREATE INDEX idx_payment_transactions_payment_id ON payment_transactions(payment_id);

-- Module 10: Notifications
CREATE INDEX idx_notifications_recipient_status ON notifications(recipient_id, status) WHERE status != 'read';
```

---

### 5.15 ERD Tổng quan (Quan hệ chính)

```
users ──────1:N──── user_roles ────N:1──── roles
                                             │1:N
                                        role_permissions
                                             │N:1
                                        permissions

users ────1:N──── otp_tokens
users ────1:N──── refresh_tokens
users ────0..1:1── players
users ────0..1:1── coaches
users ────0..1:1── referees

tournaments ──1:N── events ──1:N── event_entries
tournaments ──1:N── venues ──1:N── courts
tournaments ──1:N── tournament_status_log
tournaments ──1:N── tournament_team_registrations ──N:1── teams
tournaments ──1:N── legal_reports
tournaments ──1:N── budget_lines ──1:N── expense_records
tournaments ──1:N── payments

teams ────1:N──── players
teams ────1:N──── coaches
teams ────1:N──── event_entries

events ──1:N── stages ──1:N── groups ──1:N── rounds ──1:N── matches
matches ──1:N── match_sets
matches ──1:N── referee_assignments ──N:1── referees
matches ──1:N── score_events

event_entries ──1:N── leaderboard_entries
event_entries ──0..1:N── payments ──1:N── payment_transactions

articles ──N:N── tags (qua article_tag_map)
notification_templates ──1:N── notifications
report_templates ──1:N── legal_reports
system_configs ──1:N── system_config_logs
```

---

## 6. Class Diagram

### 6.1 Module IAM

```
┌──────────────────────────────────┐
│             User                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - email: string                  │
│ - phone: string                  │
│ - passwordHash: string           │
│ - fullName: string               │
│ - dateOfBirth: Date              │
│ - status: UserStatus             │
│ - preferredLanguage: string      │
│ - lastLoginAt: Date              │
│ - createdAt: Date                │
│ - deletedAt: Date                │
├──────────────────────────────────┤
│ + register(dto: RegisterDto): User│
│ + login(dto: LoginDto): TokenPair│
│ + verifyOtp(code: string): bool  │
│ + refreshToken(token: string): TokenPair│
│ + changePassword(old, new): void │
│ + softDelete(): void             │
└──────────────────────────────────┘
          │1
          │ has
          │N
┌──────────────────────────────────┐
│           UserRole               │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - userId: UUID                   │
│ - roleId: UUID                   │
│ - grantedBy: UUID                │
│ - grantedAt: Date                │
└──────────────────────────────────┘
          │N
          │ assigned
          │1
┌──────────────────────────────────┐
│             Role                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - name: string                   │
│ - description: string            │
├──────────────────────────────────┤
│ + getPermissions(): Permission[] │
└──────────────────────────────────┘
          │N
          │ has
          │N
┌──────────────────────────────────┐
│          Permission              │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - resource: string               │
│ - action: string                 │
└──────────────────────────────────┘

<<enumeration>> UserStatus
  PENDING
  ACTIVE
  LOCKED
  DELETED
```

### 6.2 Module Tournament

```
┌──────────────────────────────────────┐
│            Tournament                │
├──────────────────────────────────────┤
│ - id: UUID                           │
│ - organizerId: UUID                  │
│ - name: string                       │
│ - slug: string                       │
│ - status: TournamentStatus           │
│ - displayStatus: string              │
│ - startDate: Date                    │
│ - endDate: Date                      │
├──────────────────────────────────────┤
│ + create(dto): Tournament            │
│ + changeStatus(to: TournamentStatus) │
│ + getEvents(): Event[]               │
│ + getVenues(): Venue[]               │
│ + generateBracket(eventId): Stage[]  │
└──────────────────────────────────────┘
     │1          │1             │1
     │           │              │
     │N          │N             │N
┌─────────┐  ┌────────┐  ┌───────────────────┐
│  Event  │  │ Venue  │  │TournamentStatusLog│
├─────────┤  ├────────┤  ├───────────────────┤
│id       │  │id      │  │id                 │
│name     │  │name    │  │fromStatus         │
│discipline│  │address │  │toStatus           │
│gender   │  │totalCt │  │changedBy          │
│formatType│  └────┬───┘  │changedAt          │
│maxPartic│       │1      └───────────────────┘
│setsPerM │       │N
└────┬────┘  ┌────▼──┐
     │1      │ Court │
     │N      └───────┘
┌────▼──────┐
│EventEntry │
├───────────┤
│id         │
│player1Id  │
│player2Id? │
│teamId?    │
│entryType  │
│seedNumber │
│status     │
├───────────┤
│+ register()│
│+ approve() │
│+ reject()  │
└───────────┘

<<enumeration>> TournamentStatus
  DRAFT
  OPEN_REGISTRATION
  ONGOING
  FINISHED
  CANCELLED

<<enumeration>> Discipline
  SINGLES
  DOUBLES
  MIXED_DOUBLES

<<enumeration>> FormatType
  ROUND_ROBIN
  SINGLE_ELIMINATION
  GROUP_KNOCKOUT
```

### 6.3 Module Competition (Bracket)

```
┌──────────────────────────────────┐
│            Stage                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - eventId: UUID                  │
│ - name: string                   │
│ - stageType: StageType           │
│ - stageOrder: number             │
│ - settings: object               │
├──────────────────────────────────┤
│ + generateGroups(): Group[]      │
└──────────────────────────────────┘
     │1
     │N
┌──────────────────────────────────┐
│            Group                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - stageId: UUID                  │
│ - name: string                   │
│ - groupOrder: number             │
└──────────────────────────────────┘
     │1
     │N
┌──────────────────────────────────┐
│            Round                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - groupId: UUID                  │
│ - name: string                   │
│ - roundNumber: number            │
│ - isComplete: boolean            │
└──────────────────────────────────┘
     │1
     │N
┌──────────────────────────────────┐
│            Match                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - roundId: UUID                  │
│ - courtId: UUID                  │
│ - matchNumber: number            │
│ - status: MatchStatus            │
│ - opponent1: Opponent            │
│ - opponent2: Opponent            │
│ - winnerEntryId: UUID            │
│ - scheduledAt: Date              │
├──────────────────────────────────┤
│ + start(): void                  │
│ + recordSet(set: MatchSet): void │
│ + complete(winnerId): void       │
│ + getMainReferee(): Referee      │
└──────────────────────────────────┘
     │1                │1
     │N                │N
┌──────────────────┐  ┌───────────────────────┐
│    MatchSet      │  │  RefereeAssignment    │
├──────────────────┤  ├───────────────────────┤
│id                │  │id                     │
│setNumber         │  │matchId                │
│scoreP1           │  │refereeId              │
│scoreP2           │  │role: AssignmentRole   │
│isValidated       │  │status                 │
│enteredBy         │  └───────────────────────┘
└──────────────────┘

<<interface>> Opponent
  id: UUID | null
  score: number
  result: 'win' | 'loss' | null
  position: 'BYE' | 'TBD' | null

<<enumeration>> MatchStatus
  SCHEDULED
  LIVE
  COMPLETED
  CANCELLED

<<enumeration>> AssignmentRole
  MAIN_REFEREE
  LINE_JUDGE
  SERVICE_JUDGE

<<service>> BracketEngine
  + generateSingleElimination(entries, seeds): Stage
  + generateRoundRobin(entries): Stage
  + generateGroupKnockout(entries, groupCount): Stage[]
  + advanceWinner(match: Match): void
```

### 6.4 Module People

```
┌──────────────────────────────────┐
│            Player                │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - userId: UUID                   │
│ - teamId: UUID                   │
│ - fullName: string               │
│ - dateOfBirth: Date              │
│ - gender: Gender                 │
│ - idCardNumber: string           │
│ - rankingTier: string            │
│ - rankingPoints: number          │
│ - status: PlayerStatus           │
├──────────────────────────────────┤
│ + linkUser(userId): void         │
│ + updateRankingPoints(pts): void │
│ + getEntries(): EventEntry[]     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            Referee               │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - userId: UUID                   │
│ - fullName: string               │
│ - licenseNumber: string          │
│ - licenseLevel: LicenseLevel     │
│ - status: string                 │
├──────────────────────────────────┤
│ + getAssignments(date): Match[]  │
│ + canBeAssigned(match): boolean  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             Team                 │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - name: string                   │
│ - provinceCode: string           │
│ - contactEmail: string           │
├──────────────────────────────────┤
│ + getPlayers(): Player[]         │
│ + getCoaches(): Coach[]          │
└──────────────────────────────────┘

<<enumeration>> Gender
  MALE
  FEMALE

<<enumeration>> LicenseLevel
  QG_A
  QG_B
```

### 6.5 Module Payment

```
┌──────────────────────────────────┐
│           Payment                │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - entryId: UUID                  │
│ - tournamentId: UUID             │
│ - payerUserId: UUID              │
│ - amount: bigint                 │
│ - currency: string               │
│ - type: PaymentType              │
│ - status: PaymentStatus          │
│ - dueDate: Date                  │
│ - paidAt: Date                   │
├──────────────────────────────────┤
│ + createIntent(): PaymentUrl     │
│ + handleWebhook(payload): void   │
│ + refund(): void                 │
└──────────────────────────────────┘
     │1
     │N
┌────────────────────────────────────┐
│       PaymentTransaction           │
├────────────────────────────────────┤
│ - id: UUID                         │
│ - paymentId: UUID                  │
│ - gateway: Gateway                 │
│ - gatewayTxnId: string             │
│ - amount: bigint                   │
│ - status: string                   │
│ - signatureValid: boolean          │
│ - rawPayload: object               │
└────────────────────────────────────┘

<<enumeration>> Gateway
  VNPAY
  MOMO
  BANK_TRANSFER
  CASH

<<enumeration>> PaymentStatus
  PENDING
  PAID
  FAILED
  REFUNDED
```

### 6.6 Module Score & Offline Sync

```
┌──────────────────────────────────┐
│          ScoreEvent              │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - clientEventId: UUID            │
│ - matchId: UUID                  │
│ - action: ScoreAction            │
│ - scoringSide: 'A' | 'B'         │
│ - scoreBefore: ScoreState        │
│ - scoreAfter: ScoreState         │
│ - isUndone: boolean              │
│ - isOffline: boolean             │
│ - clientTs: Date                 │
│ - serverTs: Date                 │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          SyncSession             │
├──────────────────────────────────┤
│ - id: UUID                       │
│ - refereeId: UUID                │
│ - deviceId: string               │
│ - matchId: UUID                  │
│ - totalQueued: number            │
│ - totalPushed: number            │
│ - totalRejected: number          │
│ - totalConflict: number          │
│ - status: SyncStatus             │
├──────────────────────────────────┤
│ + sync(events): SyncResult       │
│ + resolveConflict(e): void       │
└──────────────────────────────────┘

<<interface>> ScoreState
  scoreP1: number
  scoreP2: number

<<enumeration>> ScoreAction
  SCORE
  UNDO
  SET_WIN
  MATCH_WIN

<<enumeration>> SyncStatus
  SYNCING
  COMPLETED
  ERROR
```

---

## 7. API Design

### 7.1 Quy ước chung

```
Base URL: /api/v1

Authentication: Bearer <access_token> trong Authorization header

Response format:
{
  "data": <payload>,        // khi thành công
  "meta": {                 // khi là list
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

Error format:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is required",
    "details": [...]
  }
}

HTTP Status codes:
200 OK          - Thành công (GET, PUT, PATCH)
201 Created     - Tạo mới thành công (POST)
204 No Content  - Xóa thành công (DELETE)
400 Bad Request - Validation error
401 Unauthorized - Chưa đăng nhập
403 Forbidden   - Không có quyền
404 Not Found   - Không tìm thấy
409 Conflict    - Trùng dữ liệu
422 Unprocessable - Business rule violation
500 Internal Server Error
```

### 7.2 Endpoints chính

#### Auth
```
POST   /api/v1/auth/register         Đăng ký tài khoản
POST   /api/v1/auth/login            Đăng nhập
POST   /api/v1/auth/logout           Đăng xuất
POST   /api/v1/auth/refresh          Gia hạn token
POST   /api/v1/auth/verify-otp       Xác thực OTP
POST   /api/v1/auth/resend-otp       Gửi lại OTP
POST   /api/v1/auth/forgot-password  Quên mật khẩu
POST   /api/v1/auth/reset-password   Đặt lại mật khẩu
```

#### Tournaments
```
GET    /api/v1/tournaments             Danh sách giải (public)
POST   /api/v1/tournaments             Tạo giải [BTC]
GET    /api/v1/tournaments/:slug       Chi tiết giải (public)
PUT    /api/v1/tournaments/:id         Sửa giải [BTC]
PATCH  /api/v1/tournaments/:id/status  Đổi trạng thái [BTC]
DELETE /api/v1/tournaments/:id         Xóa (soft) [Admin]

GET    /api/v1/tournaments/:id/events         Danh sách nội dung
POST   /api/v1/tournaments/:id/events         Tạo nội dung [BTC]
PUT    /api/v1/tournaments/:id/events/:eid    Sửa nội dung [BTC]

GET    /api/v1/tournaments/:id/venues         Danh sách địa điểm
POST   /api/v1/tournaments/:id/venues         Thêm địa điểm [BTC]
```

#### Players & Teams
```
GET    /api/v1/players               Danh sách VĐV
POST   /api/v1/players               Tạo VĐV [Admin/BTC]
GET    /api/v1/players/:id           Chi tiết VĐV
PUT    /api/v1/players/:id           Sửa VĐV [Admin/BTC]
POST   /api/v1/players/:id/link-user Gán tài khoản [Admin]

GET    /api/v1/teams                 Danh sách đội
POST   /api/v1/teams                 Tạo đội [Admin/BTC]
```

#### Event Entries (Đăng ký)
```
GET    /api/v1/events/:id/entries         Danh sách đăng ký
POST   /api/v1/events/:id/entries         Đăng ký thi đấu [Player]
PATCH  /api/v1/entries/:id/approve        Duyệt hồ sơ [BTC]
PATCH  /api/v1/entries/:id/reject         Từ chối [BTC]
GET    /api/v1/entries/mine               Hồ sơ của tôi [Player]
```

#### Matches & Scoring
```
GET    /api/v1/events/:id/bracket         Sơ đồ thi đấu (public)
POST   /api/v1/events/:id/generate-bracket Tạo bracket [BTC]

GET    /api/v1/matches                    Danh sách trận
GET    /api/v1/matches/:id               Chi tiết trận
PATCH  /api/v1/matches/:id/schedule       Xếp lịch [BTC]

POST   /api/v1/matches/:id/sets           Ghi điểm set [Referee]
PATCH  /api/v1/matches/:id/sets/:sid/validate  Xác nhận [BTC]

POST   /api/v1/referee-assignments        Phân công trọng tài [BTC]
```

#### Payments
```
POST   /api/v1/payments                   Tạo payment
POST   /api/v1/payments/webhook           Webhook cổng TT (public)
GET    /api/v1/payments/mine              Lịch sử thanh toán [Player]
```

#### Leaderboard & Reports
```
GET    /api/v1/events/:id/leaderboard     Bảng xếp hạng (public)
GET    /api/v1/tournaments/:id/dashboard  Dashboard [BTC]
POST   /api/v1/reports                    Xuất báo cáo [BTC]
GET    /api/v1/reports/:id/download       Tải báo cáo
```

#### WebSocket Events
```
Client → Server:
  join_match     { matchId }
  leave_match    { matchId }
  score_update   { matchId, set, side, clientEventId, clientTs }

Server → Client:
  score:update   { matchId, sets, currentScore, servicesSide }
  match:status   { matchId, status }
  leaderboard:update  { eventId, entries[] }
```

---

## 8. Bảng tham số hệ thống

### 8.1 Thiết kế bảng `system_configs`

| Cột | Kiểu | Mô tả |
|---|---|---|
| key | VARCHAR(120) UNIQUE | Tên tham số dạng `module.param_name` |
| value | TEXT | Giá trị hiện tại |
| value_type | VARCHAR(15) | string / integer / float / boolean / json |
| default_value | TEXT | Giá trị mặc định khi reset |
| module | VARCHAR(60) | auth / tournament / scoring / payment / notification / system |
| label_vi | VARCHAR(200) | Tên hiển thị tiếng Việt |
| min_value | NUMERIC NULL | Giá trị tối thiểu (cho integer/float) |
| max_value | NUMERIC NULL | Giá trị tối đa (cho integer/float) |
| allowed_values | TEXT NULL | Danh sách giá trị hợp lệ, phân cách `\|` |
| is_sensitive | BOOLEAN | Ẩn trong log và API response |
| is_readonly | BOOLEAN | Chỉ đọc, không cho sửa qua UI |

### 8.2 Danh sách tham số

| Key | Module | Type | Default | Min | Max | Mô tả |
|---|---|---|---|---|---|---|
| `otp.expire_minutes` | auth | integer | 5 | 1 | 30 | Thời gian hiệu lực OTP (phút) |
| `otp.max_attempts` | auth | integer | 5 | 1 | 10 | Số lần nhập OTP sai tối đa |
| `otp.resend_limit_per_session` | auth | integer | 3 | 1 | 5 | Số lần gửi lại OTP/phiên |
| `otp.resend_cooldown_seconds` | auth | integer | 60 | 10 | 300 | Thời gian chờ giữa 2 lần gửi lại (giây) |
| `auth.login_fail_limit` | auth | integer | 5 | 3 | 20 | Số lần đăng nhập sai tối đa/phút |
| `auth.access_token_ttl_minutes` | auth | integer | 15 | 5 | 60 | Thời hạn Access Token (phút) |
| `auth.refresh_token_ttl_days` | auth | integer | 30 | 1 | 90 | Thời hạn Refresh Token (ngày) |
| `auth.password_min_length` | auth | integer | 8 | 6 | 32 | Độ dài tối thiểu mật khẩu |
| `tournament.max_events_per` | tournament | integer | 20 | 1 | 50 | Số nội dung tối đa/giải |
| `tournament.schedule_gap_minutes` | tournament | integer | 30 | 10 | 120 | Khoảng cách tối thiểu giữa 2 trận cùng sân (phút) |
| `tournament.referee_max_per_day` | tournament | integer | 4 | 1 | 10 | Số trận tối đa 1 trọng tài/ngày |
| `tournament.referee_swap_cutoff` | tournament | integer | 15 | 5 | 60 | Chặn hoán đổi trọng tài trước giờ đấu (phút) |
| `tournament.seed_auto_assign` | tournament | boolean | false | — | — | Tự động xếp hạt giống theo ranking_points |
| `scoring.points_per_set` | scoring | integer | 21 | 11 | 30 | Điểm thắng mỗi set mặc định |
| `scoring.min_point_diff` | scoring | integer | 2 | 1 | 5 | Cách biệt điểm tối thiểu để thắng set |
| `scoring.deuce_cap` | scoring | integer | 30 | 21 | 50 | Điểm giới hạn deuce |
| `scoring.sets_per_match` | scoring | integer | 3 | 1 | 5 | Số set mỗi trận (best-of) |
| `scoring.undo_window_seconds` | scoring | integer | 8 | 3 | 30 | Cửa sổ thời gian cho phép Undo điểm (giây) |
| `scoring.leaderboard_update_secs` | scoring | integer | 3 | 1 | 30 | Tần suất cập nhật BXH (giây) |
| `scoring.win_points` | scoring | integer | 3 | 1 | 5 | Điểm thưởng BXH khi thắng |
| `scoring.loss_3set_points` | scoring | integer | 1 | 0 | 2 | Điểm thưởng BXH khi thua sau 3 set |
| `payment.registration_fee_default` | payment | integer | 150000 | 0 | 10000000 | Lệ phí đăng ký mặc định (VND) |
| `payment.due_days_after_register` | payment | integer | 7 | 1 | 30 | Hạn thanh toán sau đăng ký (ngày) |
| `payment.refund_allowed_days` | payment | integer | 3 | 0 | 14 | Số ngày được phép hoàn tiền |
| `notification.email_retry_limit` | notification | integer | 3 | 0 | 10 | Số lần retry gửi email |
| `notification.match_remind_minutes` | notification | integer | 30 | 5 | 120 | Nhắc trước giờ đấu (phút) |
| `notification.dashboard_refresh_secs` | notification | integer | 3 | 1 | 30 | Tần suất refresh dashboard (giây) |
| `offline.sync_conflict_strategy` | system | string | first_wins | — | — | Chiến lược xung đột: first_wins / last_wins |
| `offline.max_queue_size` | system | integer | 500 | 50 | 5000 | Số sự kiện tối đa trong hàng chờ offline |
| `system.max_concurrent_users` | system | integer | 5000 | 100 | 50000 | CCU tối đa hệ thống hỗ trợ |
| `system.file_upload_max_mb` | system | integer | 10 | 1 | 50 | Dung lượng upload tối đa (MB) |
| `system.allowed_file_types` | system | string | jpg\|jpeg\|png\|pdf | — | — | Loại file được phép upload |
| `system.soft_delete_retain_days` | system | integer | 365 | 30 | 3650 | Số ngày giữ dữ liệu soft-delete |
| `system.report_sha256_verify` | system | boolean | true | — | — | Xác minh checksum SHA-256 báo cáo pháp lý |

### 8.3 Quy định sử dụng

1. Tất cả giá trị lưu dạng TEXT — code phải parse theo `value_type` (parseInt, parseFloat, JSON.parse).
2. Cache Redis với TTL 60 giây để tránh query DB liên tục.
3. `is_sensitive = true` → ẩn giá trị trong log và API response bằng `*****`.
4. `is_readonly = true` → chỉ thay đổi qua migration, không qua admin UI.
5. Khi `value` nằm ngoài `[min_value, max_value]` → service reject với lỗi validation.
6. Mọi thay đổi qua admin UI phải ghi 1 dòng vào `system_config_logs` trong cùng transaction.

---

*Tài liệu này được tổng hợp từ quá trình phân tích FR/NFR, thiết kế DB, review lỗi (v2 Fixed), và thiết kế bảng tham số hệ thống.*

*Nhóm 2 — Môn Công nghệ Phần mềm — ĐHCNTT ĐHQG TP.HCM — 2025*

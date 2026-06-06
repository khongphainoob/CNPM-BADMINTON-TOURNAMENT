# 🏸 Hệ thống Quản lý Giải đấu Cầu lông Quốc gia
## Đặc tả Biểu mẫu Frontend (FE Forms Specification)

> **Phiên bản:** 1.0 | **Nguồn:** Database Design v1 – Nhóm 2, UIT  
> **Mục đích:** Hướng dẫn triển khai giao diện nhập liệu cho toàn bộ 25 nghiệp vụ hệ thống

---

## Mục lục

- [Module 1 – Đăng nhập & Xác thực (IAM)](#module-1--đăng-nhập--xác-thực-iam)
- [Module 2 – Quản lý Nội dung (CMS)](#module-2--quản-lý-nội-dung-cms)
- [Module 3 – Quản lý Giải đấu](#module-3--quản-lý-giải-đấu)
- [Module 4 – Đăng ký & Duyệt Hồ sơ](#module-4--đăng-ký--duyệt-hồ-sơ)
- [Module 5 – Điều hành Thi đấu](#module-5--điều-hành-thi-đấu)
- [Module 6 – Đồng bộ Offline](#module-6--đồng-bộ-offline)
- [Module 7 – Tài chính & Thanh toán](#module-7--tài-chính--thanh-toán)

---

## Module 1 – Đăng nhập & Xác thực (IAM)

### BM1 – Form Đăng nhập

**Route:** `/login` | **Vai trò:** Tất cả người dùng

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Email / Số điện thoại | `text` | ✅ | Email format hoặc phone VN (`/^(0[3-9]\d{8})$/`) | Placeholder: `email@example.com hoặc 09xxxxxxxx` |
| Mật khẩu | `password` | ✅ | Tối thiểu 8 ký tự | Có nút toggle hiện/ẩn |
| Ghi nhớ đăng nhập | `checkbox` | ❌ | — | Default: unchecked |
| Yêu cầu xác thực OTP | `checkbox` | ❌ | — | Chuyển sang BM3 nếu checked |

#### Nút hành động

| Nút | Hành động | Trạng thái |
|---|---|---|
| **Đăng nhập** | POST `/api/auth/login` | Loading khi đang gọi API |
| Quên mật khẩu | Điều hướng tới màn hình reset | — |
| Đăng ký | Điều hướng tới BM2 | — |

#### Quy tắc hiển thị lỗi

- Sau 5 lần sai: hiển thị banner `⛔ Tài khoản tạm khóa 1 phút. Vui lòng thử lại sau.`
- Sai thông tin đăng nhập: `Email/SĐT hoặc mật khẩu không đúng.`
- Tài khoản chưa kích hoạt: redirect sang BM3

---

### BM2 – Form Đăng ký Tài khoản

**Route:** `/register` | **Vai trò:** Khách (chưa đăng nhập)

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Họ và tên | `text` | ✅ | 2–100 ký tự, không chứa ký tự đặc biệt | — |
| Ngày sinh | `date` | ✅ | Tuổi ≥ 10, ≤ 100 | Date picker, format `DD/MM/YYYY` |
| Email | `email` | ✅ | RFC 5321 format, UNIQUE check | — |
| Số điện thoại | `tel` | ✅ | Phone VN (`/^(0[3-9]\d{8})$/`), UNIQUE | — |
| Mật khẩu | `password` | ✅ | ≥ 8 ký tự, có CHỮ HOA + chữ số + ký tự đặc biệt | Thanh đo độ mạnh |
| Xác nhận mật khẩu | `password` | ✅ | Trùng khớp với mật khẩu | — |
| Vai trò đăng ký | `select` | ✅ | Một trong: `Admin / BTC / Trọng tài / VĐV / Khán giả` | — |

#### Nút hành động

| Nút | Hành động |
|---|---|
| **Đăng ký** | POST `/api/auth/register` → redirect sang BM3 |
| Đã có tài khoản | Redirect về BM1 |

#### Quy tắc UX

- Real-time validation khi rời focus (`onBlur`)
- Thanh strength password: Yếu / Trung bình / Mạnh / Rất mạnh
- Hiện thông báo: `Email này đã được sử dụng.` nếu trùng

---

### BM3 – Form Xác thực OTP

**Route:** `/verify-otp` | **Vai trò:** Tài khoản `pending`

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Mã OTP | `text` (6 ô riêng lẻ) | ✅ | 6 chữ số, chỉ nhận `[0-9]` | Auto-focus sang ô tiếp theo |
| Phương thức nhận OTP | `radio` | ✅ | `email` hoặc `sms` | Hiển thị địa chỉ đã che (vd: `tr***@gmail.com`) |

#### Thông tin hiển thị (read-only)

- **Thời hạn hiệu lực:** Đồng hồ đếm ngược `MM:SS` (5 phút)
- **Số lần nhập sai còn lại:** Badge số (`5 / 5`, giảm dần)

#### Nút hành động

| Nút | Hành động | Điều kiện |
|---|---|---|
| **Xác nhận** | POST `/api/auth/verify-otp` | Đã nhập đủ 6 số |
| Gửi lại OTP | POST `/api/auth/resend-otp` | Cooldown 60 giây, tối đa 3 lần/phiên |

#### Quy tắc hiển thị lỗi

- Sai OTP: `Mã OTP không đúng. Còn X lần thử.`
- Hết lần thử: `OTP đã bị khóa. Vui lòng yêu cầu gửi lại.`
- Hết hạn: `Mã OTP đã hết hạn. Vui lòng lấy mã mới.`

---

### BM4 – Quản trị Tài khoản & Phân quyền (RBAC)

**Route:** `/admin/users/:id` | **Vai trò:** Admin

#### Các trường nhập liệu / hiển thị

| Tên trường | Loại input | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã User (ID) | `text` (read-only) | — | UUID, tự sinh |
| Họ và tên | `text` (read-only) | — | Lấy từ DB |
| Email / SĐT | `text` (read-only) | — | — |
| Trạng thái tài khoản | `select` | ✅ | `active / locked / pending / deleted` |
| Vai trò được gán | `multi-select / tags` | ✅ | Chọn nhiều: `Admin, BTC, Trọng tài, VĐV, Khán giả` |
| Reset mật khẩu | `button` | ❌ | Chỉ kích hoạt khi status = `active` |
| Ghi chú | `textarea` | ❌ | Tối đa 500 ký tự |

#### Nút hành động

| Nút | Hành động | Điều kiện |
|---|---|---|
| **Lưu thay đổi** | PATCH `/api/admin/users/:id` | — |
| **Reset mật khẩu** | POST `/api/admin/users/:id/reset-password` | status = `active` |
| Khoá tài khoản | PATCH status → `locked` | — |

---

## Module 2 – Quản lý Nội dung (CMS)

### BM5 – Editor Bài viết / Highlight

**Route:** `/admin/articles/new` hoặc `/admin/articles/:id/edit` | **Vai trò:** Admin, BTC

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Tiêu đề bài viết | `text` | ✅ | 5–300 ký tự | — |
| Đường dẫn (Slug) | `text` | ✅ | Lowercase, chỉ `-` và chữ số, UNIQUE | Auto-generate từ tiêu đề, cho phép sửa |
| Thumbnail URL | `url` / `file upload` | ❌ | Format ảnh: `jpg, jpeg, png, webp`, ≤ 10 MB | Preview ảnh ngay sau upload |
| Thẻ tag (Tags) | `tag input` | ❌ | Tối đa 10 tags, mỗi tag ≤ 50 ký tự | Gợi ý tag từ danh sách có sẵn |
| Trạng thái xuất bản | `select` | ✅ | `draft / published / archived` | Default: `draft` |
| Người viết | `text` (read-only) | — | Tự lấy từ tài khoản đăng nhập | — |
| Nội dung bài viết | Rich Text Editor (WYSIWYG) | ✅ | XSS Sanitization phía FE trước khi submit | Hỗ trợ: heading, bold, image, link, table |

#### Nút hành động

| Nút | Hành động |
|---|---|
| **Lưu nháp** | POST/PATCH với status = `draft` |
| **Xuất bản** | POST/PATCH với status = `published` |
| Xem trước | Mở preview modal |
| Lưu trữ | PATCH với status = `archived` |

---

## Module 3 – Quản lý Giải đấu

### BM6 – Phiếu Đăng ký Giải đấu (Khởi tạo sơ bộ)

**Route:** `/tournaments/propose` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Tên giải đấu | `text` | ✅ | 5–200 ký tự | — |
| Đơn vị tổ chức | `text` | ✅ | Tối đa 200 ký tự | — |
| Địa điểm tổ chức | `text` | ✅ | — | Có thể tích hợp Google Maps autocomplete |
| Thời gian tổ chức | `daterange` | ✅ | Ngày bắt đầu ≤ ngày kết thúc | Date range picker |
| Các hạng mục thi đấu | `multi-select / tags` | ✅ | Chọn từ danh sách chuẩn | — |
| Thể thức thi đấu | `select` | ✅ | `round_robin / single_elimination / group_knockout` | — |
| Thông tin liên hệ BTC | `textarea` | ✅ | Tối đa 500 ký tự | — |

#### Quy tắc

- Hệ thống tự sinh `slug` từ tên giải khi lưu (hiển thị preview cho người dùng).
- Đây là bước khởi tạo sơ bộ; cấu hình chi tiết thực hiện qua BM10.

---

### BM7 – Phiếu Thiết lập Hạng mục Thi đấu

**Route:** `/tournaments/:id/events/new` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Mã giải đấu | `text` (read-only) | — | Tự điền từ context | — |
| Tên hạng mục | `text` | ✅ | 3–150 ký tự | Vd: "Đơn nam U21" |
| Loại nội dung | `select` | ✅ | `singles / doubles / mixed_doubles` | — |
| Giới tính áp dụng | `select` | ✅ | `male / female / mixed / open` | — |
| Nhóm tuổi | `text` | ❌ | Vd: "U21", "35+", "Open" | — |
| Số người tối đa | `number` | ✅ | 2–512, bội số của 2 | — |
| Thời gian mở đăng ký | `datetime-local` | ✅ | < Thời gian đóng | — |
| Thời gian đóng đăng ký | `datetime-local` | ✅ | > Thời gian mở | — |

#### Quy tắc validation động

- Khi `loại nội dung = doubles / mixed_doubles` → hiển thị thông báo: `⚠ Yêu cầu VĐV đối tác khi đăng ký.`
- Khi `loại nội dung = mixed_doubles` → service kiểm tra khác giới (hiển thị rule cho người dùng biết).

---

### BM8 – Phiếu Đăng ký Đoàn thi đấu / CLB

**Route:** `/tournaments/:id/teams/register` | **Vai trò:** Trưởng đoàn, BTC

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Tên CLB / Đơn vị / Tỉnh | `text` | ✅ | 2–200 ký tự | — |
| Mã tỉnh / Mã CLB | `text` | ✅ | UNIQUE, 2–20 ký tự, chỉ chữ và số | — |
| Họ tên trưởng đoàn | `text` | ✅ | 2–100 ký tự | — |
| Số điện thoại liên hệ | `tel` | ✅ | Phone VN format | — |
| Email liên hệ | `email` | ✅ | Email format | — |
| Logo CLB | `file upload` / `url` | ❌ | `jpg, png`, ≤ 2 MB | Preview logo |
| Ghi chú | `textarea` | ❌ | ≤ 500 ký tự | — |

---

### BM9 – Phiếu Tiếp nhận Hồ sơ

**Route:** `/admin/registrations/:entryId/receive` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu / hiển thị

| Tên trường | Loại input | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã tiếp nhận | `text` (read-only) | — | Auto-generate |
| Mã hồ sơ VĐV | `text` (read-only) | — | Từ `event_entries.id` |
| Người tiếp nhận | `text` (read-only) | — | Tài khoản đang đăng nhập |
| Ngày tiếp nhận | `datetime` (read-only) | — | Auto = `now()` |
| Tình trạng hồ sơ ban đầu | `radio` | ✅ | `complete (Đầy đủ)` / `incomplete (Thiếu giấy tờ)` |
| Ghi chú | `textarea` | ❌ | ≤ 500 ký tự |

#### Quy tắc

- Mỗi hồ sơ chỉ tiếp nhận **một lần** (nút vô hiệu sau khi đã tiếp nhận).
- Nếu `incomplete` → yêu cầu điền ghi chú rõ giấy tờ còn thiếu.

---

### BM10 – Phiếu Tạo Giải đấu Chi tiết (FR-5)

**Route:** `/admin/tournaments/new` hoặc `/admin/tournaments/:id/edit` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Tên giải đấu | `text` | ✅ | 5–200 ký tự | — |
| Mã định danh (Slug) | `text` | ✅ | Lowercase, `-`, UNIQUE | Auto-generate, cho phép sửa |
| Đơn vị tổ chức | `text` | ✅ | ≤ 200 ký tự | — |
| Ngày bắt đầu | `date` | ✅ | ≤ Ngày kết thúc | — |
| Ngày kết thúc | `date` | ✅ | ≥ Ngày bắt đầu | — |
| Địa điểm tổ chức | `text` | ✅ | — | — |
| Mô tả giải đấu | `textarea` | ❌ | ≤ 2000 ký tự | — |
| Banner / Ảnh bìa | `file upload` | ❌ | `jpg, png, webp`, ≤ 10 MB | Preview ảnh |
| File thể lệ | `file upload` | ❌ | `pdf`, ≤ 10 MB | Link download sau upload |

#### Trạng thái sau khi tạo

- Mặc định: `draft`
- Chuyển trạng thái qua BM12

---

### BM11 – Phiếu Cấu hình Thể thức (FR-6)

**Route:** `/admin/tournaments/:id/events/:eventId/format` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Mã giải đấu | `text` (read-only) | — | — | — |
| Tên hạng mục | `text` (read-only) | — | — | — |
| Kiểu đấu | `select` | ✅ | `round_robin / single_elimination / group_knockout` | — |
| Số set mỗi trận | `number` | ✅ | 1 / 3 / 5 | Radio hoặc select |
| Số điểm mỗi set | `number` | ✅ | 11–30 | Default: 21 |
| Trạng thái cấu hình | `badge` (read-only) | — | `draft / confirmed` | — |
| Sơ đồ thi đấu | `badge` (read-only) | — | `created / not_created` | Hệ thống tạo, không nhập tay |

#### Nút hành động

| Nút | Hành động | Cảnh báo |
|---|---|---|
| **Lưu nháp** | PATCH với status = `draft` | — |
| **Xác nhận cấu hình** | PATCH với status = `confirmed` | — |
| **Tạo sơ đồ thi đấu** | POST `/generate-bracket` | Chỉ khả dụng khi `confirmed` |
| Thay đổi (khi đã confirmed) | Reset về `draft` | ⚠ `Thay đổi sẽ xóa sơ đồ thi đấu hiện tại!` |

---

### BM12 – Phiếu Cập nhật Trạng thái Giải đấu (FR-7)

**Route:** `/admin/tournaments/:id/status` | **Vai trò:** BTC, Admin

#### Các trường hiển thị & nhập liệu

| Tên trường | Loại input | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã giải đấu | `text` (read-only) | — | — |
| Tên giải đấu | `text` (read-only) | — | — |
| Trạng thái hiện tại | `badge` (read-only) | — | Màu sắc phân biệt |
| Trạng thái chuyển sang | `select` | ✅ | Chỉ hiển thị trạng thái hợp lệ theo vòng đời |
| Người thực hiện | `text` (read-only) | — | Tài khoản đang đăng nhập |
| Thời điểm thay đổi | `datetime` (read-only) | — | Auto = `now()` |
| Lý do | `textarea` | ❌ | Bắt buộc khi chuyển sang `cancelled` |

#### Vòng đời trạng thái (State Machine)

```
draft → open_registration → ongoing → finished
                                    ↘
                              cancelled (từ bất kỳ bước nào)
```

#### Nhãn hiển thị

| Trạng thái kỹ thuật | Nhãn UI | Màu |
|---|---|---|
| `draft` | Bản nháp | Xám |
| `open_registration` | Mở đăng ký | Xanh lá |
| `ongoing` | Đang thi đấu | Xanh dương |
| `finished` | Kết thúc | Tím |
| `cancelled` | Đã huỷ | Đỏ |

---

## Module 4 – Đăng ký & Duyệt Hồ sơ

### BM13 – Phiếu Đăng ký Hồ sơ Thi đấu (FR-10)

**Route:** `/tournaments/:id/register` | **Vai trò:** VĐV

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Họ và tên VĐV | `text` (read-only) | — | Lấy từ profile | — |
| Số CCCD | `text` | ✅ | 12 chữ số | — |
| Ảnh 3×4 | `file upload` | ✅ | `jpg, png`, ≤ 5 MB | Preview ảnh |
| Hạng mục đăng ký | `select` | ✅ | Từ danh sách hạng mục đang mở đăng ký | — |
| VĐV đối tác | `search / autocomplete` | ⚠ Có điều kiện | Bắt buộc nếu hạng mục là `doubles / mixed_doubles` | Tìm theo tên/email |
| Email nhận xác nhận | `email` (pre-filled) | ✅ | Email format | Tự điền từ tài khoản |
| Ngày nộp | `datetime` (read-only) | — | Auto = `now()` | — |

#### Quy tắc hiển thị động

- Khi chọn hạng mục `doubles / mixed_doubles` → hiện trường **VĐV đối tác** (bắt buộc).
- Khi hạng mục là `mixed_doubles` → kiểm tra khác giới với đối tác đã chọn, hiển thị cảnh báo nếu sai.

#### Trạng thái hồ sơ sau nộp

- Mặc định: `pending` (chờ duyệt)
- Hiển thị thông báo: `✅ Hồ sơ đã nộp thành công! Chúng tôi sẽ gửi email xác nhận trong vài phút.`

---

### BM14 – Phiếu Duyệt Hồ sơ (FR-11)

**Route:** `/admin/registrations/:entryId/review` | **Vai trò:** Admin, BTC

#### Các trường hiển thị & nhập liệu

| Tên trường | Loại input | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã hồ sơ / VĐV | `text` (read-only) | — | — |
| Hạng mục thi đấu | `text` (read-only) | — | — |
| Quyết định | `radio` / `button group` | ✅ | `approve / reject / request_supplement` |
| Trạng thái mới | `badge` (read-only) | — | Tự cập nhật theo quyết định |
| Tài khoản Admin duyệt | `text` (read-only) | — | Tài khoản đang đăng nhập |
| Ngày duyệt | `datetime` (read-only) | — | Auto = `now()` |
| Lý do | `textarea` | ⚠ Có điều kiện | **Bắt buộc** khi quyết định là `reject` hoặc `request_supplement` |

#### Ánh xạ quyết định → trạng thái

| Quyết định | Trạng thái mới | Gửi email |
|---|---|---|
| `approve` | `approved` | ✅ Thông báo duyệt |
| `reject` | `rejected` | ✅ Thông báo từ chối + lý do |
| `request_supplement` | `supplement_required` | ✅ Yêu cầu bổ sung hồ sơ |

---

### BM15 – Giao diện Tra cứu Hồ sơ VĐV/HLV (FR-12)

**Route:** `/admin/athletes/search` | **Vai trò:** Admin, BTC, Trọng tài (chỉ đọc)

#### Các trường tìm kiếm

| Tên trường | Loại input | Ghi chú |
|---|---|---|
| Tìm theo ID VĐV / HLV | `text` | UUID hoặc mã ngắn |
| Từ khoá | `text` | Tìm theo tên, CLB, tỉnh |

#### Thông tin hiển thị kết quả (read-only)

- Thông tin chi tiết: tên, ngày sinh, CLB, vai trò
- Thành tích đạt được (danh sách giải đã tham gia, kết quả)
- Xếp hạng hiện tại (`ranking_points`)
- Lịch sử hồ sơ tham dự

> ⚠ Màn hình **chỉ đọc** – không có trường nhập liệu mới. Mọi tra cứu có thể được ghi vào `profile_access_log`.

---

## Module 5 – Điều hành Thi đấu

### BM16 – Phiếu Phân công Trọng tài

**Route:** `/admin/matches/:matchId/assign-referee` | **Vai trò:** BTC

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Mã phân công | `text` (read-only) | — | Auto-generate | — |
| Ngày phân công | `datetime` (read-only) | — | Auto = `now()` | — |
| Trận đấu | `text` (read-only) | — | Từ context | — |
| Ngày thi đấu | `date` (read-only) | — | Từ lịch thi đấu | — |
| Sân số | `text` (read-only) | — | Từ lịch thi đấu | — |
| Giờ bắt đầu dự kiến | `time` (read-only) | — | Từ lịch thi đấu | — |
| Mã trọng tài | `search` | ✅ | Chỉ hiện trọng tài `QG_A / QG_B` còn rảnh | Kiểm tra xung đột giờ |
| Họ tên trọng tài | `text` (read-only) | — | Tự điền sau khi chọn | — |
| Chứng chỉ | `badge` (read-only) | — | `QG_A` hoặc `QG_B` | — |
| Vai trò trong trận | `select` | ✅ | `main_referee / line_judge / service_judge` | — |
| Số trận đã phân hôm nay | `number` (read-only) | — | Hiển thị cảnh báo khi ≥ 4 | — |
| Người duyệt (BTC) | `text` (read-only) | — | Tài khoản đang đăng nhập | — |
| Trạng thái phân công | `select` | ✅ | `pending / approved / cancelled` | Default: `pending` |
| Ghi chú | `textarea` | ❌ | ≤ 300 ký tự | — |

#### Ràng buộc kiểm tra phía FE (hiển thị cảnh báo)

- Trọng tài đã có ≥ 4 trận hôm nay → `⛔ Vượt giới hạn 4 trận/ngày`
- Trùng giờ trận khác → `⛔ Trọng tài bận vào khung giờ này`
- Cùng CLB với VĐV → `⛔ Trọng tài cùng CLB với VĐV tham gia trận`
- Hoán đổi < 15 phút trước giờ đấu → `⛔ Không thể hoán đổi trong vòng 15 phút trước giờ đấu`

---

### BM17 – Phiếu Ghi điểm Trận đấu (App Trọng tài)

**Route:** `/referee/matches/:matchId/score` | **Vai trò:** Trọng tài (app mobile)

#### Thông tin hiển thị (read-only)

| Thông tin | Ghi chú |
|---|---|
| Mã trận đấu | — |
| Sân số | — |
| Nội dung (MS/WS/MD/WD/XD) | — |
| Vòng đấu | — |
| VĐV bên A + CLB | — |
| VĐV bên B + CLB | — |
| Trọng tài chính | — |
| Thời gian bắt đầu | — |

#### Bảng điểm tương tác

| Trường | Loại | Ghi chú |
|---|---|---|
| Điểm Set 1 (A – B) | Số tự tăng | Nút `+1 A` / `+1 B` |
| Điểm Set 2 (A – B) | Số tự tăng | Hiện khi set 1 kết thúc |
| Điểm Set 3 (A – B) | Số tự tăng | Hiện khi cần set 3 |
| Bên giao cầu hiện tại | `toggle` | A / B, cập nhật tự động |
| Tổng set thắng (A / B) | `number` (read-only) | Tự tính |
| Bên thắng trận | `text` (read-only) | Tự xác định khi kết thúc |
| Trạng thái trận | `badge` | `scheduled / live / completed / cancelled` |

#### Quy tắc

- Mỗi lần ghi điểm: hiện nút **Undo** đếm ngược 8 giây
- Set kết thúc khi: đạt 21 điểm AND cách biệt ≥ 2, hoặc đạt 30 điểm (deuce cap)
- Khi offline: queue sự kiện cục bộ, hiển thị badge `📵 Offline – X sự kiện chờ đồng bộ`
- Khi kết nối lại: auto-sync, hiển thị `✅ Đã đồng bộ X sự kiện`

---

### BM18 – Phiếu Điều phối Lịch thi đấu

**Route:** `/admin/tournaments/:id/schedule` | **Vai trò:** BTC

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Mã lịch | `text` (read-only) | — | Auto-generate | — |
| Ngày tạo lịch | `datetime` (read-only) | — | Auto | — |
| Giải đấu | `text` (read-only) | — | Từ context | — |
| Mã nội dung (Event) | `select` | ✅ | Từ danh sách hạng mục | — |
| Mã trận đấu | `select` | ✅ | Từ danh sách trận | — |
| Vòng đấu | `text` (read-only) | — | Tự điền | — |
| Sân số | `select` | ✅ | Từ danh sách sân khả dụng | Kiểm tra xung đột |
| Ngày thi đấu | `date` | ✅ | Trong khoảng ngày giải đấu | — |
| Giờ bắt đầu dự kiến | `time` | ✅ | Cách trận trước ≥ 30 phút (cùng sân) | — |
| VĐV / Đội A | `text` (read-only) | — | Từ bracket | — |
| VĐV / Đội B | `text` (read-only) | — | Từ bracket | — |
| Trọng tài được phân | `search` | ❌ | Kiểm tra xung đột | — |
| Trạng thái lịch | `select` | ✅ | `upcoming / live / done / postponed` | — |
| Ghi chú điều phối | `textarea` | ❌ | ≤ 500 ký tự | — |

#### Ràng buộc hiển thị cảnh báo FE

- 2 trận cùng sân cùng giờ → `⛔ Xung đột sân: đã có trận khác vào khung giờ này`
- Khoảng cách < 30 phút → `⛔ Cần cách ít nhất 30 phút so với trận trước trên sân này`
- VĐV thi đấu 2 trận trùng giờ → `⛔ VĐV [tên] đã có lịch thi đấu vào giờ này`

---

### BM19 – Phiếu Lịch sử Ghi điểm (Audit / Sync)

**Route:** `/admin/matches/:matchId/audit-log` | **Vai trò:** Admin, BTC (chỉ đọc)

> ⚠ Màn hình **chỉ đọc** – bảng append-only, không có form nhập liệu.

#### Thông tin hiển thị (dạng bảng)

| Cột | Ghi chú |
|---|---|
| Mã sự kiện (`client_event_id`) | UNIQUE |
| Mã trận đấu | — |
| Set số | — |
| Bên ghi điểm | A / B |
| Điểm trước (A – B) | — |
| Điểm sau (A – B) | — |
| Bên giao cầu trước / sau | — |
| Trọng tài ghi | — |
| Thời điểm client | — |
| Thời điểm server nhận | — |
| Ghi nhận offline | `badge`: Online / Offline |
| Is Undone | `badge`: Đã undo / — |

#### Bộ lọc

- Lọc theo: Set số, Bên ghi điểm, Ghi nhận offline (có/không), Is Undone (có/không)
- Xuất CSV / Excel

---

### BM20 – Bảng Xếp hạng Nội dung

**Route:** `/tournaments/:id/leaderboard/:eventId` | **Vai trò:** Tất cả (xem)

> Màn hình **chỉ đọc** – cập nhật real-time (polling hoặc WebSocket), refresh ≤ 3 giây.

#### Thông tin hiển thị

| Cột | Ghi chú |
|---|---|
| Hạng | Số thứ tự |
| Mã VĐV | — |
| Họ tên VĐV | — |
| CLB | — |
| Số trận đã đấu | — |
| Thắng / Thua | — |
| Set thắng / thua | — |
| Hiệu số điểm | — |
| Tổng điểm thưởng | Tô đậm |
| Trạng thái | `live` / `finished` |

#### Quy tắc tie-break hiển thị

1. Đối đầu trực tiếp → 2. Hiệu số set → 3. Hiệu số điểm

---

### BM21 – Dashboard Thống kê Tổng quan

**Route:** `/admin/tournaments/:id/dashboard` | **Vai trò:** Admin, BTC (xuất), Khán giả (xem)

> Màn hình **chỉ đọc** – refresh tối đa 3 giây, hỗ trợ ≥ 5.000 CCU.

#### Các metric hiển thị

| Metric | Loại widget | Ghi chú |
|---|---|---|
| Tên giải đấu + ngày | Header card | — |
| Tổng số trận | Counter card | — |
| Số trận đã hoàn tất | Counter card | Màu xanh |
| Số trận đang live | Counter card | Màu đỏ nhấp nháy |
| Số trận sắp diễn ra | Counter card | Màu vàng |
| Số sân đang sử dụng | Counter card | — |
| Số trọng tài đang trực | Counter card | — |
| Top 1 BXH Nam | Player card | Ảnh + tên + điểm |
| Top 1 BXH Nữ | Player card | Ảnh + tên + điểm |
| Trận dài nhất | Highlight card | Mã trận + thời lượng |
| VĐV ghi nhiều điểm nhất | Highlight card | — |
| Cập nhật lần cuối | Timestamp | `HH:MM:SS` |
| Số người xem real-time | Counter | WebSocket |

#### Nút hành động (BTC/Admin)

| Nút | Hành động |
|---|---|
| **Xuất Excel** | GET `/api/tournaments/:id/dashboard/export?format=xlsx` |
| **Xuất PDF** | GET `/api/tournaments/:id/dashboard/export?format=pdf` |

---

## Module 6 – Đồng bộ Offline

### BM22 – Phiếu Đồng bộ Dữ liệu Offline

**Route:** `/referee/sync-log` | **Vai trò:** Trọng tài (app mobile)

> Màn hình **chủ yếu đọc** – tự động thực hiện, trọng tài chỉ quan sát.

#### Thông tin hiển thị (read-only)

| Tên trường | Ghi chú |
|---|---|
| Mã phiên đồng bộ | Auto-generate |
| Thiết bị trọng tài | Model thiết bị + OS |
| Mã trọng tài | — |
| Họ tên trọng tài | — |
| Thời điểm mất kết nối | Timestamp |
| Thời điểm kết nối lại | Timestamp |
| Số sự kiện chờ đẩy | Counter |
| Số sự kiện đã đẩy thành công | Counter (xanh) |
| Số sự kiện bị từ chối (trùng) | Counter (vàng) |
| Số sự kiện bị xung đột | Counter (đỏ) |
| Trạng thái phiên | `badge`: `syncing / completed / error` |
| Thời điểm hoàn tất sync | Timestamp |
| Ghi chú lỗi | Textbox (read-only) |

#### Nút hành động (khi trạng thái = `error`)

| Nút | Hành động |
|---|---|
| **Thử lại đồng bộ** | Trigger re-sync |
| Báo cáo xung đột | Gửi log cho BTC |

---

## Module 7 – Tài chính & Thanh toán

### BM23 – Phiếu Thu Lệ phí Đăng ký

**Route:** `/payments/:entryId/pay` | **Vai trò:** VĐV (thanh toán) / BTC (xem)

#### Thông tin hiển thị (read-only) cho VĐV

| Tên trường | Ghi chú |
|---|---|
| Mã hồ sơ đăng ký | — |
| Hạng mục thi đấu | — |
| Họ tên VĐV | — |
| Số tiền phải nộp | Format `xxx.xxx VNĐ` |
| Hạn thanh toán | Ngày đến hạn (7 ngày sau đăng ký) |
| Số tài khoản thụ hưởng | Tự động điền |
| Ngân hàng | — |
| Nội dung chuyển khoản | Mã hồ sơ tự động điền |

#### Các trường nhập liệu (khi thanh toán thủ công)

| Tên trường | Loại input | Bắt buộc | Ghi chú |
|---|---|---|---|
| Phương thức thanh toán | `select` | ✅ | `bank_transfer / card / cash / e-wallet` |
| Mã giao dịch | `text` | ✅ | Từ ngân hàng / ví |
| Ảnh chứng từ | `file upload` | ❌ | `jpg, png, pdf`, ≤ 10 MB |

#### Nút hành động

| Nút | Hành động |
|---|---|
| **Thanh toán online** | Redirect cổng thanh toán |
| **Xác nhận đã chuyển khoản** | POST `/api/payments` |

---

### BM24 – Phiếu Nhập Chi phí Tổ chức

**Route:** `/admin/tournaments/:id/expenses/new` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Tên chi phí / Mô tả | `text` | ✅ | ≤ 300 ký tự | — |
| Số hóa đơn | `text` | ❌ | ≤ 100 ký tự | — |
| Số tiền (VNĐ) | `number` | ✅ | > 0, format nghìn phân cách | — |
| Ngày chi | `date` | ✅ | ≤ ngày hiện tại | — |
| Phương thức thanh toán | `select` | ✅ | `cash / bank_transfer / card / other` | — |
| File chứng từ | `file upload` | ❌ | `jpg, png, pdf`, ≤ 10 MB | — |
| Hạng mục ngân sách | `select` | ❌ | Từ `budget_lines` của giải | Hiển thị % đã chi |
| Trạng thái | `select` | ✅ | `draft / submitted / approved / rejected / paid` | Default: `draft` |

#### Cảnh báo ngân sách

- Khi nhập số tiền, tính tổng với `actual_spent`:
  - ≥ 85% `planned_amount` → `⚠️ Đã sử dụng X% ngân sách hạng mục này`
  - ≥ 100% → `⛔ Vượt ngân sách! Không thể thêm chi phí mới.`

---

### BM25 – Phiếu Trích xuất Báo cáo Pháp lý

**Route:** `/admin/tournaments/:id/reports/generate` | **Vai trò:** BTC, Admin

#### Các trường nhập liệu

| Tên trường | Loại input | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Giải đấu | `text` (read-only) | — | Từ context | — |
| Loại báo cáo | `select` | ✅ | `summary / financial / attendance / other` | — |
| Template báo cáo | `select` | ✅ | Từ `report_templates` | — |
| Tham số lọc | Động theo template | — | Theo cấu hình `schema` | — |
| Mã công văn / Nơi nộp | `text` | ❌ | ≤ 100 ký tự | Điền sau khi có file |
| Ghi chú | `textarea` | ❌ | ≤ 500 ký tự | — |

#### Trạng thái báo cáo

| Trạng thái | Mô tả | Hành động FE |
|---|---|---|
| `generating` | Đang tạo | Hiển thị spinner, polling trạng thái |
| `ready` | Hoàn tất | Hiện nút **Tải xuống** + verify SHA-256 |
| `error` | Lỗi | Hiện nút **Thử lại** + thông báo lỗi |
| `submitted` | Đã nộp | Read-only, hiện mã công văn |

#### Nút hành động

| Nút | Hành động | Điều kiện |
|---|---|---|
| **Tạo báo cáo** | POST `/api/reports/generate` | — |
| **Tải xuống** | GET file + verify SHA-256 | `status = ready` |
| **Đánh dấu đã nộp** | PATCH `status = submitted` | `status = ready` |

---

## Phụ lục – Quy ước chung cho FE

### Quy tắc Validation chung

| Quy tắc | Áp dụng |
|---|---|
| Validate `onBlur` (khi rời focus) | Tất cả trường nhập liệu |
| Validate `onSubmit` (trước khi gửi) | Tất cả form |
| Hiển thị lỗi inline dưới field | Tất cả |
| Không submit khi có lỗi | Tất cả |
| HTTPS bắt buộc | Toàn hệ thống |
| XSS Sanitization trước khi submit | Rich text, textarea |

### Quy ước trạng thái Loading / Error

| Tình huống | Xử lý UI |
|---|---|
| Đang gọi API | Disable nút + spinner |
| Lỗi 400 (validation) | Hiển thị lỗi inline theo field |
| Lỗi 401 (chưa đăng nhập) | Redirect về `/login` |
| Lỗi 403 (không đủ quyền) | Hiển thị trang `403 Forbidden` |
| Lỗi 500 (server) | Toast: `Đã có lỗi xảy ra. Vui lòng thử lại.` |
| Upload file | Progress bar % |

### Phân quyền hiển thị theo Role

| Module | Admin | BTC | Trọng tài | VĐV | Khán giả |
|---|---|---|---|---|---|
| Quản trị tài khoản (BM4) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tạo/sửa giải đấu (BM10-12) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Duyệt hồ sơ (BM14) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Phân công trọng tài (BM16) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ghi điểm (BM17) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Đăng ký hồ sơ (BM13) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Xem dashboard (BM21) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Xuất báo cáo (BM25) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Nhập chi phí (BM24) | ✅ | ✅ | ❌ | ❌ | ❌ |

---

*Tài liệu này được tổng hợp từ Database Design Report – Hệ thống Quản lý Giải đấu Cầu lông Quốc gia, Nhóm 2, Khoa CNPM – UIT.*

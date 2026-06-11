# BÁO CÁO THIẾT KẾ MÔ HÌNH DỮ LIỆU LUỒNG THI ĐẤU, CHẤM ĐIỂM & THỐNG KÊ

## 1. Tổng quan

### 1.1. Mục tiêu thiết kế

* **Phân công trọng tài**: BTC điều phối trọng tài vào từng trận đấu cụ thể, đảm bảo không xung đột về lịch và lợi ích.
* **Ghi điểm trận đấu**: Trọng tài nhập điểm trực tiếp tại sân qua giao diện App tinh gọn, hỗ trợ **Offline Mode** (ghi điểm cục bộ khi rớt mạng, tự đồng bộ khi kết nối lại).
* **Tổng hợp kết quả real-time**: Tự động tính toán bảng xếp hạng và sơ đồ thi đấu ngay sau khi trận kết thúc.
* **Thống kê & Dashboard**: Hiển thị toàn cảnh giải đấu cho BTC và khán giả với độ trễ phản hồi < 3 giây, chịu tải 5000 CCU.

---

## 2. Phân tích yêu cầu

### 2.1. Phân tích từ FR

**FR-17 Nhập kết quả trận đấu (Must Have)**
* Input: Mã trận, điểm từng set, bên ghi điểm, bên giao cầu, `client_event_id`
* Output: Trạng thái trận cập nhật, điểm hiển thị real-time
* Side effects: Lưu sự kiện vào `match_scores`; broadcast WebSocket đến khán giả; cập nhật queue offline nếu mất kết nối
* Postcondition: Sự kiện ghi điểm tồn tại trong DB hoặc trong hàng đợi cục bộ chờ đồng bộ

**FR-18 Tự động xác định bên thắng (Must Have)**
* Input: Điểm các set của trận
* Output: `winner_side` (A/B), `status = completed`
* Side effects: Trigger cập nhật `leaderboards`; phát sinh trận kế tiếp trong bracket
* Postcondition: Trận chuyển trạng thái `completed`, không cho ghi thêm điểm

**FR-19 Xử lý trường hợp đặc biệt (Must Have)**
* Input: Loại sự cố (walkover / forfeit / kháng nghị), lý do, người ghi nhận
* Output: Cập nhật trạng thái trận, biên bản sự cố
* Side effects: Gửi thông báo cho BTC; ghi log audit
* Postcondition: Trận có `status = cancelled` hoặc đánh dấu kháng nghị chờ xử lý

**FR-20 Phân công trọng tài (Must Have)**
* Input: Mã trận, mã trọng tài, vai trò (chính/biên/giao cầu), người duyệt
* Output: Bản ghi phân công, lịch hiển thị cho trọng tài
* Side effects: Gửi thông báo cho trọng tài kèm số sân và giờ thi đấu
* Postcondition: Bản ghi tồn tại trong `referee_assignments` với `status = confirmed`

**FR-21 Cập nhật sơ đồ & bảng xếp hạng (Must Have)**
* Input: Kết quả trận vừa kết thúc
* Output: Bracket mới, bảng xếp hạng mới
* Side effects: Broadcast bảng xếp hạng qua WebSocket; làm mới cache Redis
* Postcondition: `leaderboards` cập nhật trong vòng 3 giây sau khi trận kết thúc

**FR-25 Xem kết quả trận đấu (Must Have)**
* Input: Mã trận hoặc bộ lọc (ngày/sân/nội dung)
* Output: Điểm từng set, người thắng, thời lượng, danh sách VĐV
* Side effects: Ghi log truy cập (tùy cấu hình)
* Postcondition: Dữ liệu trả về từ cache hoặc DB, không thay đổi trạng thái

**FR-33 Thống kê giải đấu (Optional)**
* Input: Mã giải đấu, bộ lọc thời gian
* Output: Dashboard số liệu (số trận, tỷ lệ hoàn thành, sự cố, top VĐV)
* Side effects: Có thể xuất Excel / PDF
* Postcondition: Dữ liệu thống kê tổng hợp từ `matches`, `match_scores`, `leaderboards`

### 2.2. Các Business Rules

#### 2.2.1. Quy định phân công trọng tài

**Quy định về chứng chỉ**
* Trọng tài bắt buộc có chứng chỉ `QG_A` hoặc `QG_B` còn hiệu lực.
* Vai trò trọng tài chính (`chief`) bắt buộc chứng chỉ `QG_A`.

**Quy định về xung đột lịch & lợi ích**
* Một trọng tài không được phân công 2 trận trùng giờ.
* Trọng tài không điều khiển trận có VĐV cùng CLB chủ quản.
* Mỗi trọng tài tối đa 4 trận/ngày.
* BTC có quyền hoán đổi trọng tài trước giờ bắt đầu trận ≥ 15 phút.

#### 2.2.2. Quy định tính điểm trận đấu

**Quy định về set & điểm**
* Thể thức Best-of-3 (mặc định) hoặc Best-of-5 sets.
* Mỗi set chơi đến **21 điểm**, cách biệt tối thiểu 2 điểm.
* Deuce cap = **30 điểm** (bên nào đạt 30 trước sẽ thắng set).
* Bên ghi điểm giành quyền giao cầu ở pha kế tiếp.

**Quy định về thao tác trọng tài**
* Trọng tài có quyền **Undo** điểm vừa ghi trong vòng **8 giây**.
* Mỗi pha ghi điểm thao tác tối đa **2 chạm**.
* Trận kết thúc khi 1 bên thắng `ceil(maxSets / 2)` sets.

#### 2.2.3. Quy định đồng bộ dữ liệu (Offline Mode)

* Khi mất kết nối, sự kiện ghi điểm lưu vào hàng đợi cục bộ (IndexedDB).
* Mỗi sự kiện mang `client_event_id` (UUID v4) để chống trùng.
* Khi có mạng trở lại, client tự `POST` lô sự kiện theo thứ tự thời gian.
* Server xử lý idempotent: trùng `client_event_id` → trả 200, không ghi lại.
* Xung đột → giữ bản đến trước, ghi log cảnh báo BTC.

#### 2.2.4. Quy định xếp hạng (Leaderboard)

* Điểm thưởng: Thắng = **3 đ**, Thua = **0 đ**, Thua sau 3 sets = **1 đ** (an ủi).
* Tie-break: (1) đối đầu trực tiếp → (2) hiệu số set → (3) hiệu số điểm.
* Bảng xếp hạng cập nhật trong vòng **3 giây** sau khi trận kết thúc.
* Mỗi nội dung (MS/WS/MD/WD/XD) có 1 bảng xếp hạng riêng.

#### 2.2.5. Chuyển đổi trạng thái trận đấu

| Trạng thái | Trigger | Conditions | Side effects |
|---|---|---|---|
| Upcoming → Live | Trọng tài bấm "Bắt đầu trận" | Trọng tài đã được phân công, trận đến giờ thi đấu, sân ở trạng thái `idle` | Ghi `started_at`, đổi sân sang `live`, broadcast WebSocket |
| Live → Completed | Một bên đạt `ceil(maxSets/2)` sets thắng | Điểm cuối hợp lệ theo QĐ về set | Ghi `ended_at`, `winner_side`; trigger cập nhật `leaderboards`; phát sinh trận kế tiếp |
| Live → Cancelled | BTC xác nhận walkover/forfeit | Có lý do hợp lệ và quyền `match.cancel` | Ghi log audit, gửi thông báo, cập nhật bracket |
| Bất kỳ → Disputed | VĐV nộp kháng nghị | Kháng nghị trong 24h kể từ khi trận kết thúc | Trận tạm khóa cập nhật `leaderboards`, chờ BTC xử lý |

---

## 3. Biểu mẫu

### 3.1. Phân công trọng tài

| Biểu mẫu | **Phiếu Phân Công Trọng Tài** |
|---|---|
| Mã phân công: ........................................... | Ngày phân công: ......................................... |
| Mã trận: ..................................................... | Ngày thi đấu: .............................................. |
| Sân số: ....................................................... | Giờ bắt đầu dự kiến: ................................... |
| Mã trọng tài: ............................................... | Họ tên trọng tài: ......................................... |
| Chứng chỉ (QG_A/QG_B): .......................... | Vai trò (chính/biên/giao cầu): .................... |
| Số trận đã phân hôm nay: ........................... | CLB cần tránh: ............................................ |
| Người duyệt (BTC): ..................................... | Trạng thái (chờ/đã duyệt/hủy): .................. |
| Ghi chú: ......................................................................................................................... |

> **Qui định:** Trọng tài bắt buộc chứng chỉ QG_A hoặc QG_B. Một trọng tài tối đa 4 trận/ngày, không trùng giờ, không cùng CLB với VĐV. BTC có thể hoán đổi trước trận ≥ 15 phút.

### 3.2. Ghi điểm trận đấu (App Trọng tài)

| Biểu mẫu | **Phiếu Ghi Điểm Trận Đấu** |
|---|---|
| Mã trận: ..................................................... | Sân số: ....................................................... |
| Nội dung (MS/WS/MD/WD/XD): ................. | Vòng đấu: ................................................... |
| Họ tên VĐV bên A: ..................................... | Họ tên VĐV bên B: ..................................... |
| CLB bên A: ................................................. | CLB bên B: ................................................. |
| Trọng tài chính: ........................................... | Mã trọng tài: ............................................... |
| Thời gian bắt đầu: ....................................... | Thời gian kết thúc: ..................................... |
| Điểm Set 1 (A − B): ................................... | Điểm Set 2 (A − B): ................................... |
| Điểm Set 3 (A − B): ................................... | Bên giao cầu hiện tại: ................................ |
| Tổng sets thắng (A): .................................. | Tổng sets thắng (B): .................................. |
| Bên thắng trận: ........................................... | Trạng thái trận (live/completed): ............... |

> **Qui định:** Mỗi set 21 điểm, cách biệt ≥ 2, deuce cap 30. Best-of-3 mặc định. Mỗi pha tối đa 2 chạm, có **Undo** trong 8 giây. Khi offline, sự kiện queue cục bộ, tự sync khi online.

### 3.3. Điều phối lịch thi đấu

| Biểu mẫu | **Phiếu Điều Phối Lịch Thi Đấu** |
|---|---|
| Mã lịch: ....................................................... | Ngày tạo lịch: .............................................. |
| Mã giải đấu: ............................................... | Tên giải đấu: ............................................... |
| Mã trận: ..................................................... | Mã nội dung (Event): ................................. |
| Vòng đấu: ................................................... | Sân số: ....................................................... |
| Ngày thi đấu: .............................................. | Giờ bắt đầu dự kiến: ................................... |
| VĐV/Đội A: ................................................ | VĐV/Đội B: ................................................ |
| Trọng tài được phân: .................................. | Trạng thái (upcoming/live/done): .............. |
| Người tạo lịch: ............................................. | Người duyệt cuối: ....................................... |
| Ghi chú điều phối: ......................................................................................................... |

> **Qui định:** Không xếp 2 trận cùng sân & cùng giờ. Khoảng cách tối thiểu giữa 2 trận liên tiếp trên 1 sân: 30 phút. Một VĐV không thi đấu 2 trận trùng giờ. Lịch chỉ công bố sau khi BTC duyệt cuối.

### 3.4. Lịch sử ghi điểm (Audit / Sync)

| Biểu mẫu | **Phiếu Lịch Sử Ghi Điểm** |
|---|---|
| Mã sự kiện (`client_event_id`): ................... | Mã trận: ..................................................... |
| Set số: ......................................................... | Bên ghi điểm (A/B): ................................... |
| Điểm trước (A − B): .................................. | Điểm sau (A − B): ..................................... |
| Bên giao cầu trước: .................................... | Bên giao cầu sau: ....................................... |
| Gây kết thúc set (có/không): ...................... | Đã bị Undo (có/không): ............................ |
| Trọng tài ghi: ............................................... | Thời điểm tại client: ................................... |
| Thời điểm server nhận: ............................... | Ghi nhận offline (có/không): ..................... |

> **Qui định:** Bảng append-only: chỉ thêm, không sửa, không xóa. `client_event_id` duy nhất, chống trùng khi sync offline. Undo = thêm dòng mới với `is_undone = TRUE`. Xung đột → giữ bản đến trước, ghi log cảnh báo BTC.

### 3.5. Bảng xếp hạng (Leaderboard)

| Biểu mẫu | **Phiếu Bảng Xếp Hạng Nội Dung** |
|---|---|
| Mã giải đấu: ............................................... | Mã nội dung (Event): ................................. |
| Tên nội dung: .............................................. | Ngày cập nhật: ............................................. |
| Hạng: .......................................................... | Mã VĐV: ..................................................... |
| Họ tên VĐV: ............................................... | CLB: ............................................................. |
| Số trận đã đấu: ........................................... | Số trận thắng: ............................................. |
| Số trận thua: ............................................... | Số set thắng / thua: .................................... |
| Hiệu số điểm: .............................................. | Tổng điểm thưởng: .................................... |
| Trận gần nhất: ............................................. | Trạng thái (live/finished): .......................... |

> **Qui định:** Thắng = 3đ, Thua = 0đ, Thua sau 3 sets = 1đ. Tie-break: đối đầu trực tiếp → hiệu số set → hiệu số điểm. Cập nhật ≤ 3s sau khi trận kết thúc. Mỗi nội dung có bảng riêng.

### 3.6. Dashboard thống kê tổng quan

| Biểu mẫu | **Phiếu Dashboard Thống Kê** |
|---|---|
| Mã giải đấu: ............................................... | Tên giải đấu: ............................................... |
| Ngày bắt đầu: ............................................. | Ngày kết thúc: ............................................. |
| Tổng số trận: ............................................... | Số trận đã hoàn tất: .................................... |
| Số trận đang live: ....................................... | Số trận sắp diễn ra: .................................... |
| Số sân đang sử dụng: ................................. | Tổng số trọng tài đang trực: ..................... |
| Top 1 BXH MS: ........................................... | Top 1 BXH WS: ........................................... |
| Trận có thời lượng dài nhất: ..................... | VĐV ghi nhiều điểm nhất: ........................ |
| Cập nhật lần cuối: ...................................... | Số người xem real-time: ............................ |
| Người xuất báo cáo: ................................... | Định dạng xuất (Excel/PDF): ..................... |

> **Qui định:** Số liệu refresh ≤ 3 giây. Khán giả chỉ xem. BTC có quyền xuất Excel / PDF. Chịu tải tối thiểu 5000 CCU đồng thời (NFR).

### 3.7. Đồng bộ dữ liệu Offline (Sync Log)

| Biểu mẫu | **Phiếu Đồng Bộ Offline** |
|---|---|
| Mã phiên đồng bộ: ..................................... | Mã thiết bị trọng tài: ................................. |
| Mã trọng tài: ............................................... | Họ tên trọng tài: ......................................... |
| Thời điểm mất kết nối: ............................... | Thời điểm kết nối lại: ................................. |
| Số sự kiện chờ đẩy: ................................... | Số sự kiện đã đẩy thành công: .................. |
| Số sự kiện bị từ chối (trùng): ..................... | Số sự kiện bị xung đột: ............................. |
| Trạng thái phiên (đang/xong/lỗi): .............. | Thời điểm hoàn tất sync: ........................... |
| Ghi chú lỗi (nếu có): ......................................................................................................... |

> **Qui định:** Đẩy theo thứ tự thời gian. Server idempotent theo `client_event_id`. Sau sync thành công, client xóa hàng đợi cục bộ. Xung đột → hệ thống cảnh báo BTC.

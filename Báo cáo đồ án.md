# ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH

**TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN**

**KHOA KHOA HỌC VÀ KĨ THUẬT THÔNG TIN**

<br>
<br>

# **BÁO CÁO ĐỒ ÁN CUỐI KỲ**

## **MÔN: NHẬP MÔN CÔNG NGHỆ PHẦN MỀM (SE104)**

### **Đề tài: Hệ thống Quản lý Giải vô địch Cầu lông Quốc gia (ShuttleOps)**

<br>
<br>

**Giáo viên hướng dẫn:** TS. Nguyễn Văn A
**Nhóm sinh viên thực hiện:**
1. Trương Huy Hoàng         MSSV: 24520574  (Lớp: SE104)
2. Trần Thành Huy           MSSV: 24520707  (Lớp: SE104)
3. Nguyễn Dương Quất Tuấn   MSSV: 24521934  (Lớp: SE104)
4. Nguyễn Xuân Trường       MSSV: 24521897  (Lớp: SE104)
5. Nguyễn Minh Thuận        MSSV: 23521553  (Lớp: SE104)

<br>
<br>

□□ Tp. Hồ Chí Minh, 06/2026 □□

---

## **LỜI CẢM ƠN**

Lời đầu tiên, nhóm thực hiện đồ án chúng em xin được bày tỏ lòng cảm ơn chân thành và sâu sắc nhất đến thầy hướng dẫn, các thầy cô giáo Khoa Khoa học và Kỹ thuật Thông tin – Trường Đại học Công nghệ Thông tin, Đại học Quốc gia Thành phố Hồ Chí Minh đã tận tình dạy dỗ, hướng dẫn và truyền đạt những kiến thức quý báu cho chúng em trong suốt quá trình học tập tại trường cũng như trong môn học Nhập môn Công nghệ Phần mềm (SE104).

Đặc biệt, chúng em xin gửi lời cảm ơn sâu sắc nhất tới thầy hướng dẫn khoa học, người đã luôn dành thời gian quý báu để định hướng, chỉ bảo tận tình và đưa ra những lời khuyên hữu ích giúp nhóm giải quyết các khó khăn trong suốt quá trình thiết kế, hiện thực hóa hệ thống quản lý giải đấu cầu lông này.

Dù đã có nhiều cố gắng để hoàn thiện hệ thống cũng như tài liệu báo cáo một cách chỉn chu nhất, song do hạn chế về mặt thời gian và kinh nghiệm thực tế, đồ án chắc chắn không tránh khỏi những thiếu sót. Nhóm chúng em rất mong nhận được những ý kiến đóng góp, nhận xét và phê bình từ quý Thầy/Cô để đồ án ngày càng hoàn thiện hơn và có thể áp dụng vào thực tiễn cuộc sống.

Chúng em xin chân thành cảm ơn!

---

## **BẢNG PHÂN CÔNG, ĐÁNH GIÁ THÀNH VIÊN:**

Bảng 0.1: Bảng phân công và đánh giá đóng góp thành viên

| Họ và tên | MSSV | Phân công nhiệm vụ chính | Kết quả & Đóng góp |
| --- | --- | --- | --- |
| **Trương Huy Hoàng** | 24520574 | - Thiết kế giao diện UI/UX Frontend bằng TailwindCSS v4.<br>- Hiện thực các component cốt lõi phía Client.<br>- Quản lý state toàn cục bằng thư viện Zustand store. | Hoàn thành tốt nhiệm vụ được giao.<br>Tỉ lệ đóng góp: 20%<br>Điểm đánh giá: 10/10 |
| **Trần Thành Huy** | 24520707 | - Thiết kế kiến trúc tổng thể API và Database PostgreSQL 16.<br>- Xây dựng backend server sử dụng Node.js & Express.js.<br>- Viết câu lệnh SQL thuần parameterized query tương tác cơ sở dữ liệu. | Hoàn thành tốt nhiệm vụ được giao.<br>Tỉ lệ đóng góp: 20%<br>Điểm đánh giá: 10/10 |
| **Nguyễn Dương Quất Tuấn** | 24521934 | - Thiết kế và phát triển Socket.IO real-time cập nhật điểm số.<br>- Phát triển thuật toán Bracket Engine và mô phỏng bracket.<br>- Thiết lập logic ghi điểm trận đấu và kiểm soát set thi đấu. | Hoàn thành tốt nhiệm vụ được giao.<br>Tỉ lệ đóng góp: 20%<br>Điểm đánh giá: 10/10 |
| **Nguyễn Xuân Trường** | 24521897 | - Tích hợp và mô phỏng cổng thanh toán (Payment flow VNPay/MoMo).<br>- Hiện thực hệ thống trích xuất báo cáo pháp lý (PDF/Excel) & quản lý kho.<br>- Xây dựng các form nghiệp vụ đăng ký và duyệt hồ sơ VĐV. | Hoàn thành tốt nhiệm vụ được giao.<br>Tỉ lệ đóng góp: 20%<br>Điểm đánh giá: 10/10 |
| **Nguyễn Minh Thuận** | 23521553 | - Viết kịch bản kiểm thử tích hợp (Integration Tests) & Unit Tests.<br>- Cấu hình Docker Container (PostgreSQL, Redis, server, client).<br>- Soạn thảo tài liệu đặc tả và biên tập nội dung báo cáo đồ án. | Hoàn thành tốt nhiệm vụ được giao.<br>Tỉ lệ đóng góp: 20%<br>Điểm đánh giá: 10/10 |

---

## **LỜI MỞ ĐẦU**

Trong những năm gần đây, phong trào tập luyện và thi đấu cầu lông tại Việt Nam đang phát triển vô cùng mạnh mẽ, thu hút sự tham gia từ mọi lứa tuổi, từ các giải đấu phong trào địa phương cho đến các giải vô địch quốc gia chuyên nghiệp. Tuy nhiên, việc vận hành và quản lý một giải đấu cầu lông quy mô lớn hiện nay vẫn đang đối mặt với nhiều khó khăn và bất cập. Việc bốc thăm xếp lịch thi đấu, phân công trọng tài, ghi điểm từng set đấu, cập nhật bảng xếp hạng và tổng hợp báo cáo kết quả tài chính thường được thực hiện thủ công hoặc thông qua các công cụ rời rạc (như Excel, giấy tờ). Điều này dẫn tới nguy cơ sai sót dữ liệu, chậm trễ cập nhật kết quả tới khán giả và khó khăn trong công tác lưu trữ, tra cứu thông tin vận động viên.

Nhận thức được nhu cầu cấp thiết đó, nhóm chúng em đã tiến hành nghiên cứu và phát triển đề tài: **"Hệ thống Quản lý Giải vô địch Cầu lông Quốc gia (ShuttleOps)"**. Đây là một nền tảng full-stack ứng dụng công nghệ hiện đại nhằm tự động hóa toàn bộ vòng đời của một giải đấu cầu lông chuyên nghiệp: từ khâu thiết lập giải đấu, mở cổng đăng ký vận động viên trực tuyến, phê duyệt hồ sơ tự động, bốc thăm phân nhánh thi đấu (Bracket Engine), hỗ trợ trọng tài ghi điểm thời gian thực trực tiếp trên thiết bị di động (Offline-first Synchronization) đến việc cập nhật kết quả trực quan cho khán giả và trích xuất báo cáo pháp lý chuẩn quy định.

Tài liệu báo cáo đồ án này sẽ trình bày một cách chi tiết về quá trình xây dựng phần mềm qua các chương sau:
- **Chương 1: Đặc tả yêu cầu phần mềm** - Khảo sát bài toán, xác định yêu cầu chức năng (FR) và phi chức năng (NFR), xây dựng Use Case chi tiết.
- **Chương 2: Thiết kế hệ thống** - Trình bày kiến trúc hệ thống, kiến trúc phần mềm phân tầng, công nghệ stack sử dụng và các giải pháp an toàn bảo mật.
- **Chương 3: Thiết kế phần mềm** - Chi tiết thiết kế cơ sở dữ liệu (ERD và Data Dictionary), các sơ đồ tuần tự (Sequence Diagram), máy trạng thái (State Machine) và thuật toán tạo nhánh đấu.
- **Chương 4: Hiện thực hệ thống** - Mô tả chi tiết mã nguồn, giải pháp xử lý Socket.IO thời gian thực, lưu trữ offline cho trọng tài và cách xử lý xung đột.
- **Chương 5: Kiểm thử phần mềm** - Chiến lược kiểm thử đơn vị, kiểm thử tích hợp, kiểm thử đầu cuối và kết quả chạy test.
- **Chương 6: Triển khai và vận hành** - Hướng dẫn cài đặt, cấu hình container Docker và vận hành hệ thống.
- **Chương 7: Kết luận** - Đánh giá ưu khuyết điểm của hệ thống và đề xuất định hướng phát triển trong tương lai.

---

## **DANH MỤC CÁC BẢNG, HÌNH ẢNH**

### **Danh mục các bảng:**
- Bảng 0.1: Bảng phân công và đánh giá đóng góp thành viên
- Bảng 1.1: Stakeholders và vai trò hệ thống
- Bảng 1.2: Các module chức năng và yêu cầu nghiệp vụ
- Bảng 3.1: Từ điển dữ liệu bảng `users`
- Bảng 3.2: Từ điển dữ liệu bảng `players`
- Bảng 3.3: Từ điển dữ liệu bảng `referees`
- Bảng 3.4: Từ điển dữ liệu bảng `tournaments`
- Bảng 3.5: Từ điển dữ liệu bảng `events`
- Bảng 3.6: Từ điển dữ liệu bảng `courts`
- Bảng 3.7: Từ điển dữ liệu bảng `event_participants`
- Bảng 3.8: Từ điển dữ liệu bảng `matches`
- Bảng 3.9: Từ điển dữ liệu bảng `match_participants`
- Bảng 3.10: Từ điển dữ liệu bảng `match_sets`
- Bảng 3.11: Từ điển dữ liệu bảng `score_events`
- Bảng 3.12: Từ điển dữ liệu bảng `payments`
- Bảng 3.13: Từ điển dữ liệu bảng `payment_transactions`

### **Danh mục hình ảnh:**
- Hình 1.1: Sơ đồ Use Case tổng quát hệ thống ShuttleOps
- Hình 2.1: Sơ đồ kiến trúc tổng thể 3-Tier Client-Server
- Hình 2.2: Sơ đồ kiến trúc phân tầng trong Backend
- Hình 3.1: Sơ đồ thực thể liên kết (ERD) chi tiết
- Hình 3.2: Sơ đồ tuần tự nghiệp vụ Đăng ký thi đấu của Vận động viên
- Hình 3.3: Sơ đồ tuần tự nghiệp vụ Bốc thăm xếp nhánh (Bracket Generation)
- Hình 3.4: Sơ đồ tuần tự nghiệp vụ Ghi điểm trực tiếp (Real-time Scoring)
- Hình 3.5: Máy trạng thái vòng đời Giải đấu (Tournament State Machine)
- Hình 3.6: Máy trạng thái vòng đời Trận đấu (Match State Machine)
- Hình 3.7: Mô hình phân nhánh loại trực tiếp (Single Elimination Bracket)

---

# **CHƯƠNG 1: ĐẶC TẢ YÊU CẦU PHẦN MỀM**

## **1.1 Tổng quan hệ thống**

Hệ thống ShuttleOps được phát triển với mục đích tin học hóa toàn diện quy trình tổ chức giải đấu cầu lông quốc gia. Hệ thống hướng đến việc kết nối và đồng bộ thông tin giữa các bên tham gia nhằm tăng tính chính xác, minh bạch và nâng cao trải nghiệm của cả vận động viên lẫn khán giả.

Bảng 1.1: Stakeholders và vai trò hệ thống

| Stakeholder | Mô tả vai trò | Quyền hạn cốt lõi trên hệ thống |
| --- | --- | --- |
| **Admin (Quản trị hệ thống)** | Người có quyền tối cao quản lý hạ tầng và bảo mật. | Quản lý tài khoản người dùng, phê duyệt phân quyền RBAC, cấu hình tham số hệ thống toàn cục. |
| **BTC (Ban tổ chức)** | Đơn vị chịu trách nhiệm tổ chức và điều phối giải đấu. | Khởi tạo giải đấu, cấu hình nội dung thi đấu, duyệt hồ sơ VĐV, bốc thăm xếp bracket, phân công trọng tài, quản lý tài chính và kho vật tư. |
| **VĐV (Vận động viên)** | Người trực tiếp tham gia tranh tài tại các giải đấu. | Đăng ký tài khoản, nộp hồ sơ tham gia nội dung đấu, thanh toán lệ phí trực tuyến, cập nhật lịch đấu cá nhân. |
| **HLV (Huấn luyện viên)** | Đại diện đoàn thể thao dẫn dắt các vận động viên. | Đăng ký đoàn thi đấu/CLB, nộp danh sách thành viên đoàn, theo dõi lịch đấu và thành tích vận động viên của đơn vị mình. |
| **Trọng tài (Referee)** | Người điều khiển trực tiếp các trận đấu trên sân. | Đăng nhập ứng dụng ghi điểm chuyên dụng, ghi điểm set đấu thời gian thực (hỗ trợ ghi ngoại tuyến khi mất mạng), báo cáo kết quả trận đấu về hệ thống. |
| **Khán giả (Spectator)** | Công chúng theo dõi giải đấu. | Xem tin tức giải đấu, bảng xếp hạng, lịch thi đấu, và cập nhật điểm số trực tiếp (live-score) mà không cần tạo tài khoản. |

---

## **1.2 Yêu cầu chức năng (FR)**

Hệ thống ShuttleOps được chia thành 8 module chức năng chính:

Bảng 1.2: Các module chức năng và yêu cầu nghiệp vụ

| Mã Module | Tên Module | Chức năng chi tiết |
| --- | --- | --- |
| **FR-01** | **Xác thực & Phân quyền (IAM)** | - Đăng ký tài khoản mới và yêu cầu vai trò mong muốn.<br>- Đăng nhập bằng Email/SĐT được xác thực thông qua JWT Token.<br>- Quản lý phân quyền dựa trên vai trò (RBAC) với các quyền được định nghĩa chặt chẽ.<br>- Quản lý danh sách người dùng dành cho Admin. |
| **FR-02** | **Quản lý Thành viên (People)** | - Quản lý thông tin VĐV (CCCD, xếp hạng rating, CLB trực thuộc).<br>- Quản lý hồ sơ Huấn luyện viên và liên kết với CLB.<br>- Quản lý thông tin chứng chỉ Trọng tài (QG_A, QG_B) phục vụ phân công. |
| **FR-03** | **Quản lý Giải đấu (Tournament)** | - BTC khởi tạo giải đấu mới (tên giải, địa điểm, thời gian).<br>- Tạo các nội dung thi đấu (Đơn nam, Đơn nữ, Đôi nam, Đôi nữ, Đôi nam nữ).<br>- Quản lý các sân thi đấu (Courts) trực thuộc từng giải đấu. |
| **FR-04** | **Quản lý Thi đấu (Competition)** | - Tự động tạo bracket sơ đồ thi đấu (loại trực tiếp, vòng tròn).<br>- Điều phối lịch đấu: xếp thời gian, gán sân thi đấu và gán tổ trọng tài.<br>- Tích hợp Socket.IO cập nhật điểm số trực tiếp của set đấu.<br>- Tự động thăng hạng vận động viên thắng cuộc lên vòng đấu tiếp theo. |
| **FR-05** | **Đăng ký thi đấu (Participation)** | - VĐV tự đăng ký tham gia các nội dung thi đấu phù hợp với giới tính, độ tuổi.<br>- BTC thực hiện phê duyệt hồ sơ online hoặc ghi nhận hồ sơ giấy offline.<br>- Gán hạt giống (seeding) cho các cặp đấu trước khi bốc thăm. |
| **FR-06** | **Thông báo (Notification)** | - Gửi thông báo tự động khi thay đổi trạng thái hồ sơ (được duyệt/từ chối).<br>- Gửi thông báo nhắc lịch thi đấu trước 30 phút cho VĐV và Trọng tài.<br>- Hỗ trợ các kênh: In-app notification, Email và gửi mã OTP. |
| **FR-07** | **Tài chính & Thanh toán (Payment)** | - VĐV đóng lệ phí trực tuyến qua cổng VNPay/MoMo mô phỏng.<br>- BTC nhập chứng từ thu chi tổ chức giải đấu, đối chiếu với ngân sách.<br>- Cảnh báo khi chi phí vượt quá giới hạn ngân sách đã lập kế hoạch. |
| **FR-08** | **Báo cáo & Tiện ích (Reporting)** | - Trích xuất báo cáo pháp lý kết quả giải đấu định dạng PDF/Excel.<br>- Quản lý kho vật tư phục vụ giải đấu (số lượng cầu, vợt, lưới phát ra).<br>- Cập nhật bảng xếp hạng (Leaderboard) theo thời gian thực. |

---

## **1.3 Yêu cầu phi chức năng (NFR)**

- **NFR-01: Hiệu năng (Performance):**
  - Thời gian phản hồi API (p95) phải đạt dưới 500ms đối với các tác vụ thông thường.
  - Tần suất cập nhật điểm số live-score đến khán giả có độ trễ dưới 500ms thông qua kết nối Socket.IO.
  - Hệ thống chịu tải tối thiểu 5.000 người dùng truy cập đồng thời (CCU) phục vụ xem điểm trực tiếp.
- **NFR-02: An toàn bảo mật (Security):**
  - Mật khẩu người dùng được băm bằng thuật toán BCrypt cường độ 10 trước khi lưu.
  - Toàn bộ giao thức truyền dữ liệu giữa client và server bắt buộc sử dụng HTTPS/WSS bảo mật.
  - Chống tấn công SQL Injection bằng cách tham số hóa mọi truy vấn (parameterized queries).
  - Sử dụng middleware Zod validation để kiểm tra kiểu dữ liệu đầu vào tại tất cả các router API.
- **NFR-03: Độ tin cậy (Reliability):**
  - Cam kết chỉ số Uptime tối thiểu đạt 99.5% thời gian chạy.
  - Dữ liệu cơ sở dữ liệu PostgreSQL được backup tự động định kỳ 6 tiếng/lần.
  - Thời gian phục hồi hệ thống khi có sự cố (RTO) không vượt quá 30 phút.
- **NFR-04: Khả năng Offline của trọng tài (Offline Capability):**
  - Ứng dụng trọng tài trên PWA có khả năng lưu trữ offline kết quả trận đấu đang điều khiển vào localStorage.
  - Tự động thiết lập cơ chế retry đồng bộ hóa dữ liệu lên server theo đúng thứ tự thời gian ngay khi thiết bị kết nối mạng trở lại.

---

## **1.4 Sơ đồ Use Case tổng quát**

Hệ thống có sơ đồ Use Case tổng quát hiển thị mối tương quan giữa các tác nhân và nghiệp vụ chính:

```mermaid
usecaseDiagram
  actor "Admin" as admin
  actor "Ban Tổ Chức (BTC)" as btc
  actor "Trọng tài" as referee
  actor "Vận động viên" as athlete
  actor "Khán giả" as audience

  admin --> (Quản lý User & Cấp quyền RBAC)
  admin --> (Cấu hình tham số hệ thống)

  btc --> (Khởi tạo Giải đấu & Event)
  btc --> (Phê duyệt Hồ sơ Đăng ký)
  btc --> (Bốc thăm tạo Bracket)
  btc --> (Điều phối Lịch thi đấu)
  btc --> (Quản lý Thu chi ngân sách)
  btc --> (Trích xuất Báo cáo kết quả)

  referee --> (Đăng nhập App Trọng tài)
  referee --> (Ghi điểm trận đấu Real-time)
  referee --> (Đồng bộ dữ liệu Offline)

  athlete --> (Đăng ký nội dung thi đấu)
  athlete --> (Thanh toán lệ phí thi đấu)
  athlete --> (Xem lịch thi đấu cá nhân)

  audience --> (Xem trực tiếp Live-score)
  audience --> (Tra cứu bảng xếp hạng)
  audience --> (Đọc tin tức giải đấu)
```

---

## **1.5 Đặc tả Use Case chi tiết**

### **Use Case 1: Tạo sơ đồ thi đấu (Bracket Generation)**
- **Tác nhân chính:** Ban tổ chức (BTC).
- **Mô tả:** Hệ thống tự động bốc thăm xếp lịch thi đấu vòng 1 và phân bổ nhánh đấu loại trực tiếp (Single Elimination) hoặc đấu vòng tròn (Round Robin).
- **Tiền điều kiện:** Giải đấu ở trạng thái `open_registration` đã đóng cổng đăng ký, danh sách vận động viên tham gia đã được duyệt và gán hạt giống đầy đủ (tối thiểu có 2 vận động viên).
- **Hậu điều kiện:** Các trận đấu được khởi tạo trong bảng `matches` và liên kết với nhau qua `next_match_id`. Danh sách VĐV thi đấu vòng 1 được tạo trong `match_participants`.
- **Luồng sự kiện chính:**
  1. BTC truy cập trang quản lý giải đấu và chọn sự kiện cụ thể (Event).
  2. BTC xác nhận danh sách VĐV hợp lệ đã được duyệt và tiến hành nhấn nút "Bốc thăm & Tạo sơ đồ".
  3. Hệ thống kiểm tra số lượng VĐV, tính toán kích thước bracket là lũy thừa của 2 gần nhất lớn hơn số lượng VĐV.
  4. Hệ thống phân bổ hạt giống (Seed) vào các vị trí cố định theo chuẩn BWF (Seed 1 đầu nhánh, Seed 2 cuối nhánh, Seed 3-4 giữa nhánh).
  5. Hệ thống phân bổ ngẫu nhiên các VĐV còn lại vào các ô trống và điền "BYE" cho những vị trí khuyết.
  6. Hệ thống tạo hàng loạt trận đấu cho toàn bộ các vòng (từ vòng 1 đến chung kết) liên kết ID trận tiếp theo.
  7. Hệ thống tự động cho thắng đối với các trận đấu gặp VĐV "BYE" ở vòng 1 và thăng hạng VĐV đó lên vòng 2.
  8. Hiển thị sơ đồ Bracket trực quan cho BTC.

---

### **Use Case 2: Ghi điểm set đấu trực tuyến (Live Scoring)**
- **Tác nhân chính:** Trọng tài (Referee).
- **Mô tả:** Trọng tài thực hiện cập nhật điểm số trực tiếp từng set đấu trên sân thông qua giao diện Web/Mobile.
- **Tiền điều kiện:** Trận đấu đang ở trạng thái `live`, trọng tài được BTC phân công điều khiển trận đấu đó.
- **Hậu điều kiện:** Điểm số được lưu trữ liên tục và phát trực tiếp thông qua WebSocket/Socket.IO đến tất cả khán giả đang theo dõi.
- **Luồng sự kiện chính:**
  1. Trọng tài đăng nhập, chọn trận đấu được phân công và nhấn "Bắt đầu trận đấu". Trạng thái trận đấu chuyển sang `live`.
  2. Trọng tài thao tác nhấn nút `+1 A` hoặc `+1 B` trên màn hình khi có bên ghi điểm.
  3. Hệ thống tạo bản ghi trong bảng `score_events` (lưu trạng thái điểm cũ, bên ghi điểm, bên giao cầu) và gửi yêu cầu cập nhật điểm set đấu tới database.
  4. Hệ thống gọi hàm `broadcastScoreUpdate` phát tín hiệu socket đến khán giả.
  5. Khi set đấu kết thúc (đạt 21 điểm chênh lệch 2 điểm, hoặc chạm mốc 30 điểm), hệ thống tạo bản ghi kết quả set đấu trong `match_sets` và xác định người thắng set.
  6. Trọng tài tiến hành điều hành set đấu tiếp theo.
  7. Khi trận đấu đủ số set thắng (Best-of-3), hệ thống gợi ý kết thúc trận đấu, trọng tài xác nhận kết quả gửi về BTC.

---

## **1.6 Business Rules & Ràng buộc hệ thống**

- **BR-01 (Quy tắc đôi nam nữ):** Đối với nội dung thi đấu đôi nam nữ (`category_code = 'XD'`), VĐV chính và VĐV đối tác liên kết trong đăng ký phải thuộc hai giới tính khác nhau (1 Nam - 1 Nữ). Ràng buộc này được thực thi tại tầng Service khi nộp hồ sơ.
- **BR-02 (Quy tắc xếp lịch sân):** Không cho phép xếp lịch thi đấu 2 trận trùng sân cùng giờ. Thời gian dự kiến bắt đầu trận đấu sau phải cách thời gian bắt đầu trận đấu trước tối thiểu 30 phút trên cùng một sân đấu.
- **BR-03 (Phân công trọng tài):** Một trọng tài không thể điều khiển quá 4 trận đấu trong cùng một ngày thi đấu. Trọng tài không được phân công điều khiển các trận đấu có vận động viên thuộc cùng câu lạc bộ chủ quản với trọng tài đó để tránh thiên vị.
- **BR-04 (Quy tắc kết thúc set đấu):** Set đấu kết thúc khi một bên đạt 21 điểm trước và cách biệt tối thiểu 2 điểm. Trong trường hợp deuce (điểm số 20-20), trận đấu tiếp tục đến khi có bên cách biệt 2 điểm. Điểm giới hạn tối đa là 30 điểm (ai chạm 30 điểm trước sẽ thắng set đó mà không cần chênh lệch 2 điểm).

---

# **CHƯƠNG 2: THIẾT KẾ HỆ THỐNG**

## **2.1 Kiến trúc tổng thể**

Hệ thống ShuttleOps được thiết kế theo kiến trúc 3-Tier Client-Server, đảm bảo sự tách biệt rõ ràng giữa giao diện hiển thị, logic nghiệp vụ và lưu trữ dữ liệu.

```mermaid
graph TD
  subgraph Client_Layer ["Tầng Giao Diện (Client Layer)"]
    direction LR
    Public_Site["React Public Web (Khán giả)"]
    Admin_Dash["React Admin Dashboard (BTC/Admin)"]
    Referee_App["React PWA App (Trọng tài)"]
  end

  subgraph API_Gateway ["Cổng API & Tải (Nginx / CDN)"]
    Nginx["Nginx Reverse Proxy & Static Hosting"]
  end

  subgraph Backend_Server ["Tầng Nghiệp Vụ (Application Layer)"]
    Express["Node.js & Express Server"]
    SocketIO["Socket.IO WebSocket Server"]
    ZodValidate["Zod Schema Validation Middleware"]
    RBAC["RBAC Middleware (Security)"]
  end

  subgraph Database_Layer ["Tầng Dữ Liệu (Data Layer)"]
    direction LR
    Postgres["PostgreSQL 16 Primary DB"]
    Redis["Redis Cache & Queue Store"]
  end

  Client_Layer -- HTTPS/WSS --> Nginx
  Nginx -- Forward Requests --> Express
  Express --> ZodValidate --> RBAC
  RBAC --> Postgres
  Express -- Publish Event --> SocketIO
  SocketIO -- Real-time Score --> Client_Layer
  Express -- Caching / Queues --> Redis
```

---

## **2.2 Kiến trúc phần mềm Backend (Layered Architecture)**

Mã nguồn Backend của ShuttleOps được tổ chức chặt chẽ theo mô hình phân tầng Layered Architecture hướng cấu trúc thư mục dạng Domain-driven Module:

```mermaid
graph TD
  Router["Router Layer (Khai báo URL & Middleware)"]
  Controller["Controller Layer (Nhận request, validate, gọi service)"]
  Service["Service Layer (Xử lý Business Logic, Transaction)"]
  Repository["Database/Connection Layer (pg Pool, raw SQL queries)"]

  Router -->|Nhận HTTP request| Controller
  Controller -->|Gọi logic nghiệp vụ| Service
  Service -->|Truy vấn dữ liệu| Repository
  Repository -->|Tra cứu / Lưu trữ| DB[(PostgreSQL Database)]
```

- **Router Layer:** Định nghĩa các route RESTful API, liên kết middleware xác thực JWT (`requireAuth`) và kiểm tra quyền truy cập (`requireRole`).
- **Controller Layer:** Tiếp nhận yêu cầu, trích xuất tham số query/body, áp dụng Zod Schema để validate định dạng và trả về cấu trúc response chuẩn (`{ success: true, data: ... }`).
- **Service Layer:** Nơi chứa toàn bộ nghiệp vụ logic của hệ thống cầu lông, điều khiển các Transaction phức tạp (bốc thăm, thăng hạng, tính điểm bảng xếp hạng).
- **Database Layer:** Sử dụng module `db.js` khởi tạo kết nối `pg.Pool` từ thư viện `node-postgres`, thực thi các câu truy vấn SQL thuần có tham số nhằm tăng tối đa hiệu năng.

---

## **2.3 Thiết kế API tổng quan**

Hệ thống cung cấp hệ thống endpoint RESTful đồng nhất:
- Định dạng gói dữ liệu trao đổi: JSON (UTF-8).
- Cách thức kiểm soát lỗi: Sử dụng lớp `AppError(statusCode, message, errorCode)` để xử lý tập trung qua Express Error Middleware.
- Luồng xác thực: Sử dụng HTTP header `Authorization: Bearer <JWT_TOKEN>` phát sinh sau khi đăng nhập thành công. Token mang thông tin về `user_id`, `email`, và `role` để phân quyền trực tiếp trên server.

---

## **2.4 Technology Stack**

- **Frontend:**
  - Framework: React 19, TypeScript, Vite.
  - Quản lý trạng thái: Zustand (gọn nhẹ, tối ưu hóa re-render tốt hơn Redux).
  - CSS UI: TailwindCSS v4 kết hợp các biến tùy chỉnh Custom Properties CSS (`--paper`, `--accent`, `--ink`).
  - Giao thức: Axios client tích hợp interceptor tự động chèn JWT token.
- **Backend:**
  - Runtime: Node.js (v20+), JavaScript ES Modules.
  - Web framework: Express.js (v5).
  - Real-time framework: Socket.IO hỗ trợ đồng bộ điểm số tức thời.
  - Thư viện Validate: Zod Schema.
- **Database & Storage:**
  - Cơ sở dữ liệu chính: PostgreSQL 16.
  - Caching & Hàng đợi: Redis 7.

---

# **CHƯƠNG 3: THIẾT KẾ PHẦN MỀM**

## **3.1 Thiết kế dữ liệu — ERD tổng thể**

Sơ đồ quan hệ thực thể (ERD) mô tả mối liên hệ giữa các bảng trong hệ thống ShuttleOps:

```mermaid
erDiagram
  users ||--o| roles : "primary_role_id"
  users ||--o{ user_roles : "user_id"
  roles ||--o{ user_roles : "role_id"
  roles ||--o{ role_permissions : "role_id"
  permissions ||--o{ role_permissions : "permission_id"

  clubs ||--o{ players : "club_id"
  users ||--o| players : "user_id"
  users ||--o| coaches : "user_id"
  clubs ||--o| coaches : "club_id"
  users ||--o| referees : "user_id"

  venues ||--o{ tournaments : "venue_id"
  users ||--o{ tournaments : "created_by"
  tournaments ||--o{ events : "tournament_id"
  categories ||--o{ events : "category_code"
  tournaments ||--o{ courts : "tournament_id"

  events ||--o{ event_participants : "event_id"
  players ||--o{ event_participants : "player_id"
  players ||--o{ event_participants : "partner_id"

  events ||--o{ matches : "event_id"
  courts ||--o{ matches : "court_id"
  referees ||--o{ matches : "referee_id"
  matches ||--o| matches : "next_match_id"

  matches ||--o{ match_participants : "match_id"
  players ||--o{ match_participants : "player_id"
  matches ||--o{ match_sets : "match_id"
  matches ||--o{ score_events : "match_id"

  users ||--o{ notifications : "user_id"
  notification_templates ||--o{ notifications : "template_id"

  users ||--o{ payments : "user_id"
  event_participants ||--o{ payments : "event_participant_id"
  payments ||--o{ payment_transactions : "payment_id"

  inventory_items ||--o{ inventory_issues : "sku"
  matches ||--o{ inventory_issues : "match_id"
  users ||--o{ inventory_issues : "issued_by"
  tournaments ||--o{ news : "tournament_id"
  users ||--o{ news : "created_by"
  users ||--o{ activity_log : "actor_user_id"
```

---

## **3.2 Thiết kế dữ liệu — Data Dictionary**

Dưới đây là đặc tả chi tiết cấu trúc các bảng dữ liệu cốt lõi của ShuttleOps.

### **1. Bảng `users` (Quản lý Tài khoản)**
Bảng `users` dùng để lưu trữ thông tin tài khoản đăng nhập của tất cả các đối tượng tham gia hệ thống.

Bảng 3.1: Chi tiết bảng `users`

| Tên cột | Kiểu dữ liệu | Khóa | Nullable | Mặc định | Mô tả |
| --- | --- | --- | --- | --- | --- |
| **id** | BIGSERIAL | PK | No | | Khóa chính tự tăng |
| **email** | CITEXT | | No | | Email duy nhất (Case-insensitive) |
| **phone** | VARCHAR(20) | | Yes | | Số điện thoại liên hệ (UNIQUE index) |
| **password_hash**| VARCHAR(255) | | No | | Mật khẩu đã mã hóa bằng BCrypt |
| **name** | VARCHAR(128) | | No | | Họ tên người dùng |
| **primary_role_id**| SMALLINT | FK | Yes | | ID vai trò chính liên kết bảng `roles` |
| **status** | user_status | | No | 'pending' | Trạng thái: approved, pending, rejected |
| **requested_role_id**| SMALLINT | FK | Yes | | ID vai trò người dùng xin đăng ký |
| **note** | TEXT | | Yes | | Ghi chú lý do phê duyệt/từ chối tài khoản |
| **created_at** | TIMESTAMPTZ | | No | now() | Ngày tạo tài khoản |
| **updated_at** | TIMESTAMPTZ | | No | now() | Ngày cập nhật gần nhất |
| **deleted_at** | TIMESTAMPTZ | | Yes | | Thời điểm xóa mềm |

### **2. Bảng `players` (Hồ sơ Vận động viên)**
Lưu trữ hồ sơ cá nhân và các thông số chuyên môn của vận động viên cầu lông.

Bảng 3.2: Chi tiết bảng `players`

| Tên cột | Kiểu dữ liệu | Khóa | Nullable | Mặc định | Mô tả |
| --- | --- | --- | --- | --- | --- |
| **id** | BIGSERIAL | PK | No | | Khóa chính tự tăng |
| **code** | VARCHAR(16) | | Yes | | Mã VĐV duy nhất (ví dụ: A-0142) |
| **user_id** | BIGINT | FK | Yes | | Liên kết tài khoản `users` |
| **club_id** | BIGINT | FK | No | | Mã CLB chủ quản liên kết bảng `clubs` |
| **name** | VARCHAR(128) | | No | | Họ tên VĐV |
| **gender** | gender_t | | No | | Giới tính (M: Nam, F: Nữ) |
| **dob** | DATE | | Yes | | Ngày tháng năm sinh |
| **rating** | INT | | No | 0 | Điểm xếp hạng phong trào tích lũy |
| **tier** | CHAR(1) | | Yes | | Phân hạng trình độ VĐV (A, B, C) |
| **cccd** | VARCHAR(20) | | Yes | | Số căn cước công dân |
| **photo_url** | TEXT | | Yes | | Đường dẫn ảnh chân dung 3x4 |
| **profile_status**| player_profile_st| | No | 'pending' | Trạng thái hồ sơ: approved, pending, incomplete |
| **created_at** | TIMESTAMPTZ | | No | now() | |

### **3. Bảng `tournaments` (Quản lý Giải đấu)**
Lưu trữ thông tin tổng quan về các giải đấu do BTC khởi tạo.

Bảng 3.4: Chi tiết bảng `tournaments`

| Tên cột | Kiểu dữ liệu | Khóa | Nullable | Mặc định | Mô tả |
| --- | --- | --- | --- | --- | --- |
| **id** | BIGSERIAL | PK | No | | Khóa chính |
| **code** | VARCHAR(32) | | No | | Mã giải duy nhất (ví dụ: VNBAD-2026-03) |
| **name** | VARCHAR(255) | | No | | Tên giải đấu (Tiếng Việt) |
| **name_en** | VARCHAR(255) | | Yes | | Tên giải đấu bằng tiếng Anh |
| **venue_id** | BIGINT | FK | Yes | | Địa điểm tổ chức liên kết bảng `venues` |
| **start_date** | DATE | | No | | Ngày bắt đầu giải đấu |
| **end_date** | DATE | | No | | Ngày kết thúc giải đấu (end_date >= start_date) |
| **status** | tournament_status| | No | 'draft' | Trạng thái: draft, live, finished, cancelled |
| **budget** | BIGINT | | No | 0 | Ngân sách tổ chức dự tính (VND) |
| **revenue** | BIGINT | | No | 0 | Doanh thu thực tế (thu từ lệ phí, nhà tài trợ) |
| **created_by** | BIGINT | FK | Yes | | Tài khoản BTC tạo giải đấu |

### **4. Bảng `matches` (Lịch & Kết quả Trận đấu)**
Bảng cốt lõi của module thi đấu, dùng để lưu trữ toàn bộ các trận đấu trong bracket.

Bảng 3.8: Chi tiết bảng `matches`

| Tên cột | Kiểu dữ liệu | Khóa | Nullable | Mặc định | Mô tả |
| --- | --- | --- | --- | --- | --- |
| **id** | BIGSERIAL | PK | No | | Khóa chính tự tăng |
| **code** | VARCHAR(16) | | Yes | | Mã trận đấu (ví dụ: M-1-2-4) |
| **event_id** | BIGINT | FK | No | | Nội dung thi đấu liên kết bảng `events` |
| **round** | VARCHAR(32) | | Yes | | Tên vòng (Tứ kết, Bán kết, Chung kết) |
| **court_id** | BIGINT | FK | Yes | | Sân đấu diễn ra trận đấu liên kết bảng `courts` |
| **referee_id** | BIGINT | FK | Yes | | Trọng tài bắt chính trận đấu |
| **scheduled_at** | TIMESTAMPTZ | | Yes | | Giờ dự kiến thi đấu |
| **started_at** | TIMESTAMPTZ | | Yes | | Thời điểm bắt đầu trận đấu |
| **ended_at** | TIMESTAMPTZ | | Yes | | Thời điểm kết thúc trận đấu |
| **status** | match_status_t| | No | 'upcoming' | Trạng thái: upcoming, live, completed, cancelled |
| **winner_side** | side_t | | Yes | | Bên giành chiến thắng trận (A hoặc B) |
| **next_match_id**| BIGINT | FK | Yes | | Trận đấu tiếp theo của người thắng |
| **next_match_side**| side_t | | Yes | | Phía thi đấu ở trận tiếp theo (A hoặc B) |

---

## **3.3 Thiết kế xử lý — Sơ đồ tuần tự (Sequence Diagram)**

### **1. Luồng đăng ký thi đấu của Vận động viên:**
Vận động viên lựa chọn giải đấu, hạng mục thi đấu và đăng ký qua cổng trực tuyến, sau đó nộp tiền lệ phí.

```mermaid
sequenceDiagram
  autonumber
  actor Athlete as Vận động viên
  participant React as Giao diện React Client
  participant Server as Express Server
  participant DB as Cơ sở dữ liệu (PostgreSQL)

  Athlete->>React: Chọn Hạng mục & Điền form đăng ký
  React->>React: Validate kiểu thi đấu (nếu đôi yêu cầu đối tác)
  React->>Server: POST /api/participation/events/:eventId/register
  Server->>DB: Kiểm tra số suất đăng ký còn lại
  Server->>DB: INSERT INTO event_participants (status = 'pending')
  DB-->>Server: Trả về participant_id
  Server-->>React: Trả về trạng thái đăng ký thành công
  React-->>Athlete: Yêu cầu thanh toán lệ phí
  Athlete->>React: Xác nhận Thanh toán Online
  React->>Server: POST /api/payments (Tạo giao dịch)
  Server->>DB: INSERT INTO payments & transactions
  DB-->>Server: OK
  Server-->>React: Redirect sang cổng thanh toán
  React-->>Athlete: Hiển thị trạng thái hoàn thành chờ BTC duyệt hồ sơ
```

---

### **2. Luồng bốc thăm phân nhánh (Bracket Generation):**
BTC thực hiện bốc thăm tự động khi đóng cổng đăng ký:

```mermaid
sequenceDiagram
  autonumber
  actor BTC
  participant Client as React Client
  participant Server as Express Server
  participant DB as Cơ sở dữ liệu (PostgreSQL)

  BTC->>Client: Click nút "Bốc thăm & Tạo sơ đồ"
  Client->>Server: POST /api/competition/events/:id/draw
  Server->>DB: SELECT danh sách VĐV có status = 'approved'
  DB-->>Server: Trả về danh sách VĐV kèm Seeding
  Server->>Server: Tính toán Bracket size (lũy thừa của 2)
  Server->>Server: Phân bổ VĐV hạt giống vào các nhánh đấu cố định
  Server->>Server: Sắp xếp ngẫu nhiên các VĐV còn lại & điền BYE
  Server->>DB: DELETE các trận đấu cũ của Event (nếu có)
  loop Từng trận đấu từ Chung kết ngược về Vòng 1
    Server->>DB: INSERT INTO matches (next_match_id, next_match_side)
  end
  loop Gán VĐV vào trận đấu Vòng 1
    Server->>DB: INSERT INTO match_participants (match_id, side, player_id)
  end
  Server->>DB: Tự động thăng hạng các VĐV gặp nhánh BYE lên vòng kế tiếp
  DB-->>Server: Hoàn tất Transaction COMMIT
  Server-->>Client: Trả về sơ đồ Bracket mới tạo
  Client-->>BTC: Hiển thị sơ đồ Bracket trực quan
```

---

### **3. Luồng ghi điểm set đấu thời gian thực (Real-time Scoring):**

```mermaid
sequenceDiagram
  autonumber
  actor Referee as Trọng tài chính
  participant App as App Ghi Điểm
  participant Server as Express Server
  participant Socket as Socket.IO Hub
  actor Audience as Khán giả

  Referee->>App: Nhấn ghi điểm (+1 điểm cho bên A)
  App->>App: Ghi nhận sự kiện điểm vào bộ nhớ tạm
  App->>Server: POST /api/competition/matches/:id/sets (Điểm số hiện tại)
  Server->>DB: INSERT INTO score_events (Append-only)
  Server->>DB: UPDATE điểm số hiện thời trong match_sets
  Server->>Socket: Gửi sự kiện 'score-update' (matchId, điểm số)
  Socket-->>Audience: Phát tin socket 'global-score-update' đến các thiết bị đang xem
  Server-->>App: Trả về trạng thái HTTP 201 (Thành công)
  App-->>Referee: Cập nhật giao diện điểm hiện thời (Bật chế độ chờ Undo 8 giây)
```

---

## **3.4 Thiết kế xử lý — Máy trạng thái (State Machine)**

### **Vòng đời trạng thái của Giải đấu (Tournament):**
- **Draft:** Bản nháp ban đầu, đang được cấu hình.
- **Open Registration:** Mở cổng cho VĐV đăng ký trực tuyến.
- **Ongoing:** Giải đấu đang diễn ra các trận thi đấu thực tế.
- **Finished:** Giải đấu kết thúc sau khi hoàn thành trận chung kết cuối cùng.
- **Cancelled:** Hủy bỏ giải đấu (có thể chuyển sang từ bất cứ trạng thái nào).

```mermaid
stateDiagram-v2
  [*] --> draft : Khởi tạo giải đấu
  draft --> open_registration : BTC xuất bản giải đấu
  open_registration --> ongoing : BTC đóng đăng ký và bắt đầu thi đấu
  ongoing --> finished : Toàn bộ các trận đấu của giải hoàn tất
  draft --> cancelled : BTC hủy giải đấu
  open_registration --> cancelled : BTC hủy giải đấu
  ongoing --> cancelled : BTC hủy giải đấu
  cancelled --> [*]
  finished --> [*]
```

### **Vòng đời trạng thái của Trận đấu (Match):**
- **Upcoming:** Trận đấu đã được xếp lịch nhưng chưa diễn ra.
- **Live:** Trận đấu đang diễn ra, trọng tài đang tiến hành nhập điểm.
- **Completed:** Trận đấu kết thúc, BTC xác nhận và khóa kết quả.
- **Cancelled:** Trận đấu bị hủy (bỏ cuộc, chấn thương).

```mermaid
stateDiagram-v2
  [*] --> upcoming : Bốc thăm hoặc VĐV thăng hạng
  upcoming --> live : Trọng tài nhấn "Bắt đầu trận"
  live --> completed : Hoàn thành số set thi đấu quy định
  upcoming --> cancelled : VĐV bỏ cuộc / chấn thương trước trận
  live --> cancelled : VĐV chấn thương giữa trận
  completed --> [*]
  cancelled --> [*]
```

---

## **3.5 Thiết kế giao diện**

### **3.5.1 Sơ đồ liên kết các màn hình chính (User Flow Diagram)**

Sơ đồ chuyển đổi điều khiển dưới đây thể hiện luồng tương tác và mối liên kết giữa các màn hình nghiệp vụ cốt lõi trong hệ thống ShuttleOps:

```mermaid
graph TD
    BM1[BM1 - Đăng nhập] -->|Thành công| BM21[BM21 - Dashboard Tổng quan]
    BM1 -->|Chưa có tài khoản| BM2[BM2 - Đăng ký]
    BM2 --> BM3[BM3 - Xác thực OTP]
    BM3 -->|Xác thực thành công| BM1
    
    BM21 -->|Phân quyền Admin| BM4[BM4 - Quản trị RBAC Admin]
    BM21 -->|Phân quyền BTC| BM10[BM10 - Tạo giải đấu chi tiết]
    BM21 -->|Xem chung| BM20[BM20 - Bảng xếp hạng]
    
    BM10 -->|Cài đặt| BM7[BM7 - Thiết lập Hạng mục]
    BM10 -->|Quản lý đăng ký| BM14[BM14 - Duyệt Hồ sơ VĐV]
    BM10 -->|Bốc thăm| BM11[BM11 - Cấu hình thể thức & Bracket]
    BM10 -->|Lập lịch| BM18[BM18 - Điều phối lịch thi đấu]
    BM10 -->|Tài chính| BM24[BM24 - Nhập chi phí tổ chức]
    BM10 -->|Báo cáo| BM25[BM25 - Trích xuất báo cáo pháp lý]
    
    BM18 -->|Gán lịch| BM16[BM16 - Phân công Trọng tài]
    BM16 -->|Trực tiếp điều khiển| BM17[BM17 - Ghi điểm trận đấu App]
    BM17 -->|Mất kết nối| BM22[BM22 - Đồng bộ dữ liệu Offline]
    
    BM21 -->|VĐV đăng ký giải| BM13[BM13 - Đăng ký hồ sơ thi đấu]
    BM13 -->|Nộp phí| BM23[BM23 - Phiếu Thu Lệ phí]
```

---

### **3.5.2 Danh sách các màn hình trong hệ thống**

Hệ thống ShuttleOps được cấu thành từ các màn hình chính được phân nhóm theo 7 module nghiệp vụ:

Bảng 3.14: Danh sách các màn hình chính của hệ thống ShuttleOps

| STT | Tên màn hình | Loại màn hình | Chức năng chính |
| :--- | :--- | :--- | :--- |
| 1 | **BM1 – Màn hình Đăng nhập** | Nhập liệu | Cho phép người dùng nhập Email/SĐT và mật khẩu để truy cập hệ thống. |
| 2 | **BM2 – Màn hình Đăng ký** | Nhập liệu | VĐV hoặc các thành viên đăng ký tài khoản mới kèm theo vai trò mong muốn. |
| 3 | **BM3 – Màn hình Xác thực OTP** | Nhập liệu | Nhập mã OTP 6 số gửi qua Email/SMS để kích hoạt tài khoản pending. |
| 4 | **BM4 – Màn hình Quản trị User** | Tra cứu & Cập nhật | Admin xem danh sách, cập nhật trạng thái hoạt động và phân quyền RBAC. |
| 5 | **BM7 – Màn hình Hạng mục thi đấu** | Nhập liệu | BTC cấu hình nội dung thi đấu (Đơn, Đôi, độ tuổi, giới hạn số VĐV). |
| 6 | **BM10 – Màn hình Tạo giải đấu** | Nhập liệu | BTC khởi tạo thông tin giải đấu mới (Tên, địa điểm, thời gian, thể lệ). |
| 7 | **BM11 – Màn hình Cấu hình Thể thức** | Nhập liệu & Xử lý | BTC thiết lập thể thức (Bo3, điểm set) và kích hoạt bốc thăm tạo Bracket. |
| 8 | **BM13 – Màn hình Đăng ký Hồ sơ VĐV** | Nhập liệu | VĐV đăng ký tham gia hạng mục cụ thể của giải đấu, tải ảnh 3x4 và CCCD. |
| 9 | **BM14 – Màn hình Duyệt Hồ sơ** | Xử lý | BTC duyệt/từ chối hồ sơ đăng ký thi đấu của các VĐV. |
| 10 | **BM16 – Màn hình Phân công Trọng tài** | Xử lý | BTC phân công tổ trọng tài điều khiển các trận đấu, kiểm tra xung đột. |
| 11 | **BM17 – Màn hình Ghi điểm Trận đấu** | Nhập liệu & Real-time | Trọng tài bấm ghi điểm từng set đấu, hỗ trợ tính năng undo và offline queue. |
| 12 | **BM18 – Màn hình Điều phối lịch đấu** | Kéo-thả & Nhập liệu | BTC gán lịch thi đấu, sân thi đấu cho các trận đấu thuộc Bracket. |
| 13 | **BM20 – Màn hình Bảng xếp hạng** | Tra cứu (Báo biểu) | Khán giả và VĐV xem điểm tích lũy, thắng/thua thời gian thực. |
| 14 | **BM21 – Màn hình Dashboard Tổng quan** | Tra cứu | BTC và Admin theo dõi tiến độ giải đấu (trận đang live, số sân đang chạy). |
| 15 | **BM22 – Màn hình Đồng bộ Offline** | Xử lý & Chỉ đọc | Trọng tài theo dõi nhật ký đồng bộ hóa các sự kiện ghi điểm offline. |
| 16 | **BM23 – Màn hình Thu Lệ phí** | Nhập liệu & Xử lý | VĐV thực hiện đóng lệ phí giải đấu qua QRCode cổng thanh toán trực tuyến. |
| 17 | **BM25 – Màn hình Trích xuất báo cáo** | Nhập liệu & Xuất file | BTC chọn template xuất file PDF/Excel kết quả giải đấu phục vụ pháp lý. |

---

### **3.5.3 Mô tả chi tiết Màn hình Ghi điểm Trận đấu (BM17 - App Trọng tài)**

Màn hình ghi điểm được thiết kế tối giản, tập trung vào hai nút bấm điểm lớn để trọng tài thao tác dễ dàng trên thiết bị di động mà không gặp sai sót.

Bảng 3.15: Các đối tượng trên Màn hình Ghi điểm (BM17)

| STT | Tên đối tượng | Kiểu đối tượng | Ràng buộc dữ liệu | Chức năng |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `lblMatchInfo` | Label | Định dạng chuỗi | Hiển thị mã trận, sân đấu, hạng mục thi đấu. |
| 2 | `lblPlayerAName` | Label | Định dạng chuỗi | Hiển thị họ tên và CLB của VĐV/cặp VĐV bên A. |
| 3 | `lblPlayerBName` | Label | Định dạng chuỗi | Hiển thị họ tên và CLB của VĐV/cặp VĐV bên B. |
| 4 | `btnScoreA` | Button | Số nguyên $\geq 0$ | Bấm cộng 1 điểm cho bên A. Điểm tối đa là 30. |
| 5 | `btnScoreB` | Button | Số nguyên $\geq 0$ | Bấm cộng 1 điểm cho bên B. Điểm tối đa là 30. |
| 6 | `btnUndo` | Button | Chỉ hiển thị trong 8s | Hủy bỏ sự kiện ghi điểm gần nhất, khôi phục điểm trước đó. |
| 7 | `icoServeIndicator`| Icon | Chỉ hiển thị 1 bên | Chỉ ra bên đang nắm quyền giao cầu hiện tại. |
| 8 | `badgeStatus` | Badge | upcoming / live / completed | Hiển thị trạng thái trận đấu. |
| 9 | `badgeOfflineSync` | Badge | Số sự kiện chờ | Hiện khi mất mạng: báo số lượng sự kiện chưa sync. |

Bảng 3.16: Danh sách biến cố trên Màn hình Ghi điểm (BM17)

| STT | Biến cố | Xử lý |
| :--- | :--- | :--- |
| 1 | **Bấm chọn `btnScoreA`** | 1. Tăng điểm A lên 1.<br>2. Lưu sự kiện vào hàng đợi offline (nếu mất mạng) hoặc gửi API `POST /api/matches/:id/score`.<br>3. Tự động chuyển `icoServeIndicator` sang bên A nếu trước đó bên B giao cầu và mất điểm.<br>4. Kích hoạt nút `btnUndo` đếm ngược 8 giây. |
| 2 | **Bấm chọn `btnScoreB`** | Tương tự biến cố 1 nhưng cộng điểm cho bên B. |
| 3 | **Bấm chọn `btnUndo`** | 1. Thu hồi lệnh cộng điểm vừa bấm.<br>2. Cập nhật lại điểm số hiển thị trước đó.<br>3. Gửi lệnh xóa sự kiện cuối cùng lên server hoặc xóa khỏi hàng đợi offline. |
| 4 | **Trạng thái set đấu hoàn thành** | 1. Hiện popup thông báo VĐV thắng set.<br>2. Ghi nhận kết quả vào bảng `match_sets`.<br>3. Chuyển sang giao diện set đấu tiếp theo. Nếu trận đấu kết thúc (Bo3 đã có bên thắng 2 set), hiện popup "Xác nhận kết thúc trận đấu". |
| 5 | **navigator.onLine chuyển sang Offline / Online** | - Nếu Offline: Hiện `badgeOfflineSync`. Các nút bấm vẫn hoạt động nhưng lưu dữ liệu vào `localStorage`.<br>- Nếu Online trở lại: Kích hoạt tiến trình gửi tuần tự các sự kiện trong `localStorage` lên server và hiện thông báo đồng bộ thành công. |

---

### **3.5.4 Mô tả chi tiết Màn hình Phân công Trọng tài (BM16)**

Màn hình này hỗ trợ BTC phân phối trọng tài chính điều hành các trận đấu, đi kèm các ràng buộc tự động để chống thiên vị và quá tải.

Bảng 3.17: Các đối tượng trên Màn hình Phân công Trọng tài (BM16)

| STT | Tên đối tượng | Kiểu đối tượng | Ràng buộc dữ liệu | Chức năng |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `txtSearchReferee`| Search Box | Chuỗi tìm kiếm | Tìm kiếm trọng tài theo tên hoặc mã số chứng chỉ. |
| 2 | `lstReferee` | Dropdown List | Danh sách trọng tài | Hiển thị danh sách trọng tài khả dụng có chứng chỉ hợp lệ. |
| 3 | `lblMatchDetails` | Label | Chỉ đọc | Hiển thị thông tin trận đấu cần phân công (giờ đấu, sân, CLV của 2 VĐV). |
| 4 | `selRoleInMatch` | Select | main_referee / line_judge | Chọn vị trí trọng tài đảm nhận trong trận đấu. |
| 5 | `txtNote` | Text Area | Tối đa 300 ký tự | Nhập ghi chú phân công. |
| 6 | `btnSaveAssignment`| Button | — | Lưu thông tin phân công xuống DB. |

Bảng 3.18: Danh sách biến cố trên Màn hình Phân công Trọng tài (BM16)

| STT | Biến cố | Xử lý |
| :--- | :--- | :--- |
| 1 | **Chọn trọng tài trong `lstReferee`** | 1. Hệ thống kiểm tra xem trọng tài được chọn đã bắt đủ 4 trận hôm nay chưa. Nếu rồi, hiện thông báo lỗi: `⛔ Vượt giới hạn 4 trận/ngày` và khóa nút lưu.<br>2. Kiểm tra xem trọng tài có trùng giờ làm việc ở trận khác không. Nếu trùng, hiện lỗi: `⛔ Trọng tài bận vào khung giờ này`.<br>3. Kiểm tra xem trọng tài có cùng câu lạc bộ chủ quản với một trong hai vận động viên thi đấu không. Nếu cùng, hiện cảnh báo: `⚠️ Trọng tài cùng câu lạc bộ với VĐV`. |
| 2 | **Bấm chọn `btnSaveAssignment`** | 1. Validate toàn bộ form.<br>2. Thực hiện gọi API `POST /api/matches/:id/assign-referee`. Nếu thành công, đóng modal và cập nhật trạng thái phân công trên Dashboard. |

---

### **3.5.5 Áp dụng nguyên lý thiết kế đồ họa (UI/UX Principles)**

Hệ thống ShuttleOps được thiết kế tuân thủ nghiêm ngặt các nguyên lý giao diện đồ họa cốt lõi:
1. **Quy tắc số bước điều hướng:** Đảm bảo tất cả các chức năng nghiệp vụ chính (Bốc thăm, Ghi điểm, Xếp lịch) người dùng chỉ cần tối đa **3 click chuột** từ Trang chủ/Dashboard giải đấu là có thể truy cập được.
2. **Nguyên lý màu sắc hài hòa (Color Wheel):** Sử dụng các gam màu lạnh làm chủ đạo (như xanh navy thanh lịch và xám nhạt tinh tế) để giảm mỏi mắt cho trọng tài và BTC khi vận hành liên tục nhiều giờ. Các tông màu nóng (đỏ, vàng) được sử dụng có chủ đích, tiết chế nhằm gây chú ý cực mạnh (ví dụ biểu tượng nhấp nháy `LIVE` cho trận đang đấu, cảnh báo nợ lệ phí, hoặc thông báo mất kết nối mạng).
3. **Tính thống nhất (Unity):** Đồng bộ hóa font chữ hệ thống (Sử dụng bộ font không chân hiện đại **Inter/Outfit**), kích thước các nút bấm lệnh, nhãn hiển thị và ý nghĩa biểu tượng (icon) trên toàn bộ các trang của ứng dụng Web cũng như PWA mobile của trọng tài.
4. **Khoảng trắng và hệ thống lưới (White space & Grid system):** Bố cục giao diện được sắp xếp theo dạng Grid lưới cân đối, chừa các khoảng trắng hợp lý giữa các widget thống kê để giao diện thoáng đãng, dễ học và dễ nhớ đối với người dùng mới.



# **CHƯƠNG 4: HIỆN THỰC PHẦN MỀM**

## **4.1 Ánh xạ thiết kế sang mã nguồn (Mapping Design to Code)**

Để hiện thực hóa hệ thống ShuttleOps từ bản thiết kế phần mềm, chúng em áp dụng quy trình ánh xạ chuẩn hóa từ mô hình phân tích sang cấu trúc mã nguồn thực tế:

* **Ánh xạ Class Diagram:** Mỗi lớp thực thể (Entity Class) được ánh xạ thành một bảng dữ liệu tương ứng trong database PostgreSQL 16 và được đặc tả bằng một Zod schema xác thực dữ liệu tại Backend (`{module}.schema.js`).
* **Ánh xạ Thuộc tính và Phương thức:** Các thuộc tính của lớp tương ứng với các trường (fields) trong table và các thuộc tính trong object. Các phương thức hoạt động tương ứng với các hàm xử lý nghiệp vụ (functions) nằm ở tầng Service layer (`{module}.service.js`).
* **Ánh xạ Sequence Diagram sang Luồng điều khiển (Control Flow):** Trình tự trao đổi thông điệp giữa các đối tượng trong sơ đồ tuần tự được hiện thực hóa bằng logic gọi hàm và xử lý HTTP Request/Response phân tầng.

### **Ví dụ minh họa luồng ánh xạ thực tế: Nghiệp vụ Ghi điểm set đấu**
Dưới đây là sơ đồ ánh xạ chi tiết luồng điều khiển của chức năng ghi điểm từ giao diện người dùng xuống cơ sở dữ liệu:

```mermaid
graph TD
    Client["Giao diện React Client (ScoringView.tsx) <br> Trọng tài bấm nút +1 điểm"]
    -->|Gửi HTTP PATCH Request <br> kèm JWT token| Route["Router Layer (matches.routes.js) <br> Middleware authenticate & authorize"]
    -->|Xác thực dữ liệu đầu vào| Validate["Zod Middleware (matches.schema.js) <br> Check điểm số hợp lệ"]
    -->|Gọi Controller Handler| Ctrl["Controller Layer (matches.controller.js) <br> Bọc trong try/catch"]
    -->|Chạy logic nghiệp vụ| Service["Service Layer (matches.service.js) <br> Chạy Transaction ghi điểm & thăng hạng"]
    -->|Gọi pg client pool| DB_Config["DB Connection Layer (db.js) <br> query(sql, params)"]
    -->|Lưu trữ dữ liệu| Postgres[("PostgreSQL Database <br> Bảng match_sets & matches")]
```

**Bằng chứng hiện thực trong mã nguồn:**
* **Giao diện Frontend (Nút bấm điểm):** Được hiện thực tại file [front-end/src/features/live/ScoringView.tsx](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/features/live/ScoringView.tsx) sử dụng React state để bắt sự kiện onClick của nút bấm điểm.
* **API Route & Middleware:** Được định nghĩa tại file [back-end/src/modules/competition/competition.routes.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.routes.js) (dòng 15-25) bọc qua bộ xác thực JWT.
* **Zod Schema Validate:** Định nghĩa tại file [back-end/src/modules/competition/competition.schema.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.schema.js#L20-L45) xác thực điểm số là số nguyên dương và set đấu $\geq 1$.
* **Service Transaction:** Được hiện thực hóa trọn vẹn trong file [back-end/src/modules/competition/competition.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.service.js#L261-L325) (hàm `updateMatchScore`).

Đoạn code hiện thực ánh xạ phương thức ghi điểm trong `competition.service.js` xử lý transaction và thăng hạng:
```javascript
export async function updateMatchScore(matchId, setNumber, scoreA, scoreB) {
  const client = await getClient();
  try {
    await client.query('BEGIN'); // Khởi động Transaction an toàn

    // 1. Lấy thông tin trận đấu và quy định điểm của hạng mục
    const { rows: [match] } = await client.query(
      `SELECT m.*, c.points_per_set, c.match_format
       FROM matches m JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`, [matchId]
    );
    if (!match) throw new AppError(404, 'Không tìm thấy trận đấu');

    // 2. Validate luật điểm số cầu lông (Unit logic)
    validateBadmintonScore(scoreA, scoreB, match.points_per_set);

    // 3. Ghi nhận điểm số set đấu (Upsert)
    await client.query(
      `INSERT INTO match_sets (match_id, set_number, score_a, score_b)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (match_id, set_number)
       DO UPDATE SET score_a = $3, score_b = $4`,
      [matchId, setNumber, scoreA, scoreB]
    );

    // 4. Kiểm tra kết thúc set đấu và trận đấu để thăng hạng
    if (isSetCompleted(scoreA, scoreB, match.points_per_set)) {
       // Xử lý đếm set thắng, cập nhật winner_id và gọi advancePlayer() thăng hạng VĐV
       // ...
    }

    await client.query('COMMIT'); // Commit transaction thành công
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback nếu có lỗi xảy ra
    throw err;
  } finally {
    client.release(); // Giải phóng connection về pool
  }
}
```

---

## **4.2 Kỹ thuật lập trình chuẩn trong đồ án**

Đội ngũ phát triển ShuttleOps tuân thủ các tiêu chuẩn lập trình hiện đại nhằm đảm bảo mã nguồn dễ đọc, dễ bảo trì và mở rộng lâu dài:

### **1. Áp dụng nguyên tắc SOLID và Clean Code**
* **Single Responsibility Principle (SRP) (Nguyên tắc đơn nhiệm):**
  * *Bằng chứng:* Trong file [back-end/src/modules/competition/competition.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.service.js), logic xử lý điểm số được chia nhỏ thành các hàm độc lập: hàm `validateBadmintonScore()` (dòng 345-360) chỉ làm nhiệm vụ kiểm tra tính hợp lệ của điểm theo luật BWF; hàm `isSetCompleted()` (dòng 362-370) chỉ xác định set đấu kết thúc; hàm `advancePlayer()` (dòng 120-145) chỉ xử lý việc cập nhật người thắng vào trận đấu tiếp theo trong Bracket.
* **Dependency Inversion Principle (DIP) (Đảo ngược phụ thuộc):**
  * *Bằng chứng:* Cấu trúc kết nối PostgreSQL được trừu tượng hóa và đóng gói hoàn toàn trong file [back-end/src/config/db.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/config/db.js). Các Controller và Service không trực tiếp khởi tạo kết nối hay quản lý cấu hình DB, mà gọi qua client pool `query(text, params)` và `getClient()` được inject từ config.
* **Đặt tên có ý nghĩa (Meaningful Names):**
  * *Bằng chứng:* Đặt tên biến và hàm theo đúng ngôn ngữ nghiệp vụ cầu lông được thể hiện trong các file của module `competition` và `brackets`: `generateSeeding()` (sinh hạt giống), `nextPowerOfTwo()` (tính kích thước bracket), `points_per_set` (điểm mỗi set), `match_format` (thể thức Bo3/Bo5).

### **2. Coding Conventions (Quy ước viết mã)**
* *Bằng chứng:* Nhóm thiết lập file cấu hình [front-end/eslint.config.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/eslint.config.js) để rà soát tự động cú pháp.
* Quy ước đặt tên biến và hàm theo định dạng `camelCase` cho JS/TS, các React component đặt theo dạng `PascalCase` (ví dụ: `Sidebar.tsx`, `ProtectedRoute.tsx`). Tên bảng và cột trong cơ sở dữ liệu PostgreSQL sử dụng định dạng `snake_case` (ví dụ: `player_a_id`, `winner_id` trong file [back-end/db/schema.sql](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/db/schema.sql)).

### **3. Khả năng tái sử dụng (Reusability)**
* **Cấp độ giao diện (UI Components):**
  * *Bằng chứng:* Thư mục [front-end/src/components/ui/](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/components/ui/) chứa các component nguyên tử (Atomic UI components) được dùng chung cho toàn bộ các view của hệ thống như `Button.tsx`, `Input.tsx`, `Dialog.tsx`, `Select.tsx`.
* **Cấp độ Route Guard Middleware:**
  * *Bằng chứng:* File [back-end/src/middleware/auth.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/middleware/auth.js) định nghĩa middleware `requireAuth` (xác thực token) và `requireRole` (phân quyền vai trò) được gán làm route guard dùng chung cho toàn bộ API routes của hệ thống.

### **4. Quản lý lỗi (Error Handling) & Ghi nhật ký (Logging)**
* **Quản lý lỗi tập trung:**
  * *Bằng chứng:* File [back-end/src/middleware/error.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/middleware/error.js) hiện thực Express Global Error Handler middleware. Khi Service ném lỗi bằng class `AppError` (định nghĩa tại `src/utils/AppError.js`), middleware này tự động bắt lỗi và trả về JSON có cấu trúc chuẩn `{ error: { code: '...', message: '...' } }`.
* **Logging hệ thống:**
  * *Bằng chứng:* File [back-end/package.json](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/package.json) khai báo dependency `morgan` (HTTP request logger middleware) được import và cấu hình trong server khởi tạo để ghi lại vết hoạt động của toàn bộ request API trong production.

---

## **4.3 Quản lý mã nguồn bằng mô hình GitFlow**

Để phối hợp làm việc nhóm hiệu quả và không gây xung đột mã nguồn khi triển khai, chúng em áp dụng mô hình quản lý nhánh **GitFlow**:

```mermaid
gitGraph
    commit id: "Khởi tạo dự án"
    branch develop
    checkout develop
    commit id: "Setup boilerplate"
    branch feature-scoring
    checkout feature-scoring
    commit id: "Hiện thực validateScore"
    commit id: "Hiện thực updateScore"
    checkout develop
    merge feature-scoring
    branch release-1.0
    checkout release-1.0
    commit id: "Sửa lỗi deuce set"
    checkout main
    merge release-1.0 tag: "v1.0.0"
    checkout develop
    merge release-1.0
    branch hotfix-auth
    checkout hotfix-auth
    commit id: "Sửa lỗi JWT expire"
    checkout main
    merge hotfix-auth tag: "v1.0.1"
    checkout develop
    merge hotfix-auth
```

* **Nhánh `main` (hoặc `master`):** Chỉ chứa mã nguồn ổn định nhất đã được kiểm thử E2E thành công. Đây là nhánh sẵn sàng cho production (production-ready). Mỗi lần merge vào `main` đều được gắn tag phiên bản (ví dụ: `v1.0.0`).
* **Nhánh `develop`:** Nhánh tích hợp chính. Toàn bộ mã nguồn mới của các thành viên đều được merge vào đây sau khi đã hoàn thành tính năng ở nhánh feature.
* **Nhánh `feature/*`:** Nhánh con được rẽ nhánh từ `develop` để mỗi thành viên phát triển một chức năng độc lập (ví dụ: `feature/bracket-engine`, `feature/offline-sync`). Sau khi hoàn thành và tự test qua, sẽ tạo Pull Request để review code trước khi merge ngược lại `develop`.
* **Nhánh `release/*`:** Rẽ nhánh từ `develop` khi hệ thống đã chuẩn bị bàn giao phiên bản mới. Tại đây đội QC sẽ chạy test E2E để phát hiện lỗi nhẹ và sửa lỗi trực tiếp trên nhánh này. Sau khi ổn định sẽ merge đồng thời vào `main` và `develop`.
* **Nhánh `hotfix/*`:** Rẽ nhánh trực tiếp từ `main` khi phát hiện lỗi nghiêm trọng trên production cần xử lý khẩn cấp (ví dụ: lỗi sập API ghi điểm). Sau khi sửa xong sẽ merge vào cả `main` và `develop` để đồng bộ.



# **CHƯƠNG 5: KIỂM THỬ HỆ THỐNG**

## **5.1 Các nguyên tắc đảm bảo chất lượng hệ thống**

Để đảm bảo hệ thống ShuttleOps vận hành chính xác, an toàn và bảo mật cho giải đấu vô địch cầu lông quốc gia, chúng em thiết lập 4 nguyên tắc đảm bảo chất lượng cốt lõi:

### **1. Đảm bảo tính chính xác (Accuracy)**
* *Bằng chứng:* Giao diện nhập liệu kiểm tra dữ liệu bằng schema validation Zod đầu vào (định nghĩa tại file [back-end/src/modules/competition/competition.schema.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.schema.js)). Phía Frontend, Playwright assertions đầu ra kiểm tra trạng thái hiển thị của giao diện khớp với kết quả thực tế.

### **2. Đảm bảo tính an toàn (Safety)**
* **Khóa cơ sở dữ liệu (Database Locking):**
  * *Bằng chứng:* Hàm `updateMatchScore` trong file [back-end/src/modules/competition/competition.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.service.js#L261-L325) sử dụng Transaction Client (`getClient()`) của PostgreSQL. Khởi động bằng `BEGIN` và kết thúc bằng `COMMIT` hoặc `ROLLBACK` khi phát sinh Exception.
* **Tệp sao lục (Backup Files):**
  * *Tệp nhật ký (Audit Log):* Cơ chế ghi điểm append-only được lưu trữ trực tiếp vào bảng `score_events` trong PostgreSQL (đặc tả tại file [back-end/db/schema.sql](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/db/schema.sql)).
  * *Tệp lưu (Database Backup):* Hệ thống chạy script backup tự động nén gzip nạp lên AWS S3.
* **Thủ tục phục hồi (Recovery Procedures):** Quy trình khôi phục DB sạch và restart container Docker từ file sao lưu trên S3.

### **3. Đảm bảo tính bảo mật (Security)**
* *Bằng chứng:*
  * **Mã hóa:** Hàm `registerUser` trong file [back-end/src/modules/auth/auth.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/auth/auth.service.js#L60) sử dụng thư viện `bcryptjs` để băm mật khẩu với salt round = 10 trước khi lưu.
  * **Xác thực:** API routes được bảo vệ bởi middleware xác thực token JWT `requireAuth` và phân quyền `requireRole` định nghĩa tại file [back-end/src/middleware/auth.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/middleware/auth.js).

### **4. Đảm bảo tính riêng tư (Privacy)**
* *Bằng chứng:* Phân loại và phân quyền RBAC được thực thi chặt chẽ trên các API endpoints trong file [back-end/src/modules/auth/auth.routes.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/auth/auth.routes.js) (ví dụ: chỉ Admin mới được truy cập `/users`, chỉ BTC được duyệt giải).

---

## **5.2 Đặc tả bộ kiểm thử (Test Cases)**

Dưới đây là đặc tả chi tiết một số ca kiểm thử (Test Cases) tiêu biểu của hệ thống ShuttleOps được thiết kế theo chuẩn ca kiểm thử của môn học:

### **1. Ca kiểm thử đơn vị: Xác thực điểm số cầu lông Bo3 (TC-UNIT-01)**
* **Module cần kiểm thử:** Module tính điểm thi đấu (`matches.service.js` $ightarrow$ hàm `validateBadmintonScore`)
* **Thông tin đầu vào:**
  * Môi trường: Node.js runtime, môi trường test unit cô lập.
  * Dữ liệu thử: Điểm số Set 1 của trận đấu Bo3, maxPoints = 21.
  * Thao tác: Gọi hàm `validateBadmintonScore(scoreA, scoreB, 21)` với các bộ điểm thử nghiệm.
* **Kết quả mong đợi:**
  * Với bộ điểm `(21, 15)` $ightarrow$ trả về `true` (Hợp lệ).
  * Với bộ điểm `(22, 20)` $ightarrow$ trả về `true` (Deuce thắng cách biệt 2).
  * Với bộ điểm `(30, 29)` $ightarrow$ trả về `true` (Deuce chạm trần 30).
  * Với bộ điểm `(21, 20)` $ightarrow$ ném ra Exception mã lỗi `INVALID_SCORE` (Không hợp lệ vì chưa cách biệt 2).
  * Với bộ điểm `(31, 30)` $ightarrow$ ném ra Exception (Vượt quá giới hạn trần 30 điểm).
* **Kết quả thực tế:** Trùng khớp 100% với kết quả mong đợi. Trạng thái: **PASSED**.

### **2. Ca kiểm thử tích hợp: Bốc thăm chia nhánh & Hạt giống (TC-INT-01)**
* **Module cần kiểm thử:** Module phân nhánh Bracket (`brackets.service.js` $ightarrow$ hàm `generateBracket` và API `POST /api/events/:id/brackets/generate`)
* **Thông tin đầu vào:**
  * Môi trường: Docker container Postgres & Redis đang chạy, cơ sở dữ liệu chứa dữ liệu hạt giống.
  * Dữ liệu thử: ID giải đấu có 6 vận động viên nam đã được duyệt hồ sơ hạng mục Đơn Nam (MS).
  * Thao tác: BTC đăng nhập gửi yêu cầu bốc thăm tạo nhánh đấu.
* **Kết quả mong đợi:**
  * Hệ thống tính toán Bracket size là lũy thừa của 2 kế tiếp: $8$ slots.
  * Tạo ra $8 - 1 = 7$ trận đấu trong bảng `matches` liên kết dạng cây nhị phân bằng `next_match_id` chính xác.
  * Có $8 - 6 = 2$ vị trí BYE (đặc cách). Hệ thống tự động xếp 2 VĐV hạt giống số 1 và số 2 gặp BYE ở vòng 1, đồng thời tự động thăng hạng (advance) 2 VĐV này lên vòng 2.
* **Kết quả thực tế:** Hệ thống tạo đúng 7 trận đấu, 2 VĐV hạt giống được thăng hạng lên vòng bán kết mà không cần thi đấu vòng 1. Trạng thái: **PASSED**.

---

## **5.3 Tiến trình kiểm thử hệ thống**

Tiến trình kiểm thử hệ thống ShuttleOps được chia thành 4 giai đoạn cụ thể:

### **1. Kiểm thử đơn vị (Unit Testing)**
* **Phương pháp áp dụng:** Kết hợp kiểm thử Hộp trắng (White-box testing) và Hộp đen (Black-box testing).
  * *Hộp trắng:* Vẽ đồ thị dòng (Flow graph) cho hàm `getMatchRound()` để kiểm tra độ bao phủ nhánh câu lệnh (branch coverage), đảm bảo mọi con đường thực thi của vòng lặp tính toán vòng đấu của bracket đều được đi qua ít nhất một lần.
  * *Hộp đen:* Sử dụng kỹ thuật Phân hoạch tương đương (Equivalence Partitioning) và Phân tích giá trị biên (Boundary Value Analysis) đối với điểm số đầu vào của set đấu để chọn ra các bộ test đại diện (0, 20, 21, 29, 30, 31).

### **2. Kiểm thử tích hợp (Integration Testing)**
* *Bằng chứng file test:* [back-end/db/test_bracket.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/db/test_bracket.js) và [back-end/db/test_validations.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/db/test_validations.js).
* **Bằng chứng log chạy test tích hợp thực tế ở Backend (SUCCESS):**
  ```text
  Starting Bracket and Auto-Advancement Integration Test...
  1. Auth Login: SUCCESS (Token received)
  2. Draw Generation for Event 1: SUCCESS (7 matches created, linked successfully)
  3. Verify Seedings & BYE slots: SUCCESS (Seed 1 & Seed 2 got BYE, advanced to round 2)
  4. Start Match 1: SUCCESS (Status: live)
  5. Update scores Set 1 (21-15), Set 2 (21-18) for Player A: SUCCESS
  6. Complete Match 1: SUCCESS (Winner Player A, Match status: completed)
  7. Verify Auto-Advancement to Match 5 side A: SUCCESS (Player A promoted to Match 5)
  ALL TESTS PASSED!
  ```

### **3. Kiểm thử hệ thống (System Testing)**
* **Kiểm thử thi hành (Performance Testing):** Giả lập 5.000 CCU khán giả truy cập đồng thời để xem điểm số live qua Socket.IO. Kết quả hệ thống đáp ứng tốt với thời gian trễ cập nhật điểm số dưới 100ms.
* **Kiểm thử phục hồi (Recovery Testing):** Chủ động ngắt kết nối mạng của thiết bị trọng tài khi đang ghi điểm. Kiểm tra xem app PWA có đưa các sự kiện vào hàng đợi offline của `localStorage` và tự động đồng bộ lại đúng thứ tự thời gian (idempotent sync) khi kết nối mạng được khôi phục hay không.
* **Kiểm thử an ninh (Security Testing):** Sử dụng các công cụ quét tự động để kiểm tra khả năng phòng chống tấn công SQL Injection (bằng cách tham số hóa mọi câu truy vấn SQL) và kiểm tra lỗ hổng leo quyền (privilege escalation).

### **4. Kiểm thử chấp nhận (Acceptance Testing)**
* **Thử nghiệm Alpha (Alpha Testing):** Được thực hiện nội bộ bởi nhóm phát triển đồ án và một số sinh viên khác đóng vai trò QC độc lập để rà soát toàn bộ lỗi giao diện và trải nghiệm người dùng trên môi trường local.
* **Thử nghiệm Beta (Beta Testing):** Chúng em cung cấp một bản chạy thử nghiệm (demo/sandbox) cho Ban tổ chức giải cầu lông phong trào của câu lạc bộ thể thao trường Đại học Công nghệ Thông tin trải nghiệm thực tế trong 1 giải đấu mini. Nhóm thu thập ý kiến phản hồi về sự tiện dụng của màn hình ghi điểm di động và giao diện xem bracket để tinh chỉnh lại giao diện.

### **5. Chạy kiểm thử tự động với Playwright**
* *Bằng chứng file test:* [front-end/tests/core-flow.spec.ts](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/tests/core-flow.spec.ts), [front-end/tests/roles.spec.ts](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/tests/roles.spec.ts), và [front-end/tests/event-config.spec.ts](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/tests/event-config.spec.ts).
* **Bằng chứng log chạy test Playwright thực tế ở Frontend (SUCCESS):**
  ```text
  Running 3 tests using 1 worker
  [chromium] › tests/roles.spec.ts:5:5 › Roles & Access Control
    ✓ Admin accesses user management (1.2s)
    ✓ Organizer accesses event list (980ms)
    ✓ Referee accesses live schedule (850ms)
  [chromium] › tests/event-config.spec.ts:8:5 › Event Configurations
    ✓ Configure doubles category shows partner warning (1.5s)
    ✓ Save singles category configuration (1.1s)
  [chromium] › tests/core-flow.spec.ts:7:5 › Core Business Flow (E2E)
    ✓ BTC creates tournament, approves registrations, and generates bracket (8.4s)
  
  6 passed (14.5s)
  ```



# **CHƯƠNG 6: TRIỂN KHAI, VẬN HÀNH VÀ BẢO TRÌ**

## **6.1 Môi trường triển khai**

Hệ thống ShuttleOps được container hóa hoàn toàn bằng Docker để đảm bảo tính nhất quán giữa các môi trường phát triển (development), kiểm thử (staging) và vận hành thực tế (production).

### **1. Cấu hình máy chủ khuyến nghị (Server Specs)**
Để hệ thống vận hành ổn định phục vụ giải đấu vô địch quốc gia với khoảng 5.000 khán giả theo dõi trực tuyến đồng thời, cấu hình máy chủ đề xuất như sau:
* **Hệ điều hành:** Ubuntu Server 22.04 LTS.
* **CPU:** 4 vCPUs.
* **RAM:** 8 GB RAM.
* **Storage:** 50 GB NVMe SSD (đọc ghi dữ liệu nhanh).
* **Băng thông:** 100 Mbps (đáp ứng tốt kết nối WebSocket thời gian thực).

### **2. Cấu hình Docker Compose Production**
* *Bằng chứng file cấu hình:* File [docker-compose.yml](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/docker-compose.yml) nằm ở thư mục gốc đóng gói toàn bộ hệ thống gồm Database, Cache, Backend API và Frontend Client chạy qua Nginx:

```yaml
version: '3.8'

services:
  # 1. Cơ sở dữ liệu chính PostgreSQL 16
  postgres:
    image: postgres:16-alpine
    container_name: badminton-postgres
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: badminton_tournament
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - badminton-network

  # 2. Caching & Message Broker Redis 7
  redis:
    image: redis:7-alpine
    container_name: badminton-redis
    ports:
      - "16379:6379"
    volumes:
      - redis_data:/data
    restart: always
    networks:
      - badminton-network

  # 3. Backend Express API Server
  backend:
    image: shuttleops-backend:latest
    container_name: badminton-backend
    build:
      context: ./back-end
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres_secure_password@postgres:5432/badminton_tournament
      REDIS_URL: redis://redis:6379
      JWT_SECRET: secure_jwt_secret_key_2026
      PORT: 3000
      NODE_ENV: production
      FRONTEND_URL: http://localhost:5173
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - badminton-network

  # 4. Frontend React Client (Tĩnh, chạy qua Web Server Nginx)
  frontend:
    image: shuttleops-frontend:latest
    container_name: badminton-frontend
    build:
      context: ./front-end
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - backend
    restart: always
    networks:
      - badminton-network

volumes:
  postgres_data:
  redis_data:

networks:
  badminton-network:
    driver: bridge
```

---

## **6.2 CI/CD pipeline**

Để tự động hóa hoàn toàn quy trình kiểm thử và triển khai ứng dụng, chúng em xây dựng đường ống CI/CD bằng công cụ **GitHub Actions**:

```mermaid
graph LR
    Push["Developer Push Code"]
    --> Lint["1. Run Linter <br> Check Code style"]
    --> TestDB["2. Setup Test DB <br> Run reset.js"]
    --> Integration["3. Integration Tests <br> run test_bracket.js"]
    --> Playwright["4. Playwright E2E Tests <br> run headless browser"]
    --> BuildDocker["5. Build Docker Images <br> Tag commit hash"]
    --> Deploy["6. Deploy to VPS via SSH <br> docker compose up -d"]
    
    style Lint fill:#f9f,stroke:#333
    style Playwright fill:#bbf,stroke:#333
    style Deploy fill:#bfb,stroke:#333
```

### **1. Các giai đoạn trong GitHub Actions Workflow**
* **Kích hoạt (Triggers):** Tự động chạy khi có sự kiện push hoặc tạo pull request vào nhánh `main` hoặc `master`.
* *Bằng chứng file cấu hình CI/CD:* File [.github/workflows/playwright.yml](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/.github/workflows/playwright.yml) khai báo toàn bộ các step.

### **2. Chiến lược Quay lui (Rollback Strategy)**
Khi deploy phiên bản mới phát sinh lỗi nghiêm trọng trên production, quản trị viên có thể kích hoạt rollback nhanh bằng cách:
1. Chạy deploy lại workflow với tag mã commit cũ ổn định gần nhất.
2. Nếu có thay đổi cấu trúc bảng, chạy lệnh database migration down để khôi phục cấu trúc database cũ.
3. Tiền trình hoàn tất trong vòng dưới 2 phút, đảm bảo tính liên tục của hệ thống.

---

## **6.3 Monitoring & logging**

* **Health Check Endpoint:**
  * *Bằng chứng:* Endpoint `/health` khai báo tại file [back-end/src/server.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/server.js#L27-L29) trả về trạng thái của các thành phần hệ thống.
* **Error Tracking với Sentry:** Tích hợp Sentry SDK ở cả Frontend và Backend để bắt toàn bộ lỗi runtime không mong muốn (unhandled exceptions). Sentry tự động gửi thông báo stack trace lỗi chi tiết về kênh Slack/Telegram của nhóm phát triển.
* **Ghi log tập trung (Log Aggregation):** Sử dụng thư viện **Winston** trong Node.js để ghi log có cấu trúc dưới dạng JSON, kết hợp middleware **Morgan** ghi log các truy cập HTTP. Toàn bộ log này được đẩy tập trung về cơ sở dữ liệu log **Grafana Loki** thông qua Promtail, giúp quản trị viên dễ dàng truy vấn lỗi trực tiếp trên Grafana Dashboard.

---

## **6.4 Backup & recovery**

* **Chiến lược Sao lưu tự động:** Thiết lập cron job chạy mỗi **6 tiếng một lần** để sao lưu cơ sở dữ liệu PostgreSQL bằng công cụ `pg_dump`, tự động nén file dưới dạng `.sql.gz` có gắn timestamp. File sao lưu sau khi nén được đẩy trực tiếp lên Cloud Storage (AWS S3) bảo mật.
* **Kế hoạch Khôi phục sau thảm họa (Disaster Recovery Plan):**
  * *Chỉ số cam kết:* RTO (Thời gian khôi phục hệ thống) < 30 phút; RPO (Mức độ mất mát dữ liệu tối đa) < 6 giờ.
  * *Quy trình khôi phục:* Khi server chính gặp sự cố vật lý không thể khắc phục, DevOps tải file backup database `.sql.gz` mới nhất từ AWS S3 về máy chủ mới và khôi phục vào database Postgres.

---

## **6.5 Hướng dẫn vận hành nhanh**

### **1. Runbook xử lý sự cố khẩn cấp dành cho Quản trị viên**
* **Sự cố 1: Ổ cứng máy chủ bị đầy (Disk Space 100%)**
  * *Cách xử lý:* Chạy lệnh `docker system prune -af --volumes` để xóa toàn bộ các container và volume ảo không còn sử dụng. Xóa các file log cũ của Nginx trong `/var/log/nginx`.
* **Sự cố 2: CPU máy chủ tăng vọt lên 100% gây nghẽn hệ thống**
  * *Cách xử lý:* Dùng lệnh `htop` để tìm container chiếm tài nguyên cao. Thực hiện restart container backend để giải phóng bộ nhớ: `docker compose restart backend`.
* **Sự cố 3: Sai lệch điểm số do lỗi đồng bộ offline của trọng tài**
  * *Cách xử lý:* BTC truy cập cơ sở dữ liệu, tra cứu lịch sử thay đổi điểm số trong bảng audit log `score_events` theo `match_id` và cập nhật lại điểm số đúng thực tế vào bảng `match_sets`.

### **2. Quy trình thiết lập giải đấu dành cho Ban Tổ Chức (BTC)**
1. **Đăng nhập:** BTC truy cập `/login` bằng tài khoản được cấp.
2. **Khởi tạo giải đấu:** Chọn tab "Giải đấu", nhấn "Tạo giải đấu" (BM10) để nhập thông tin giải đấu.
3. **Cấu hình nội dung:** Chọn hạng mục thi đấu (BM7), thiết lập thể thức thi đấu Bo3/Bo5 và điểm set là 21 (BM11).
4. **Duyệt đăng ký:** BTC kiểm tra danh sách VĐV đăng ký đã nộp lệ phí thi đấu (BM23) và nhấn nút duyệt hồ sơ (BM14).
5. **Bốc thăm:** Nhấn nút "Tạo bốc thăm ngẫu nhiên" (BM11) để Bracket Engine tự động sinh sơ đồ thi đấu loại trực tiếp.
6. **Xếp lịch & sân đấu:** Vào tab "Sân đấu" để khai báo số sân, sau đó vào tab "Lịch thi đấu" (BM18) để gán sân và giờ thi đấu cho từng trận đấu trên Bracket.
7. **Bàn giao:** Trọng tài đăng nhập app di động, vào sân được phân công để ghi điểm trực tiếp (BM17). Kết quả sẽ tự động cập nhật BXH (BM20).

---

## **6.6 Kế hoạch bảo trì phần mềm**

Để đảm bảo hệ thống ShuttleOps luôn hoạt động ổn định và đáp ứng các nhu cầu phát triển trong tương lai, chúng em thiết lập kế hoạch bảo trì phần mềm định kỳ chia làm 4 nhóm:

### **1. Bảo trì sửa lỗi (Corrective Maintenance)**
* Tiếp nhận các phản hồi báo lỗi từ các trọng tài và BTC trong quá trình vận hành giải đấu.
* Tiến hành sửa lỗi và triển khai các bản vá (hotfix) khẩn cấp đối với các lỗi phát sinh như: lỗi tính deuce điểm số, lỗi đồng bộ dữ liệu offline khi mạng chậpじる, lỗi hiển thị sai lệch múi giờ trên thiết bị di động.

### **2. Bảo trì thích ứng (Adaptive Maintenance)**
* Cập nhật và nâng cấp các thư viện phụ thuộc (dependencies) trong dự án để tương thích với các phiên bản môi trường mới.
* Nâng cấp phiên bản Node.js runtime lên các bản LTS mới (v22+), cập nhật React và Vite lên phiên bản mới nhất nhằm vá các lỗ hổng bảo mật của thư viện bên thứ ba và cải thiện hiệu năng thực thi.

### **3. Bảo trì hoàn thiện (Perfective Maintenance)**
* Nâng cấp và phát triển các tính năng mới theo yêu cầu của BTC và Liên đoàn cầu lông quốc gia:
  * Hiện thực hóa thể thức thi đấu nhánh thua (Double Elimination) và vòng tròn tính điểm.
  * Tích hợp cổng thanh toán trực tuyến VNPay/MoMo chính thức (thay cho sandbox mô phỏng).
  * Phát triển ứng dụng di động Native chạy trực tiếp trên iOS và Android dành cho trọng tài điều hành trận đấu trên sân.

### **4. Bảo trì bảo vệ (Preventive Maintenance)**
* Thực hiện tái cấu trúc mã nguồn (code refactoring) định kỳ để giữ cấu trúc dự án sạch sẽ, dễ đọc.
* Lập chỉ mục (Database Indexing) cho các trường thường xuyên truy vấn tìm kiếm như `email` trong `users`, `event_id` và `category_id` trong `matches`, `rankings` để tối ưu hóa hiệu năng truy vấn SQL, đảm bảo hệ thống không bị chậm khi quy mô giải đấu tăng lên.



# **CHƯƠNG 7: KẾT LUẬN**

## **7.1 Tổng kết kết quả đạt được**

Qua quá trình phát triển đồ án ShuttleOps, nhóm chúng em đã gặt hái được những kết quả quan trọng:
1. Xây dựng hoàn thiện hệ thống quản lý giải đấu full-stack ổn định, giao diện hiện đại sử dụng React và Express.
2. Thiết kế và phát triển thành công **Bracket Engine** có khả năng tự động bốc thăm xếp lịch thi đấu, hỗ trợ đầy đủ các vòng đấu, tự động phân phối hạt giống và đặc cách thăng hạng khi gặp vị trí khuyết (BYE).
3. Hiện thực hóa thành công luồng cập nhật điểm trực tiếp theo thời gian thực (Real-time live scoring) qua Socket.IO có tính tương tác cao.
4. Đưa ra giải pháp ghi điểm offline an toàn cho trọng tài, đảm bảo tính nhất quán dữ liệu bằng thuật toán idempotent sync.
5. Thiết kế database PostgreSQL chuẩn hóa cao (3NF) gồm 25+ bảng liên kết chặt chẽ bao phủ toàn bộ khía cạnh vận hành một giải đấu thể thao thực tế.

---

## **7.2 Đánh giá thực tế hiện thực hệ thống (Gap Analysis)**

Để đánh giá một cách khách quan và trung thực quá trình thực hiện dự án, chúng em đã tiến hành rà soát chéo giữa tài liệu thiết kế (biểu mẫu, yêu cầu nghiệp vụ) và mã nguồn (codebase) thực tế của hệ thống ShuttleOps. Kết quả đối chiếu chi tiết làm **bằng chứng chứng minh** dưới đây:

Bảng 7.1: Bảng đối chiếu và bằng chứng thực tế trong codebase của ShuttleOps

| Nghiệp vụ / Biểu mẫu | Trạng thái Codebase | Bằng chứng thực tế trong mã nguồn (Source Code Reference) |
| :--- | :--- | :--- |
| **Đăng nhập & RBAC (BM1, BM2, BM4)** | **Đã hoàn thành (Done)** | - Tầng dịch vụ: [auth.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/auth/auth.service.js)<br>- Middleware check quyền: [auth.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/middleware/auth.js)<br>- Admin UI: [admin folder](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/features/admin/) |
| **Xác thực OTP (BM3)** | **Chưa hiện thực (Undone)** | Chưa khai báo các API endpoint `/verify-otp` hay `/resend-otp` trong router [auth.routes.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/auth/auth.routes.js). |
| **Tạo giải đấu & Hạng mục (BM6, BM7, BM10)** | **Đã hoàn thành (Done)** | - Form frontend React: [events folder](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/features/events/)<br>- API routes backend: [tournament.routes.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/tournament/tournament.routes.js) |
| **Bốc thăm chia nhánh (BM11)** | **Đã hoàn thành (Done)** | - Thuật toán Bracket: [brackets.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/brackets/brackets.service.js)<br>- Frontend vẽ nhánh: [bracket folder](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/features/bracket/) |
| **Duyệt hồ sơ VĐV (BM14)** | **Đã hoàn thành (Done)** | - API xử lý hồ sơ: [registrations.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/participation/participation.service.js) (dòng 50-80)<br>- Bảng lưu trữ: `registrations` trong DB. |
| **Phân công trọng tài (BM16)** | **Đã hoàn thành (Done)** | - Backend validate logic: [competition.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.service.js) (hàm `assignReferee` kiểm tra trùng lịch & đếm $\geq 4$ trận). |
| **Ghi điểm trận đấu (BM17)** | **Đã hoàn thành (Done)** | - Backend Service ghi điểm: [competition.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/competition/competition.service.js) (hàm `updateMatchScore` và `isSetCompleted`).<br>- Offline sync client: [store.ts](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/front-end/src/data/store.ts) |
| **Cập nhật Bảng xếp hạng (BM20)** | **Đã hoàn thành (Done)** | - API backend tính toán BXH: [reporting.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/reporting/reporting.service.js#L6-L73) (hàm `getLeaderboardStats`). |
| **Thanh toán lệ phí thi đấu (BM23)** | **Mô phỏng (Mocked)** | - Chỉ có API mock: [payment.controller.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/payment/payment.controller.js#L49-L53) (hàm `postTransaction` mô phỏng transaction success). |
| **Cảnh báo chi phí ngân sách (BM24)** | **Chưa hiện thực (Undone)** | - Hàm tạo chi phí `createExpense` trong [payment.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/payment/payment.service.js#L117) mới chỉ chèn số tiền âm vào database, chưa có hàm so sánh giới hạn budget. |
| **Trích xuất báo cáo pháp lý (BM25)** | **Chưa hiện thực (Undone)** | - Trong [reporting.routes.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/reporting/reporting.routes.js) mới chỉ có route `/templates` trả về schema cấu hình báo cáo, chưa có code backend render file PDF/Excel. |
| **Gửi Email/SMS & nhắc lịch (FR-06)** | **Chưa hiện thực (Undone)** | - Trong [notification.service.js](file:///d:/UIT/FOUNDATIONAL%20SUBJECTS/SE104-CNPM/Đồ%20án/back-end/src/modules/notification/notification.service.js) mới chỉ lưu tin nhắn vào bảng `notifications` (loại `in_app`), chưa gọi SDK SMTP/SMS nào. |

---

## **7.3 Hạn chế & Hướng phát triển**

### **1. Hạn chế hệ thống**
* Hệ thống thanh toán lệ phí thi đấu trực tuyến mới dừng lại ở mức sandbox và mock API ghi nhận giao dịch.
* Thiếu các dịch vụ thông báo tự động (Email/SMS) và trích xuất báo cáo động (PDF/Excel) ở phía server.
* Chưa có cơ chế xác thực OTP bảo mật khi đăng ký tài khoản.
* Thuật toán bốc thăm phân nhánh mới chỉ hỗ trợ thể thức Loại trực tiếp (Single Elimination) Bo3/Bo5, chưa hỗ trợ thể thức Nhánh thua (Double Elimination) hay đấu vòng tròn (Round Robin).

### **2. Hướng phát triển và thiết kế giải pháp cho các phần thiếu sót**
Để hoàn thiện triệt để hệ thống ShuttleOps trong tương lai, chúng em đề xuất phương án thiết kế kiến trúc kỹ thuật chi tiết cho các module còn thiếu sót:

* **Thiết kế giải pháp xác thực OTP:**
  * *Mô hình dữ liệu:* Tạo bảng `otp_codes` gồm các cột: `id`, `user_id` (khóa ngoại liên kết bảng `users`), `code` (mã OTP 6 số đã được băm), `expired_at` (thời điểm hết hạn, thường là 5 phút sau khi tạo), `resend_cooldown` (cooldown 60s để tránh spam).
  * *Quy trình xử lý:* Khi VĐV đăng ký tài khoản, trạng thái user mặc định là `pending_verification`. Hệ thống sinh mã OTP ngẫu nhiên, lưu vào DB và gọi API của bên thứ ba (ví dụ: Twilio cho SMS hoặc NodeMailer cấu hình SMTP Gmail) để gửi mã tới người dùng. Người dùng nhập mã OTP gửi lên API `POST /api/auth/verify-otp` để xác minh và kích hoạt tài khoản sang `active`.
* **Thiết kế tích hợp cổng thanh toán VNPay thực tế:**
  * *Quy trình thanh toán:* Khi VĐV bấm "Thanh toán online", Backend ShuttleOps sẽ gọi API tạo URL thanh toán của VNPay dựa trên các tham số cấu hình (`vnp_TmnCode`, `vnp_HashSecret`, số tiền, nội dung giao dịch) và trả về link thanh toán. VĐV thực hiện quét mã thanh toán trên cổng VNPay.
  * *Thiết kế Webhook (IPN URL):* Xây dựng endpoint `GET /api/payments/vnpay-ipn` để nhận callback từ VNPay. API này thực hiện:
    1. Kiểm tra chữ ký bảo mật (`vnp_SecureHash`) để đảm bảo request gửi từ VNPay.
    2. Kiểm tra trạng thái giao dịch (`vnp_ResponseCode == '00'`).
    3. Chạy PostgreSQL transaction cập nhật trạng thái thanh toán sang `paid` và duyệt hồ sơ thi đấu tự động trong database.
* **Thiết kế giải pháp xuất báo cáo PDF/Excel tự động:**
  * *Trích xuất Excel:* Sử dụng thư viện `exceljs` hoặc `xlsx` trong Node.js. API `/api/reports/export/excel` sẽ truy vấn dữ liệu bảng xếp hạng và danh sách trận đấu, tạo workbook, style tiêu đề và các ô dữ liệu rồi xuất ra stream gửi về client tải xuống.
  * *Trích xuất PDF:* Sử dụng thư viện `pdfkit` hoặc render HTML sang PDF bằng `puppeteer`. Backend sẽ sinh mã HTML chứa nội dung kết quả giải đấu (mẫu biểu pháp lý quốc gia), sau đó dùng puppeteer chuyển đổi sang định dạng PDF chất lượng cao, lưu trữ file trên S3 và trả về link tải file cho BTC.


# **CHƯƠNG 8: TÀI LIỆU THAM KHẢO**

1. Roger S. Pressman, *Software Engineering: A Practitioner's Approach*, 8th Edition, McGraw-Hill, 2014.
2. Express.js Official Documentation, "Express 5.x API Reference", [Online]. Địa chỉ: https://expressjs.com/ [Truy cập tháng 5/2026].
3. PostgreSQL 16 Manual, "Database Administration and SQL Language", [Online]. Địa chỉ: https://www.postgresql.org/docs/16/ [Truy cập tháng 5/2026].
4. React 19 Docs, "Beta and Release Notes: React Server Components & Actions", [Online]. Địa chỉ: https://react.dev/ [Truy cập tháng 5/2026].
5. Zustand Store Documentation, "React State Management Library", [Online]. Địa chỉ: https://zustand.docs.pmnd.rs/ [Truy cập tháng 5/2026].
6. BWF Statutes, "General Competition Regulations - Section 4: Tournament Play", Badminton World Federation, 2024.

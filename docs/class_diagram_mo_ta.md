# Mô tả Class Diagram — Tổ chức trận đấu & Xếp hạng

Sơ đồ: `docs/class_diagram.svg` (chi tiết phương thức: `docs/CLASS_DIAGRAM.md`).

## Kiểu sơ đồ
Đây là **class diagram kiến trúc tương tác** (không phải ERD). Hệ thống chia 3 tầng:

**Controller → Service → Repository «interface»**

Mỗi lớp là một thành phần chạy thật, có phương thức kèm chữ ký để thể hiện luồng gọi.

## Ba tầng
- **Controller** (`MatchController`, `LeaderboardController`): cổng vào, nhận `req`, trả `Response`.
- **Service** (`MatchService`, `ScoringService`, `LeaderboardService`): chứa nghiệp vụ (vòng đời trận, chấm điểm/undo, tính xếp hạng).
- **Repository «interface»** (`IMatchRepository`, `IScoreEventRepository`, `IMatchSetRepository`, `IRefereeAssignmentRepository`, `IEventRepository`, `ILeaderboardRepository`): hợp đồng truy cập dữ liệu, tách nghiệp vụ khỏi DB.

## Luồng chính
1. `MatchController` gọi `MatchService` (tạo trận, phân công TT, start, finish) và `ScoringService` (ghi điểm, undo).
2. `MatchService` đọc/ghi qua `IMatchRepository`, `IRefereeAssignmentRepository`, `IEventRepository`.
3. `ScoringService` ghi sự kiện điểm qua `IScoreEventRepository` và cập nhật ván qua `IMatchSetRepository`.
4. Khi trận **finish**, `MatchService` kích hoạt `LeaderboardService.recompute()` (mũi tên nét đứt **on finish → recompute**).
5. `LeaderboardController` gọi `LeaderboardService` đọc bảng xếp hạng qua `ILeaderboardRepository`.

Tổng: **tạo trận → phân công TT → start → ghi điểm (lặp) → undo (tuỳ) → finish → tính lại BXH**.

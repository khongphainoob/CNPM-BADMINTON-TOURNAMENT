# Sequence Diagram — Ghi điểm trận đấu (luồng chấm điểm + xếp hạng)

> Phạm vi: luồng **bắt đầu trận → ghi điểm → kết thúc → tính lại BXH** (theo `MATCH_SCORING_FORMS.md`, `CLASS_DIAGRAM.md`).
> Mẫu trình bày bám đúng "Ví dụ 1": (1) sơ đồ tuần tự mức cao, (2) sơ đồ tuần tự chi tiết có đánh số thông điệp, (3) bảng phân loại tương tác.

---

## 1. Sơ đồ tuần tự — mức cao (Ví dụ 1)

Ba đối tượng khái niệm: **Trọng tài → App → Server** (tương tự User → ATM → Bank).

![Sequence mức cao](./sequence_diagram.svg)

```mermaid
sequenceDiagram
    actor Ref as Trọng tài
    participant App
    participant Srv as Server
    Ref->>App: chọnTrận
    App-->>Ref: hiệnSân
    Ref->>App: bắtĐầuTrận
    App->>Srv: mởTrận
    Srv-->>App: ok
    App-->>Ref: bảngĐiểm
    Ref->>App: ghiĐiểm
    App-->>Ref: cậpNhậtĐiểm
```

---

## 2. Sơ đồ tuần tự — chi tiết (Ví dụ 1 tt)

Thêm các **boundary/control/entity**: `ScoreForm` (UI) · `MatchController` · `ScoringService` · `LeaderboardService`, hai actor hai đầu: `:Trọng tài` và `:Server`.

![Sequence chi tiết](./sequence_diagram_detail.svg)

```mermaid
sequenceDiagram
    actor Ref as : Trọng tài
    participant SF as ScoreForm
    participant MC as MatchController
    participant SS as ScoringService
    participant LS as LeaderboardService
    actor Srv as : Server
    Ref->>SF: 1 : startMatch()
    SF->>MC: 2 : start(matchId)
    MC->>Srv: 3 : openMatch()
    Srv-->>MC: 4 : ok()
    Ref->>SF: 5 : recordScore(side)
    SF->>MC: 6 : recordScore(matchId, side)
    MC->>SS: 7 : append(event)
    SF-->>Ref: 8 : showScore()
    Ref->>SF: 9 : finishMatch()
    SF->>MC: 10 : finish(matchId)
    MC->>LS: 11 : recompute(eventId)
    MC-->>SF: 12 : notifyResult()
```

---

## 3. Bảng phân loại tương tác (Ví dụ 1 tt)

| Tương tác | Đối tượng | Loại |
|---|---|---|
| startMatch | ScoreForm | UI |
| start | MatchController | Domain |
| openMatch | MatchController | Domain |
| ok | Server | System |
| recordScore | ScoreForm | UI |
| recordScore | MatchController | Domain |
| append | ScoringService | Domain |
| showScore | ScoreForm | UI |
| finishMatch | ScoreForm | UI |
| finish | MatchController | Domain |
| recompute | LeaderboardService | Domain |
| notifyResult | ScoreForm | UI |

> **Loại:** `UI` = boundary (form người dùng) · `Domain` = control/service nghiệp vụ · `System` = tác nhân ngoài (Server/DB).

"""Build sequence_diagram.docx: render diagrams with Pillow, assemble table."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

docs = Path(__file__).parent
S = 2  # supersample scale
FONT = "C:/Windows/Fonts/arial.ttf"
FONTB = "C:/Windows/Fonts/arialbd.ttf"
BLACK = (34, 34, 34)
BLUE = (31, 79, 216)


def f(size):
    return ImageFont.truetype(FONT, size * S)


def fb(size):
    return ImageFont.truetype(FONTB, size * S)


def canvas(w, h):
    img = Image.new("RGB", (w * S, h * S), "white")
    return img, ImageDraw.Draw(img)


def line(d, x1, y1, x2, y2, width=1, color=BLACK):
    d.line([(x1 * S, y1 * S), (x2 * S, y2 * S)], fill=color, width=max(1, width * S))


def dashed(d, x1, y1, x2, y2, dash=6, gap=5, width=1, color=BLACK):
    import math
    length = math.hypot(x2 - x1, y2 - y1)
    if length == 0:
        return
    ux, uy = (x2 - x1) / length, (y2 - y1) / length
    pos = 0
    while pos < length:
        a = pos
        b = min(pos + dash, length)
        line(d, x1 + ux * a, y1 + uy * a, x1 + ux * b, y1 + uy * b, width, color)
        pos += dash + gap


def rect(d, x, y, w, h, width=1, fill="white", color=BLACK):
    d.rectangle([x * S, y * S, (x + w) * S, (y + h) * S], fill=fill,
                outline=color, width=max(1, width * S))


def arrow_h(d, x1, y, x2, width=1, color=BLACK, head=6):
    """Horizontal arrow from x1 to x2 at height y, head at x2."""
    line(d, x1, y, x2, y, width, color)
    direction = 1 if x2 > x1 else -1
    hx, hy = x2 * S, y * S
    d.polygon([(hx, hy), (hx - direction * head * S, hy - head * 0.6 * S),
               (hx - direction * head * S, hy + head * 0.6 * S)], fill=color)


def text(d, x, y, s, font, anchor="la", color=BLACK):
    """anchor: la=left-baseline-ish top-left, ma=middle top, mm=middle."""
    d.text((x * S, y * S), s, font=font, fill=color, anchor=anchor)


# ============================================================
# Diagram 1 — high level
# ============================================================
def build_high():
    img, d = canvas(760, 470)
    text(d, 380, 16, "Sequence — Ghi diem tran dau", fb(22), anchor="ma", color=BLUE)
    # heads
    for x, w, name in [(40, 170, "Trong tai"), (300, 170, "App"), (560, 170, "Server")]:
        rect(d, x, 60, w, 42, width=2)
        text(d, x + w / 2, 72, name, fb(14), anchor="ma")
    cols = {"ref": 125, "app": 385, "srv": 645}
    for cx in cols.values():
        dashed(d, cx, 102, cx, 450, width=1)
    # activation bars
    for x, y, h in [(118, 150, 250), (378, 168, 40), (378, 226, 62),
                    (378, 330, 44), (638, 240, 34)]:
        rect(d, x, y, 14, h, width=1)

    ft = f(13)

    def msg(x1, y, x2, label):
        arrow_h(d, x1, y, x2, width=1)
        text(d, (x1 + x2) / 2, y - 16, label, ft, anchor="ma")

    msg(132, 170, 378, "chonTran")
    msg(378, 196, 132, "hienSan")
    msg(132, 240, 378, "batDauTran")
    msg(392, 252, 638, "moTran")
    msg(638, 268, 392, "ok")
    msg(378, 284, 132, "bangDiem")
    msg(132, 344, 378, "ghiDiem")
    msg(378, 370, 132, "capNhatDiem")

    out = docs / "sequence_diagram.png"
    img.save(out)
    return out


# ============================================================
# Diagram 2 — detailed
# ============================================================
def build_detail():
    img, d = canvas(960, 560)
    text(d, 480, 8, "Sequence chi tiet — Ghi diem tran dau", fb(20), anchor="ma", color=BLUE)

    def actor(cx, cy, label):
        r = 9
        d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
                  outline=BLACK, width=2)
        line(d, cx, cy + r, cx, cy + 34, 2)
        line(d, cx - 17, cy + 18, cx + 17, cy + 18, 2)
        line(d, cx, cy + 34, cx - 13, cy + 54, 2)
        line(d, cx, cy + 34, cx + 13, cy + 54, 2)
        text(d, cx, cy + 62, label, f(12), anchor="ma")

    actor(55, 70, ": Trong tai")
    actor(915, 70, ": Server")
    for x, w, name in [(160, 120, "ScoreForm"), (340, 130, "MatchController"),
                       (530, 125, "ScoringService"), (710, 150, "LeaderboardService")]:
        rect(d, x, 92, w, 30, width=1)
        text(d, x + w / 2, 100, name, f(12), anchor="ma")

    cols = [55, 220, 405, 592, 785, 915]
    for cx in cols:
        dashed(d, cx, 124, cx, 545, width=1)
    for x, y, h in [(213, 180, 320), (398, 232, 250), (585, 280, 120),
                    (908, 318, 34), (778, 430, 34)]:
        rect(d, x, y, 14, h, width=1)

    ft = f(11)

    def msg(x1, y, x2, label, ret=False):
        if ret:
            dashed(d, x1, y, x2, y, width=1)
            direction = 1 if x2 > x1 else -1
            hx, hy = x2 * S, y * S
            head = 6
            d.polygon([(hx, hy), (hx - direction * head * S, hy - head * 0.6 * S),
                       (hx - direction * head * S, hy + head * 0.6 * S)], fill=BLACK)
        else:
            arrow_h(d, x1, y, x2, width=1)
        text(d, x1 + (8 if x2 > x1 else -8), y - 15, label, ft,
             anchor="la" if x2 > x1 else "ra")

    msg(55, 180, 213, "1 : startMatch()")
    msg(227, 240, 398, "2 : start(matchId)")
    msg(412, 326, 908, "3 : openMatch()")
    msg(908, 346, 412, "4 : ok()", ret=True)
    msg(55, 288, 213, "5 : recordScore(side)")
    msg(227, 370, 398, "6 : recordScore(matchId, side)")
    msg(412, 296, 585, "7 : append(event)")
    msg(213, 392, 55, "8 : showScore()", ret=True)
    msg(55, 430, 213, "9 : finishMatch()")
    msg(227, 456, 398, "10 : finish(matchId)")
    msg(412, 442, 778, "11 : recompute(eventId)")
    msg(398, 476, 213, "12 : notifyResult()", ret=True)

    out = docs / "sequence_diagram_detail.png"
    img.save(out)
    return out


png_high = build_high()
png_detail = build_detail()

# ============================================================
# DOCX
# ============================================================
doc = Document()


def heading(s, size, color=(31, 79, 216)):
    p = doc.add_paragraph()
    r = p.add_run(s)
    r.bold = True
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor(*color)


def add_image(path, width_in):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width_in))


heading("Sequence Diagram — Ghi điểm trận đấu", 18)
doc.add_paragraph(
    "Phạm vi: luồng bắt đầu trận → ghi điểm → kết thúc → tính lại BXH "
    "(theo MATCH_SCORING_FORMS.md, CLASS_DIAGRAM.md)."
)

heading("1. Sơ đồ tuần tự — mức cao", 14)
doc.add_paragraph("Ba đối tượng khái niệm: Trọng tài → App → Server.")
add_image(png_high, 6.0)

heading("2. Sơ đồ tuần tự — chi tiết", 14)
doc.add_paragraph(
    "Boundary/control/entity: ScoreForm (UI) · MatchController · ScoringService · "
    "LeaderboardService; hai actor hai đầu: :Trọng tài và :Server."
)
add_image(png_detail, 6.5)

heading("3. Bảng phân loại tương tác", 14)
rows = [
    ("startMatch", "ScoreForm", "UI"),
    ("start", "MatchController", "Domain"),
    ("openMatch", "MatchController", "Domain"),
    ("ok", "Server", "System"),
    ("recordScore", "ScoreForm", "UI"),
    ("recordScore", "MatchController", "Domain"),
    ("append", "ScoringService", "Domain"),
    ("showScore", "ScoreForm", "UI"),
    ("finishMatch", "ScoreForm", "UI"),
    ("finish", "MatchController", "Domain"),
    ("recompute", "LeaderboardService", "Domain"),
    ("notifyResult", "ScoreForm", "UI"),
]
table = doc.add_table(rows=1, cols=3)
table.style = "Light Grid Accent 1"
for c, t in zip(table.rows[0].cells, ("Tương tác", "Đối tượng", "Loại")):
    c.paragraphs[0].add_run(t).bold = True
for inter, obj, kind in rows:
    cells = table.add_row().cells
    cells[0].text, cells[1].text, cells[2].text = inter, obj, kind

doc.add_paragraph(
    "Loại: UI = boundary (form người dùng) · Domain = control/service nghiệp vụ · "
    "System = tác nhân ngoài (Server/DB)."
)

out = docs / "sequence_diagram.docx"
doc.save(str(out))
print("WROTE", out)

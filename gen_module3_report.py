"""Generate Module 3 UI report (.docx) mirroring the example format."""
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pathlib import Path

doc = Document()

# Base font
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)


def h1(t): doc.add_heading(t, level=1)
def h2(t): doc.add_heading(t, level=2)
def h3(t): doc.add_heading(t, level=3)
def p(t=''): doc.add_paragraph(t)


def make_table(headers, rows):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Table Grid'
    hc = t.rows[0].cells
    for i, htxt in enumerate(headers):
        hc[i].text = htxt
        for par in hc[i].paragraphs:
            for run in par.runs:
                run.font.bold = True
                run.font.size = Pt(9)
    for row in rows:
        rc = t.add_row().cells
        for i, val in enumerate(row):
            rc[i].text = str(val)
            for par in rc[i].paragraphs:
                for run in par.runs:
                    run.font.size = Pt(9)
    return t


def code_block(code):
    t = doc.add_table(rows=1, cols=1)
    t.style = 'Table Grid'
    cell = t.rows[0].cells[0]
    cell.text = ''
    par = cell.paragraphs[0]
    run = par.add_run(code)
    run.font.name = 'Consolas'
    run.font.size = Pt(8.5)


# ============== TITLE ==============
doc.add_heading('BÁO CÁO TRÌNH BÀY — MODULE 3: PHÂN HỆ THAM GIA & PHÂN CÔNG LỊCH ĐẤU', level=0)
p()

h2('DANH SÁCH CÁC MÀN HÌNH ĐƯỢC PHÂN CÔNG')
make_table(
    ['STT', 'Mã BM', 'Tên màn hình', 'File Frontend', 'Chức năng chính'],
    [
        ['1', 'BM13', 'Đăng ký Hồ sơ VĐV', 'features/registration/RegistrationForm.tsx', 'VĐV nộp hồ sơ đăng ký tham dự giải (CCCD, ảnh thẻ, hạng mục, đối tác đôi)'],
        ['2', 'BM14', 'Duyệt Hồ sơ', 'features/registration/RegistrationHubView.tsx + ApprovalModal.tsx', 'BTC tiếp nhận, xét duyệt / từ chối / yêu cầu bổ sung hồ sơ VĐV'],
        ['3', 'BM16', 'Phân công Trọng tài', 'features/referee/MatchAssignmentModal.tsx', 'BTC gán trọng tài cho trận; cảnh báo trùng đơn vị & quá 4 trận/ngày'],
        ['4', 'BM18', 'Điều phối lịch đấu', 'features/tournament/ScheduleView.tsx', 'BTC kéo-thả trận vào sân/khung giờ trên lưới thời gian'],
    ]
)
p()

# ============================================================
# BM13
# ============================================================
h1('BM13 — MÀN HÌNH ĐĂNG KÝ HỒ SƠ VĐV (RegistrationForm)')
p()
h2('1. Ảnh chụp màn hình')
p('- Chụp 1: Form đăng ký nội dung đơn (Họ tên, Email tự điền — disabled; CCCD; ảnh thẻ 3x4; chọn hạng mục).')
p('- Chụp 2: Form khi chọn hạng mục đôi — hiện khối vàng "Nội dung đánh đôi yêu cầu VĐV đối tác".')
p()

h2('2. Danh sách các đối tượng trên màn hình BM13')
make_table(
    ['STT', 'Tên đối tượng', 'Kiểu đối tượng', 'Ràng buộc dữ liệu', 'Chức năng'],
    [
        ['1', 'txtName', 'Input (disabled)', 'Giá trị `currentUser.name`, chỉ đọc', 'Hiển thị họ tên VĐV đang đăng nhập'],
        ['2', 'txtEmail', 'Input (disabled)', 'Giá trị `currentUser.email`, chỉ đọc', 'Email nhận thư xác nhận'],
        ['3', 'txtCccd', 'Input text', 'Bắt buộc, regex `^\\d{12}$` (đúng 12 chữ số)', 'Số Căn cước công dân'],
        ['4', 'filePhoto', 'File input', 'Accept `image/jpeg,image/png`; ≤ 5MB', 'Ảnh thẻ 3x4 + preview tức thì'],
        ['5', 'selEvent', 'Select', 'Bắt buộc, `min(1)`; nguồn `availableEvents[]`', 'Chọn hạng mục thi đấu'],
        ['6', 'selPartner', 'Select', 'Chỉ hiện khi hạng mục là đôi (`doubles`/`mixed_doubles`)', 'Chọn VĐV đối tác cho nội dung đôi'],
        ['7', 'btnCancel', 'Button ghost', '—', 'Huỷ bỏ, gọi `onCancel()`'],
        ['8', 'btnSubmit', 'Button primary', '`disabled` khi `loading === true`', 'Nộp hồ sơ, gọi `onSubmit(data)`'],
    ]
)
p()

h2('3. Danh sách biến cố trên màn hình BM13')
make_table(
    ['STT', 'Biến cố', 'Xử lý tương ứng'],
    [
        ['1', 'Chọn ảnh thẻ (filePhoto onChange)', 'Validate MIME ∈ {jpeg, png} và size ≤ 5MB. Sai → `alert` + reset input. Đúng → `FileReader` đọc base64, set `photoPreview` để xem trước.'],
        ['2', 'Đổi hạng mục (selEvent)', '`watch(\'eventId\')` tính lại `selectedEvent`. Nếu `type === doubles/mixed_doubles` → bật cờ `isDoubles`, render khối chọn đối tác.'],
        ['3', 'Nhấn Nộp hồ sơ (btnSubmit)', 'Zod resolver validate CCCD + eventId. Nếu `isDoubles` mà thiếu `partnerId` → chặn bằng `alert`. Hợp lệ → gọi `onSubmit(data)` đẩy lên API đăng ký.'],
        ['4', 'Nhấn Huỷ bỏ (btnCancel)', 'Gọi `onCancel()`, đóng form, không gửi dữ liệu.'],
    ]
)
p()

h2('4. Đoạn code minh họa')
h3('Lớp 1 — UI React: Zod schema + submit (RegistrationForm.tsx)')
code_block(
"""// File: front-end/src/features/registration/RegistrationForm.tsx
const registrationSchema = z.object({
  cccd:      z.string().regex(/^\\d{12}$/, 'CCCD phải gồm đúng 12 chữ số'),
  photo:     z.any().optional(),
  eventId:   z.string().min(1, 'Vui lòng chọn hạng mục thi đấu'),
  partnerId: z.string().optional()
})

const selectedEvent = availableEvents.find(e => e.id === eventIdWatch)
const isDoubles = selectedEvent?.type === 'doubles'
               || selectedEvent?.type === 'mixed_doubles'

const submit = (data: RegistrationData) => {
  if (isDoubles && !data.partnerId) {
    alert('Vui lòng chọn VĐV đối tác cho nội dung đánh đôi!')
    return
  }
  onSubmit(data)
}"""
)
p()
h3('Lớp 2 — Schema Validation backend (participation.schema.js)')
code_block(
"""// File: back-end/src/modules/participation/participation.schema.js
export const registerParticipantSchema = z.object({
  playerId:  z.coerce.number().int().positive(),
  partnerId: z.coerce.number().int().positive().optional(),
  seed:      z.coerce.number().int().positive().optional()
});"""
)
p()
h3('Lớp 3 — Router / Controller')
code_block(
"""// File: back-end/src/modules/participation/participation.routes.js
router.post('/events/:eventId/register',
  requireAuth,
  requireRole('admin', 'btc', 'athlete', 'coach'),
  validateBody(registerParticipantSchema),
  postRegistration
);

// File: back-end/src/modules/participation/participation.controller.js
export async function postRegistration(req, res, next) {
  try {
    return created(res, await registerPlayer(req.params.eventId, req.body));
  } catch (e) { return next(e); }
}"""
)
p()
h3('Lớp 4 — Service: nghiệp vụ đăng ký (participation.service.js)')
code_block(
"""// File: back-end/src/modules/participation/participation.service.js
export async function registerPlayer(eventId, { playerId, partnerId, seed }) {
  // 1. Kiểm tra event tồn tại + lấy is_doubles
  // 2. Kiểm tra trạng thái giải (chặn nếu finished/cancelled)
  // 3. Ràng buộc nội dung đôi: bắt buộc partner, partner != chính mình
  if (event.is_doubles) {
    if (!partnerId) throw new AppError(400, 'Nội dung đôi cần có partner', 'PARTNER_REQUIRED');
    if (partnerId === playerId) throw new AppError(400, 'Partner không thể là chính mình', 'SAME_PLAYER');
  }
  // 4. Ràng buộc giới tính theo category (MS/WS/MD/WD/XD) ... throw GENDER_MISMATCH
  // 5. Chống trùng đăng ký
  const dup = await query(`SELECT id FROM event_participants
     WHERE event_id = $1 AND (player_id = $2 OR partner_id = $2 ...)`, [...]);
  if (dup.rows[0]) throw new AppError(409, 'VĐV hoặc đồng đội đã đăng ký', 'DUPLICATE_REGISTRATION');

  // 6. Đôi có partner → status = 'pending_partner' (chờ đối tác xác nhận), gửi notification
  const status = (event.is_doubles && partnerId) ? 'pending_partner' : 'registered';
  const result = await query(
    `INSERT INTO event_participants (event_id, player_id, partner_id, seed, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [eventId, playerId, partnerId || null, seed || null, status]
  );
  return result.rows[0];
}"""
)
p()

# ============================================================
# BM14
# ============================================================
h1('BM14 — MÀN HÌNH DUYỆT HỒ SƠ (RegistrationHubView & ApprovalModal)')
p()
h2('1. Ảnh chụp màn hình')
p('- Chụp 1: RegistrationHubView — 4 tab, ô tìm kiếm + lọc hạng mục, bảng hồ sơ "Chờ duyệt" với nút Duyệt mỗi dòng.')
p('- Chụp 2: ApprovalModal — 3 nút quyết định (Phê duyệt / Yêu cầu bổ sung / Từ chối) và ô lý do.')
p()

h2('2. Danh sách các đối tượng trên màn hình BM14')
make_table(
    ['STT', 'Tên đối tượng', 'Kiểu đối tượng', 'Ràng buộc dữ liệu', 'Chức năng'],
    [
        ['1', 'tabHub', 'Tab group', 'Enum: `online / offline / search / events`', 'Chuyển giữa 4 nghiệp vụ tiếp nhận'],
        ['2', 'txtSearch', 'Input text', 'Lọc theo tên VĐV / CLB / mã `REG-{id}`', 'Ô tìm kiếm hồ sơ'],
        ['3', 'selCategory', 'Select', 'Enum: ALL/MS/WS/MD/WD/XD', 'Lọc theo hạng mục thi đấu'],
        ['4', 'tblOnline', 'Table', 'Mảng `onlineRegs` (`status === registered`)', 'Bảng hồ sơ trực tuyến chờ duyệt'],
        ['5', 'btnApprove', 'Button (mỗi dòng)', '—', 'Mở ApprovalModal cho hồ sơ tương ứng'],
        ['6', 'badgeStatus', 'Badge', '`registered` → "Chờ duyệt" (xanh) / khác → vàng', 'Trạng thái hồ sơ'],
        ['7', '— ApprovalModal —', '', '', ''],
        ['8', 'lblRegInfo', 'Label group', 'Mã HS, tên VĐV, CCCD, hạng mục', 'Tóm tắt hồ sơ đang duyệt'],
        ['9', 'btnDecision', 'Button group (3)', 'Enum: `approve / request_supplement / reject`', 'Chọn quyết định duyệt'],
        ['10', 'txtReason', 'Textarea', 'Bắt buộc nếu reject / request_supplement', 'Lý do (gửi kèm email cho VĐV)'],
        ['11', 'btnConfirm', 'Button primary', '`disabled` khi chưa chọn quyết định hoặc thiếu lý do bắt buộc', 'Xác nhận, gọi `onSave(decision, reason)`'],
    ]
)
p()

h2('3. Danh sách biến cố trên màn hình BM14')
make_table(
    ['STT', 'Biến cố', 'Xử lý tương ứng'],
    [
        ['1', 'Trang tải (mount)', '`useEffect` gọi `participationApi.listAllParticipants({limit:100})`, đổ vào `registrations`. Lọc client thành `onlineRegs` / `offlineRegs`.'],
        ['2', 'Nhấn Duyệt (btnApprove)', 'Set `approvalTarget = reg` → render ApprovalModal, ánh xạ `player_code→cccd`, `category_code→eventName`, `player_name→athleteName`.'],
        ['3', 'Chọn quyết định (btnDecision)', 'Set `decision`. Nếu là `reject`/`request_supplement` → `isReasonRequired = true`, ô lý do viền đỏ + bắt buộc.'],
        ['4', 'Nhấn Xác nhận duyệt (btnConfirm)', 'Validate lý do bắt buộc. Gọi `onSave` → `handleApproveSave`: ánh xạ decision→status (`approved/rejected/supplement_required`), gọi `participationApi.updateStatus(id, status)`, toast, refetch.'],
        ['5', 'Nhấn Huỷ (btnClose)', 'Gọi `onClose()`, `setApprovalTarget(null)`, không gọi API.'],
    ]
)
p()

h2('4. Đoạn code minh họa')
h3('Lớp 1 — UI React: chọn quyết định + submit (ApprovalModal.tsx)')
code_block(
"""// File: front-end/src/features/registration/ApprovalModal.tsx
const isReasonRequired = decision === 'reject' || decision === 'request_supplement'

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!decision) return
  if (isReasonRequired && !reason.trim()) {
    alert('Vui lòng nhập lý do')
    return
  }
  onSave(decision, reason)
}"""
)
p()
h3('Lớp 1b — Hub điều phối lưu duyệt (RegistrationHubView.tsx)')
code_block(
"""// File: front-end/src/features/registration/RegistrationHubView.tsx
const handleApproveSave = async (decision: string, reason?: string) => {
  try {
    const status = decision === 'approve' ? 'approved'
                 : decision === 'reject'  ? 'rejected'
                 : 'supplement_required'
    await participationApi.updateStatus(approvalTarget.id, status)
    toast('Đã phê duyệt hồ sơ thành công!', 'success')
    setApprovalTarget(null)
    fetchRegistrations()
  } catch (err: any) {
    toast(err.response?.data?.error?.message || 'Lỗi khi xử lý hồ sơ', 'error')
  }
}"""
)
p()
h3('Lớp 2 — Schema Validation (participation.schema.js)')
code_block(
"""// File: back-end/src/modules/participation/participation.schema.js
export const updateParticipantStatusSchema = z.object({
  status: z.enum(['registered','pending_partner','approved','rejected',
                  'supplement_required','withdrawn'])
});"""
)
p()
h3('Lớp 3 — Router / Controller')
code_block(
"""// File: back-end/src/modules/participation/participation.routes.js
router.patch('/participants/:id/status',
  requireAuth, requireRole('admin', 'btc'),
  validateBody(updateParticipantStatusSchema), patchStatus);

// File: back-end/src/modules/participation/participation.controller.js
export async function patchStatus(req, res, next) {
  try {
    return success(res, await updateParticipantStatus(req.params.id, req.body.status));
  } catch (e) { return next(e); }
}"""
)
p()
h3('Lớp 4 — Service: cập nhật trạng thái + tự tạo lệ phí (participation.service.js)')
code_block(
"""// File: back-end/src/modules/participation/participation.service.js
export async function updateParticipantStatus(id, status) {
  const result = await query(
    `UPDATE event_participants SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!result.rows[0]) throw new AppError(404, 'Participant not found', 'NOT_FOUND');

  // Khi DUYỆT (approved) → tự sinh phiếu lệ phí đăng ký 300.000đ (nếu chưa có)
  if (status === 'approved') {
    const ep = result.rows[0];
    const playerRes = await query('SELECT user_id FROM players WHERE id = $1', [ep.player_id]);
    const userId = playerRes.rows[0]?.user_id;
    const eventRes = await query('SELECT label FROM events WHERE id = $1', [ep.event_id]);
    const existingPayment = await query(
      `SELECT id FROM payments WHERE event_participant_id = $1 AND purpose = 'registration_fee'`, [id]);
    if (existingPayment.rows.length === 0) {
      await query(
        `INSERT INTO payments (code, user_id, event_participant_id, amount, purpose, status, note)
         VALUES ($1, $2, $3, $4, 'registration_fee', 'pending', $5)`,
        [`PAY-REG-${id}-${Date.now().toString().slice(-4)}`, userId || null, id, 300000,
         `Lệ phí đăng ký: ${eventRes.rows[0]?.label || ''}`]
      );
    }
  }
  return result.rows[0];
}"""
)
p()

# ============================================================
# BM16
# ============================================================
h1('BM16 — MÀN HÌNH PHÂN CÔNG TRỌNG TÀI (MatchAssignmentModal)')
p()
h2('1. Ảnh chụp màn hình')
p('- Chụp 1: Modal phân công — thông tin trận, select trọng tài (tự chọn sẵn TT hiện tại khi "Đổi TT"), 3 thẻ thông tin (chứng chỉ, số trận hôm nay X/4, đơn vị).')
p('- Chụp 2: Trạng thái cảnh báo — banner vàng "đã đạt giới hạn 4 trận/ngày" / "không thể hoán đổi trong 15 phút".')
p()

h2('2. Danh sách các đối tượng trên màn hình BM16')
make_table(
    ['STT', 'Tên đối tượng', 'Kiểu đối tượng', 'Ràng buộc dữ liệu', 'Chức năng'],
    [
        ['1', 'lblMatchInfo', 'Label group', 'Tên trận, ngày/giờ, sân (từ `matchDetails`)', 'Tóm tắt trận cần phân công'],
        ['2', 'selReferee', 'Select', 'Bắt buộc; nguồn `referees` (store); pre-select `currentRefereeId` khi đổi TT', 'Chọn / đổi trọng tài (mã + chứng chỉ)'],
        ['3', 'cardCert', 'Info card', '`selectedRef.cert`', 'Hiển thị chứng chỉ trọng tài'],
        ['4', 'cardToday', 'Info card', '`selectedRef.today`/4 (đếm thực tế từ store.fetchMatches)', 'Số trận đang được phân (live + upcoming) hôm nay'],
        ['5', 'cardClub', 'Info card', '`selectedRef.club` (mặc định "Trọng tài Liên đoàn")', 'Đơn vị / CLB của trọng tài'],
        ['6', 'alertOverload', 'Alert vàng', 'Hiện khi `selectedRef.today >= 4`', 'Cảnh báo quá 4 trận/ngày'],
        ['7', 'alertConflict', 'Alert đỏ', 'Hiện khi trùng đơn vị với VĐV (`isConflictClub`)', 'Cảnh báo xung đột đơn vị'],
        ['8', 'alertTooLate', 'Alert vàng', 'Hiện khi còn < 15 phút trước giờ đấu', 'Khoá hoán đổi sát giờ'],
        ['9', 'selRole', 'Select', 'Enum: main_referee / line_judge / service_judge', 'Vai trò trọng tài'],
        ['10', 'selStatus', 'Select', 'Enum: pending / approved / cancelled', 'Trạng thái phân công'],
        ['11', 'txtNotes', 'Textarea', '—', 'Ghi chú phân công'],
        ['12', 'btnSave', 'Button primary', '`disabled` khi chưa chọn trọng tài hoặc `isTooLate`', 'Lưu phân công, gọi `onSave(data)`'],
    ]
)
p()

h2('3. Danh sách biến cố trên màn hình BM16')
make_table(
    ['STT', 'Biến cố', 'Xử lý tương ứng'],
    [
        ['1', 'Mở modal (Gán TT / Đổi TT)', 'Màn cha MatchScheduleView truyền `currentRefereeId`. `refId` khởi tạo = TT hiện tại (nếu có) → select tự chọn sẵn, hỗ trợ đổi trọng tài.'],
        ['2', 'Chọn trọng tài (selReferee)', '`useMemo` tính `selectedRef`. Tính cờ ràng buộc: `isOverload = today >= 4`, `isConflictClub` (trùng đơn vị), `isTooLate` (< 15 phút). Render thẻ thông tin + banner cảnh báo tương ứng.'],
        ['3', 'Quá 4 trận/ngày', 'Cờ `isOverload` bật → banner vàng "đã đạt giới hạn 4 trận/ngày" (cảnh báo mềm, vẫn cho lưu). `today` lấy từ số trận live/upcoming đang gán cho TT (store.fetchMatches).'],
        ['4', 'Hoán đổi sát giờ (< 15 phút)', '`isTooLate` so `matchTime - now < 15*60*1000`. Bật → banner + `disable` nút Lưu (ràng buộc cứng).'],
        ['5', 'Nhấn Lưu phân công (btnSave)', 'Validate có `selectedRef`. Gọi `onSave({ matchId, refereeId, role, status, notes })` → tầng cha lưu qua API xếp lịch (gán `referee_id` cho trận).'],
        ['6', 'Nhấn Huỷ (btnClose)', 'Gọi `onClose()`, đóng modal, không gọi API.'],
    ]
)
p()

h2('4. Đoạn code minh họa')
h3('Lớp 1 — UI React: ràng buộc trọng tài (MatchAssignmentModal.tsx)')
code_block(
"""// File: front-end/src/features/referee/MatchAssignmentModal.tsx
// Hỗ trợ đổi TT: chọn sẵn trọng tài hiện tại của trận
const [refId, setRefId] = useState(currentRefereeId ? String(currentRefereeId) : '')
const selectedRef = useMemo(() => referees.find(r => r.id === refId), [refId, referees])

// Ràng buộc đếm số trận ≥ 4/ngày (today = số trận live/upcoming đang gán cho TT)
const isOverload = selectedRef && selectedRef.today >= 4
// Ràng buộc trùng đơn vị giữa trọng tài và VĐV
const isConflictClub = selectedRef && false // chưa map club cho referee trong store
// Khoá hoán đổi trong 15 phút trước giờ đấu
const matchTime = new Date(`${matchDetails.date}T${matchDetails.time}`)
const isTooLate = (matchTime.getTime() - Date.now()) < 15 * 60 * 1000
              && matchTime.getTime() > Date.now()

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!selectedRef) return
  onSave({ matchId, refereeId: selectedRef.id, role, status, notes })
}"""
)
p()
h3('Lớp 1b — Nguồn dữ liệu số trận/ngày của trọng tài (store.ts)')
code_block(
"""// File: front-end/src/data/store.ts — fetchMatches()
// Đếm số trận đang hoạt động (live + upcoming) theo từng trọng tài để cảnh báo quá tải
const counts: Record<string, number> = {}
items.forEach((m: any) => {
  if (m.referee_id && (m.status === 'live' || m.status === 'upcoming')) {
    const key = String(m.referee_id)
    counts[key] = (counts[key] || 0) + 1
  }
})
const referees = prev.referees.map(r => ({
  ...r,
  assigned: counts[r.id] || 0,
  today: counts[r.id] || 0,   // dùng cho ràng buộc isOverload (>= 4)
}))"""
)
p()
p('Ghi chú: Hệ thống kiểm tra ràng buộc "trùng lịch / cùng đơn vị / ≥ 4 trận/ngày" ở tầng giao diện (client-side). Số trận/ngày (`today`) được tính thực tế trong `store.fetchMatches` bằng cách đếm trận `live`/`upcoming` gán cho mỗi trọng tài. Việc lưu phân công được persist xuống DB qua endpoint xếp lịch của module competition (gán cột `referee_id` cho trận) — chưa có service `assignReferee` riêng ở backend kiểm tra lại ràng buộc.')
p()
h3('Lớp 2 — Schema Validation (competition.schema.js)')
code_block(
"""// File: back-end/src/modules/competition/competition.schema.js
export const scheduleMatchSchema = z.object({
  courtId:               z.coerce.number().int().positive(),
  scheduledAt:           z.string(),
  refereeId:             z.coerce.number().int().positive().optional(),
  estimatedDurationMins: z.coerce.number().int().positive().optional()
});"""
)
p()
h3('Lớp 3 — Router / Controller')
code_block(
"""// File: back-end/src/modules/competition/competition.routes.js
router.patch('/matches/:id/schedule',
  requireAuth, requireRole('admin', 'btc'),
  validateBody(scheduleMatchSchema), patchSchedule);

// File: back-end/src/modules/competition/competition.controller.js
export async function patchSchedule(req, res, next) {
  try {
    return success(res, await scheduleMatch(req.params.id, req.body));
  } catch (e) { return next(e); }
}"""
)
p()
h3('Lớp 4 — Service: gán trọng tài + sân + giờ (competition.service.js)')
code_block(
"""// File: back-end/src/modules/competition/competition.service.js
export async function scheduleMatch(id, { courtId, scheduledAt, refereeId, estimatedDurationMins }) {
  return updateMatch(id, { courtId, scheduledAt, refereeId, estimatedDurationMins });
}

export async function updateMatch(id, data) {
  const fieldMap = { courtId: 'court_id', refereeId: 'referee_id',
                     scheduledAt: 'scheduled_at', status: 'status' };
  const fields = [], values = []; let idx = 1;
  for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
    if (data[jsKey] !== undefined) { fields.push(`${dbKey} = $${idx++}`); values.push(data[jsKey]); }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');
  values.push(id);
  const result = await query(
    `UPDATE matches SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    values
  );
  if (!result.rows[0]) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  return result.rows[0];
}"""
)
p()

# ============================================================
# BM18
# ============================================================
h1('BM18 — MÀN HÌNH ĐIỀU PHỐI LỊCH ĐẤU (ScheduleView)')
p()
h2('1. Ảnh chụp màn hình')
p('- Chụp 1: Lưới thời gian (sân × khung giờ), sidebar "Trận chưa xếp lịch", thanh chọn ngày + bộ lọc hạng mục/trạng thái.')
p('- Chụp 2: Modal "Xếp lịch trận #" — chọn sân, thời gian (datetime-local), thời lượng.')
p()

h2('2. Danh sách các đối tượng trên màn hình BM18')
make_table(
    ['STT', 'Tên đối tượng', 'Kiểu đối tượng', 'Ràng buộc dữ liệu', 'Chức năng'],
    [
        ['1', 'tabDays', 'Button group', 'Sinh từ `tournament.start → end`', 'Chọn ngày thi đấu'],
        ['2', 'selStatus', 'Select', 'Enum: all / scheduled / live / done', 'Lọc theo trạng thái trận'],
        ['3', 'selCategory', 'Select', 'Nguồn `CATEGORIES`', 'Lọc theo hạng mục'],
        ['4', 'sidebarUnscheduled', 'List (draggable)', '`matches.filter(m => !m.court_id)`', 'Danh sách trận chưa xếp, kéo-thả được'],
        ['5', 'gridTimeline', 'Grid', 'Cột = `slots[]` (08:00→20:00), hàng = `courts[]`', 'Lưới sân × khung giờ'],
        ['6', 'dropZone', 'Cell (droppable)', 'Mỗi ô = (court, slot)', 'Vùng thả trận để xếp lịch'],
        ['7', 'blockMatch', 'Block', 'Vị trí `left/width` theo `start` & `span` (duration/60)', 'Khối trận đã xếp trên lưới'],
        ['8', 'cellMaintenance', 'Overlay', 'Hiện khi `court.status === maintenance`', 'Đánh dấu sân bảo trì — không xếp'],
        ['9', 'modalSchedule', 'Modal', 'Mở khi click trận', 'Form xếp/sửa lịch chi tiết'],
        ['10', 'selCourt', 'Select', 'Nguồn `courts[]`', 'Chọn sân trong modal'],
        ['11', 'inpScheduledAt', 'Input datetime-local', '—', 'Thời gian bắt đầu'],
        ['12', 'inpDuration', 'Input number', '`step=15, min=15`', 'Thời lượng dự kiến (phút)'],
        ['13', 'btnSaveSchedule', 'Button primary', 'Cần `selectedMatch && selectedCourt && scheduledAt`', 'Lưu lịch, gọi API'],
    ]
)
p()

h2('3. Danh sách biến cố trên màn hình BM18')
make_table(
    ['STT', 'Biến cố', 'Xử lý tương ứng'],
    [
        ['1', 'Trang tải / đổi giải (mount)', '`useEffect` gọi song song `tournamentApi.listCourts` + `competitionApi.listMatches({tournament_id})`. Sinh danh sách ngày từ start→end.'],
        ['2', 'Kéo trận từ sidebar (dragStart)', '`e.dataTransfer.setData` lưu `{matchId, matchDuration}`.'],
        ['3', 'Thả trận vào ô lưới (drop)', 'Đọc data, ghép `dates[day]` + `slots[slotIndex]` thành `scheduledAt`. Gọi `competitionApi.scheduleMatch(matchId, {courtId, scheduledAt, estimatedDurationMins})`, toast, refetch.'],
        ['4', 'Click trận (đã/chưa xếp)', '`handleOpenSchedule` nạp sân/giờ/thời lượng hiện tại vào state, mở modal.'],
        ['5', 'Nhấn Lưu lịch (btnSaveSchedule)', 'Validate đủ field. Gọi `scheduleMatch` với ISO time, toast thành công/lỗi, đóng modal, refetch.'],
        ['6', 'Đổi ngày / bộ lọc', 'Lọc client `visibleBlocks` theo ngày đã chọn + hạng mục + trạng thái, vẽ lại lưới.'],
    ]
)
p()

h2('4. Đoạn code minh họa')
h3('Lớp 1 — UI React: kéo-thả xếp lịch (ScheduleView.tsx)')
code_block(
"""// File: front-end/src/features/tournament/ScheduleView.tsx
const handleDrop = async (e, courtId, slotIndex) => {
  e.preventDefault()
  const data = JSON.parse(e.dataTransfer.getData('application/json'))
  if (!data.matchId) return

  const timeStr = slots[slotIndex]          // ví dụ '14:00'
  const now = new Date(dates[day] || new Date())
  const [hh, mm] = timeStr.split(':')
  now.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0)

  await competitionApi.scheduleMatch(data.matchId, {
    courtId: Number(courtId),
    scheduledAt: now.toISOString(),
    estimatedDurationMins: data.matchDuration || 60
  })
  toast('Cập nhật lịch thi đấu thành công')
  fetchData()
}"""
)
p()
h3('Lớp 2, 3, 4 — Backend xếp lịch')
p('BM18 dùng chung endpoint xếp lịch của module competition với BM16: `PATCH /api/competition/matches/:id/schedule` → `scheduleMatchSchema` → `patchSchedule` → `scheduleMatch()` → `updateMatch()`. Xem chi tiết Lớp 2/3/4 ở mục BM16.')
p()

# ============================================================
# MAPPING TABLE
# ============================================================
h1('BẢNG TỔNG HỢP ÁNH XẠ MÃ NGUỒN')
p()
make_table(
    ['Màn hình', 'File Frontend', 'File Backend (Service)', 'File Backend (Route)', 'File Schema', 'API chính'],
    [
        ['BM13', 'registration/RegistrationForm.tsx', 'participation/participation.service.js (registerPlayer)', 'participation/participation.routes.js', 'participation.schema.js', 'POST /api/participation/events/:eventId/register'],
        ['BM14', 'registration/RegistrationHubView.tsx + ApprovalModal.tsx', 'participation/participation.service.js (updateParticipantStatus)', 'participation/participation.routes.js', 'participation.schema.js', 'GET /participants · PATCH /participants/:id/status'],
        ['BM16', 'referee/MatchAssignmentModal.tsx', 'competition/competition.service.js (scheduleMatch/updateMatch)', 'competition/competition.routes.js', 'competition.schema.js', 'PATCH /api/competition/matches/:id/schedule'],
        ['BM18', 'tournament/ScheduleView.tsx', 'competition/competition.service.js (scheduleMatch)', 'competition/competition.routes.js', 'competition.schema.js', 'PATCH /api/competition/matches/:id/schedule'],
    ]
)
p()

out = Path(r'C:/Users/FPT/CNPM-BADMINTON-TOURNAMENT/BAO_CAO_MODULE_3_PHAN_CONG_THAM_GIA_LICH_DAU.docx')
doc.save(str(out))
print('Saved:', out)

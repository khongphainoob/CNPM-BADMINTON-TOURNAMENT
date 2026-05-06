/* Seed data for the prototype */

const TOURNAMENT = {
  id: 'VNBAD-2026-03',
  name: 'Giải Cầu Lông Các CLB Toàn Quốc 2026',
  nameEn: 'National Club Badminton Championship 2026',
  venue: 'Nhà thi đấu Phú Thọ, TP.HCM',
  start: '2026-04-18',
  end: '2026-04-26',
  status: 'live',
  format: 'Bảng → Loại trực tiếp',
  categories: ['MS', 'WS', 'MD', 'WD', 'XD'],
  registered: 384,
  approved: 342,
  matches: { total: 284, done: 118, live: 6, next: 12 },
  courts: 8,
  shuttles: { stock: 412, min: 120, usedToday: 87 },
  revenue: 512_400_000,
  budget: 780_000_000,
};

const CATEGORIES = {
  MS: 'Đơn nam',
  WS: 'Đơn nữ',
  MD: 'Đôi nam',
  WD: 'Đôi nữ',
  XD: 'Đôi nam nữ',
};

const COURTS = [
  { id: 1, label: 'Sân 1',  floor: 'Taraflex', status: 'live',       match: 'MS-R32 · #184' },
  { id: 2, label: 'Sân 2',  floor: 'Taraflex', status: 'live',       match: 'WS-R32 · #185' },
  { id: 3, label: 'Sân 3',  floor: 'Taraflex', status: 'live',       match: 'MD-R16 · #186' },
  { id: 4, label: 'Sân 4',  floor: 'Taraflex', status: 'idle',       match: null },
  { id: 5, label: 'Sân 5',  floor: 'PVC',      status: 'live',       match: 'XD-R16 · #187' },
  { id: 6, label: 'Sân 6',  floor: 'PVC',      status: 'live',       match: 'WD-R16 · #188' },
  { id: 7, label: 'Sân 7',  floor: 'PVC',      status: 'maintenance',match: 'Bảo trì lưới' },
  { id: 8, label: 'Sân 8',  floor: 'PVC',      status: 'live',       match: 'MS-R32 · #189' },
];

const LIVE_MATCHES = [
  { id: 184, court: 1, cat: 'MS', round: 'Vòng 1/16',
    a: { name: 'Nguyễn Hải Đăng', club: 'CAND', seed: 3 },
    b: { name: 'Trần Minh Quân',  club: 'TP.HCM', seed: null },
    sets: [[21,18],[14,21],[17,14]], current: 2,
    umpire: 'Lê Quang Huy', start: '14:20', elapsed: '48:12' },
  { id: 185, court: 2, cat: 'WS', round: 'Vòng 1/16',
    a: { name: 'Vũ Thị Trang',   club: 'Hà Nội', seed: 1 },
    b: { name: 'Phạm Lan Anh',   club: 'Đà Nẵng', seed: null },
    sets: [[21,15],[19,16]], current: 1,
    umpire: 'Nguyễn Hồng Sơn', start: '14:25', elapsed: '42:05' },
  { id: 186, court: 3, cat: 'MD', round: 'Tứ kết',
    a: { name: 'Đỗ Tuấn Đức / Phạm Hồng Nam', club: 'Hà Nội', seed: 2 },
    b: { name: 'Phan Lê Anh / Lý Hoàng Nam',  club: 'Becamex', seed: null },
    sets: [[19,21],[21,17],[8,6]], current: 2,
    umpire: 'Trịnh Quốc Hưng', start: '14:10', elapsed: '58:40' },
  { id: 187, court: 5, cat: 'XD', round: 'Vòng 1/16',
    a: { name: 'Đỗ Tuấn Đức / Phạm Thị Khánh', club: 'Hà Nội', seed: 4 },
    b: { name: 'Nguyễn Tiến Minh / Vũ Trang',  club: 'TP.HCM', seed: null },
    sets: [[21,12],[13,11]], current: 1,
    umpire: 'Phạm Thành Long', start: '14:35', elapsed: '31:22' },
  { id: 188, court: 6, cat: 'WD', round: 'Vòng 1/16',
    a: { name: 'Thân Vân Anh / Phạm Như Thảo', club: 'Quân Đội', seed: null },
    b: { name: 'Nguyễn Thùy Linh / Vũ Trang',  club: 'Hà Nội', seed: 1 },
    sets: [[15,21],[21,19],[3,2]], current: 2,
    umpire: 'Hoàng Mai', start: '14:15', elapsed: '54:20' },
  { id: 189, court: 8, cat: 'MS', round: 'Vòng 1/16',
    a: { name: 'Lê Đức Phát',    club: 'Quân Đội', seed: 5 },
    b: { name: 'Nguyễn Hoàng Nam',club: 'TP.HCM', seed: null },
    sets: [[21,19],[9,4]], current: 1,
    umpire: 'Đinh Văn Khoa', start: '14:40', elapsed: '26:18' },
];

const UPCOMING = [
  { id: 190, t: '15:30', court: 4, cat: 'WS',  round: 'Vòng 1/16', a: 'Nguyễn Thùy Linh', b: 'Đào Ngọc Bích' },
  { id: 191, t: '15:30', court: 7, cat: 'MS',  round: 'Vòng 1/16', a: 'Phạm Văn Hiếu',    b: 'Trần Quốc Toàn' },
  { id: 192, t: '16:00', court: 1, cat: 'MS',  round: 'Vòng 1/16', a: 'Lê Hoàng Phúc',    b: 'Vũ Tiến Dũng' },
  { id: 193, t: '16:00', court: 2, cat: 'WD',  round: 'Tứ kết',    a: 'Vân Anh / Khánh',  b: 'Linh / Trang' },
  { id: 194, t: '16:30', court: 3, cat: 'XD',  round: 'Tứ kết',    a: 'Đức / Khánh',      b: 'Minh / Trang' },
  { id: 195, t: '16:30', court: 5, cat: 'MS',  round: 'Vòng 1/16', a: 'Nguyễn Tiến Minh', b: 'Hoàng Văn Bách' },
];

const ATHLETES = [
  { id: 'A-0142', name: 'Nguyễn Hải Đăng',  club: 'CAND',    gender: 'M', dob: '1998', rating: 2184, status: 'approved', tier: 'A', img: null },
  { id: 'A-0143', name: 'Vũ Thị Trang',     club: 'Hà Nội',  gender: 'F', dob: '2001', rating: 2241, status: 'approved', tier: 'A' },
  { id: 'A-0144', name: 'Đỗ Tuấn Đức',      club: 'Hà Nội',  gender: 'M', dob: '1995', rating: 2098, status: 'approved', tier: 'A' },
  { id: 'A-0145', name: 'Lê Đức Phát',      club: 'Quân Đội',gender: 'M', dob: '1999', rating: 2012, status: 'approved', tier: 'A' },
  { id: 'A-0146', name: 'Nguyễn Thùy Linh', club: 'Hà Nội',  gender: 'F', dob: '1997', rating: 2302, status: 'approved', tier: 'A' },
  { id: 'A-0147', name: 'Trần Minh Quân',   club: 'TP.HCM',  gender: 'M', dob: '2002', rating: 1842, status: 'approved', tier: 'B' },
  { id: 'A-0201', name: 'Phạm Lê Hoàng',    club: 'Bắc Giang',gender:'M', dob: '2003', rating: 1720, status: 'pending',  tier: 'B' },
  { id: 'A-0202', name: 'Đặng Thị Mai',     club: 'Hải Phòng',gender:'F', dob: '2004', rating: 1688, status: 'pending',  tier: 'B' },
  { id: 'A-0203', name: 'Vũ Quốc Anh',      club: 'Thanh Hóa',gender:'M', dob: '2005', rating: 1510, status: 'pending',  tier: 'C' },
  { id: 'A-0204', name: 'Bùi Khánh Linh',   club: 'Nghệ An', gender:'F', dob: '2006', rating: 1432, status: 'incomplete', note: 'CCCD mờ, thiếu ảnh 3x4' },
];

const NEWS = [
  { id: 'N-1', title: 'Khai mạc Giải Cầu Lông Các CLB Toàn Quốc 2026', ts: '18/04 · 09:00', tag: 'Thông báo' },
  { id: 'N-2', title: 'Cập nhật thể thức & hạt giống 5 hạng mục', ts: '17/04 · 18:20', tag: 'Thể thức' },
  { id: 'N-3', title: 'Highlight — Tuấn Đức thắng ngược ở set quyết định', ts: '18/04 · 15:42', tag: 'Highlight' },
  { id: 'N-4', title: 'Hướng dẫn khán giả vào cổng và khu ghế ngồi', ts: '17/04 · 10:05', tag: 'Khán giả' },
];

const RANKING_MS = [
  { rank: 1, name: 'Nguyễn Thùy Linh', club: 'Hà Nội',  pts: 18420, chg: +2, tier: 'A' },
  { rank: 2, name: 'Nguyễn Tiến Minh', club: 'TP.HCM',  pts: 17980, chg: -1, tier: 'A' },
  { rank: 3, name: 'Lê Đức Phát',      club: 'Quân Đội',pts: 16240, chg: +4, tier: 'A' },
  { rank: 4, name: 'Nguyễn Hải Đăng',  club: 'CAND',    pts: 15880, chg: 0,  tier: 'A' },
  { rank: 5, name: 'Đỗ Tuấn Đức',      club: 'Hà Nội',  pts: 15410, chg: -2, tier: 'A' },
  { rank: 6, name: 'Vũ Thị Trang',     club: 'Hà Nội',  pts: 14960, chg: +1, tier: 'A' },
  { rank: 7, name: 'Phạm Như Thảo',    club: 'Quân Đội',pts: 14220, chg: +3, tier: 'A' },
  { rank: 8, name: 'Trần Minh Quân',   club: 'TP.HCM',  pts: 13710, chg: -1, tier: 'B' },
];

window.TOURNAMENT = TOURNAMENT;
window.CATEGORIES = CATEGORIES;
window.COURTS = COURTS;
window.LIVE_MATCHES = LIVE_MATCHES;
window.UPCOMING = UPCOMING;
window.ATHLETES = ATHLETES;
window.NEWS = NEWS;
window.RANKING_MS = RANKING_MS;

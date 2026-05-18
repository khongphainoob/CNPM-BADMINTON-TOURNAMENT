-- =============================================================================
-- Seed data — rút từ front-end (auth.ts, legacy.ts, store.ts)
-- Chạy SAU schema.sql.
-- LƯU Ý: password_hash dưới đây là bcrypt cost 10 cho mật khẩu plain ghi trong
--        comment cạnh đó. Trong production phải tự sinh lại bằng bcrypt.
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- M1: roles + permissions cơ bản
-- -----------------------------------------------------------------------------
INSERT INTO roles (code, label) VALUES
  ('admin',     'Quản trị hệ thống'),
  ('btc',       'Ban tổ chức'),
  ('referee',   'Trọng tài'),
  ('athlete',   'Vận động viên'),
  ('spectator', 'Khán giả');

INSERT INTO permissions (code, label) VALUES
  ('user.approve',     'Duyệt tài khoản'),
  ('user.role.assign', 'Gán vai trò'),
  ('tournament.write', 'Quản lý giải đấu'),
  ('match.score.write','Ghi điểm trận đấu'),
  ('inventory.write',  'Quản lý kho vật tư'),
  ('payment.write',    'Ghi nhận giao dịch');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE (r.code = 'admin')
   OR (r.code = 'btc'     AND p.code IN ('tournament.write','inventory.write','payment.write','user.approve'))
   OR (r.code = 'referee' AND p.code = 'match.score.write');

-- -----------------------------------------------------------------------------
-- M1: users (mật khẩu plain ở comment — đây là bcrypt giả định)
--   admin@shuttleops.vn      / admin123
--   phamlam@shuttleops.vn    / btc123
--   lequanghuy@shuttleops.vn / ref123
--   nguyenhaidang@...        / vdv123
--   khangia@shuttleops.vn    / fan123
-- -----------------------------------------------------------------------------
INSERT INTO users (email, phone, password_hash, name, primary_role_id, status) VALUES
  ('admin@shuttleops.vn',         NULL,         '$2b$10$placeholderHashForAdmin000000000000000000', 'Admin',           (SELECT id FROM roles WHERE code='admin'),     'approved'),
  ('phamlam@shuttleops.vn',       '0901234567', '$2b$10$placeholderHashForBtc0000000000000000000000', 'Phạm Lâm',        (SELECT id FROM roles WHERE code='btc'),       'approved'),
  ('lequanghuy@shuttleops.vn',    '0912345678', '$2b$10$placeholderHashForRef0000000000000000000000', 'Lê Quang Huy',    (SELECT id FROM roles WHERE code='referee'),   'approved'),
  ('nguyenhaidang@shuttleops.vn', '0923456789', '$2b$10$placeholderHashForVdv0000000000000000000000', 'Nguyễn Hải Đăng', (SELECT id FROM roles WHERE code='athlete'),   'approved'),
  ('khangia@shuttleops.vn',       NULL,         '$2b$10$placeholderHashForFan0000000000000000000000', 'Khán giả',        (SELECT id FROM roles WHERE code='spectator'), 'approved'),
  ('tranvanminh@example.com',     '0934567890', '$2b$10$placeholderHashForTest000000000000000000000', 'Trần Văn Minh',   NULL,                                          'pending'),
  ('lethilan@example.com',        '0945678901', '$2b$10$placeholderHashForTest000000000000000000000', 'Lê Thị Lan',      NULL,                                          'pending');

-- Gán user_roles (mirror primary_role)
INSERT INTO user_roles (user_id, role_id)
SELECT id, primary_role_id FROM users WHERE primary_role_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- M3: categories
-- -----------------------------------------------------------------------------
INSERT INTO categories (code, label, is_doubles) VALUES
  ('MS', 'Đơn nam',     FALSE),
  ('WS', 'Đơn nữ',      FALSE),
  ('MD', 'Đôi nam',     TRUE),
  ('WD', 'Đôi nữ',      TRUE),
  ('XD', 'Đôi nam nữ',  TRUE);

-- -----------------------------------------------------------------------------
-- M3: venues + tournaments + events + courts
-- -----------------------------------------------------------------------------
INSERT INTO venues (name, address, province) VALUES
  ('Nhà thi đấu Phú Thọ', '1 Lữ Gia, Q.11', 'TP.HCM');

INSERT INTO tournaments (code, name, name_en, venue_id, start_date, end_date, status, format, budget, revenue)
VALUES (
  'VNBAD-2026-03',
  'Giải Cầu Lông Các CLB Toàn Quốc 2026',
  'National Club Badminton Championship 2026',
  (SELECT id FROM venues WHERE name='Nhà thi đấu Phú Thọ'),
  '2026-04-18', '2026-04-26',
  'live', 'Bảng → Loại trực tiếp',
  780000000, 512400000
);

INSERT INTO events (tournament_id, category_code, label)
SELECT t.id, c.code, c.label || ' — ' || t.code
FROM tournaments t CROSS JOIN categories c
WHERE t.code = 'VNBAD-2026-03';

INSERT INTO courts (tournament_id, label, floor, status) VALUES
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 1', 'Taraflex', 'live'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 2', 'Taraflex', 'live'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 3', 'Taraflex', 'live'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 4', 'Taraflex', 'idle'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 5', 'PVC',      'live'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 6', 'PVC',      'live'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 7', 'PVC',      'maintenance'),
  ((SELECT id FROM tournaments WHERE code='VNBAD-2026-03'), 'Sân 8', 'PVC',      'live');

-- -----------------------------------------------------------------------------
-- M2: clubs + players + referees
-- -----------------------------------------------------------------------------
INSERT INTO clubs (code, name, province) VALUES
  ('CAND',  'CAND',          'Hà Nội'),
  ('HN',    'Hà Nội',        'Hà Nội'),
  ('HCM',   'TP.HCM',        'TP.HCM'),
  ('QD',    'Quân Đội',      'Hà Nội'),
  ('BCM',   'Becamex',       'Bình Dương'),
  ('DN',    'Đà Nẵng',       'Đà Nẵng'),
  ('BG',    'Bắc Giang',     'Bắc Giang'),
  ('HP',    'Hải Phòng',     'Hải Phòng'),
  ('TH',    'Thanh Hóa',     'Thanh Hóa'),
  ('NA',    'Nghệ An',       'Nghệ An');

INSERT INTO players (code, club_id, name, gender, dob, rating, tier, profile_status) VALUES
  ('A-0142', (SELECT id FROM clubs WHERE code='CAND'), 'Nguyễn Hải Đăng',  'M', '1998-01-01', 2184, 'A', 'approved'),
  ('A-0143', (SELECT id FROM clubs WHERE code='HN'),   'Vũ Thị Trang',     'F', '2001-01-01', 2241, 'A', 'approved'),
  ('A-0144', (SELECT id FROM clubs WHERE code='HN'),   'Đỗ Tuấn Đức',      'M', '1995-01-01', 2098, 'A', 'approved'),
  ('A-0145', (SELECT id FROM clubs WHERE code='QD'),   'Lê Đức Phát',      'M', '1999-01-01', 2012, 'A', 'approved'),
  ('A-0146', (SELECT id FROM clubs WHERE code='HN'),   'Nguyễn Thùy Linh', 'F', '1997-01-01', 2302, 'A', 'approved'),
  ('A-0147', (SELECT id FROM clubs WHERE code='HCM'),  'Trần Minh Quân',   'M', '2002-01-01', 1842, 'B', 'approved'),
  ('A-0201', (SELECT id FROM clubs WHERE code='BG'),   'Phạm Lê Hoàng',    'M', '2003-01-01', 1720, 'B', 'pending'),
  ('A-0202', (SELECT id FROM clubs WHERE code='HP'),   'Đặng Thị Mai',     'F', '2004-01-01', 1688, 'B', 'pending'),
  ('A-0203', (SELECT id FROM clubs WHERE code='TH'),   'Vũ Quốc Anh',      'M', '2005-01-01', 1510, 'C', 'pending'),
  ('A-0204', (SELECT id FROM clubs WHERE code='NA'),   'Bùi Khánh Linh',   'F', '2006-01-01', 1432, NULL, 'incomplete');

-- Link athlete user → player
UPDATE players SET user_id = (SELECT id FROM users WHERE email='nguyenhaidang@shuttleops.vn')
WHERE code = 'A-0142';

INSERT INTO referees (code, user_id, name, cert, phone) VALUES
  ('R-01', (SELECT id FROM users WHERE email='lequanghuy@shuttleops.vn'), 'Lê Quang Huy',    'QG_A', '0912345678'),
  ('R-02', NULL, 'Nguyễn Hồng Sơn',  'QG_A', NULL),
  ('R-03', NULL, 'Trịnh Quốc Hưng',  'QG_B', NULL),
  ('R-04', NULL, 'Phạm Thành Long',  'QG_B', NULL),
  ('R-05', NULL, 'Hoàng Mai',        'QG_A', NULL),
  ('R-06', NULL, 'Đinh Văn Khoa',    'QG_B', NULL);

-- -----------------------------------------------------------------------------
-- M5: event_participants — đăng ký vài người vào event MS để demo
-- -----------------------------------------------------------------------------
INSERT INTO event_participants (event_id, player_id, seed)
SELECT e.id, p.id, CASE p.code WHEN 'A-0142' THEN 3 WHEN 'A-0145' THEN 5 END
FROM events e
JOIN tournaments t ON t.id = e.tournament_id
JOIN players p ON p.code IN ('A-0142','A-0145','A-0147','A-0201')
WHERE t.code='VNBAD-2026-03' AND e.category_code='MS';

-- -----------------------------------------------------------------------------
-- M4: matches + participants + sets  (trận #184 live)
-- -----------------------------------------------------------------------------
INSERT INTO matches (code, event_id, round, court_id, referee_id, scheduled_at, started_at, status)
SELECT
  '#184',
  e.id,
  'Vòng 1/16',
  (SELECT id FROM courts WHERE label='Sân 1' AND tournament_id=t.id),
  (SELECT id FROM referees WHERE code='R-01'),
  '2026-04-19 14:20:00+07', '2026-04-19 14:20:00+07',
  'live'
FROM tournaments t JOIN events e ON e.tournament_id = t.id
WHERE t.code='VNBAD-2026-03' AND e.category_code='MS';

INSERT INTO match_participants (match_id, side, player_id, seed)
SELECT m.id, 'A', p.id, 3 FROM matches m JOIN players p ON p.code='A-0142' WHERE m.code='#184'
UNION ALL
SELECT m.id, 'B', p.id, NULL FROM matches m JOIN players p ON p.code='A-0147' WHERE m.code='#184';

INSERT INTO match_sets (match_id, set_no, score_a, score_b, winner)
SELECT m.id, 1, 21, 18, 'A' FROM matches m WHERE m.code='#184'
UNION ALL SELECT m.id, 2, 14, 21, 'B' FROM matches m WHERE m.code='#184'
UNION ALL SELECT m.id, 3, 17, 14, NULL FROM matches m WHERE m.code='#184';

-- -----------------------------------------------------------------------------
-- M8: inventory + news
-- -----------------------------------------------------------------------------
INSERT INTO inventory_items (sku, name, unit, stock, min_stock, issued) VALUES
  ('SH-VIC-AS30', 'Victor AS-30 · tournament grade',     'ống', 132, 80, 28),
  ('SH-YNX-AS50', 'Yonex AS-50 · tournament grade',      'ống',  96, 80, 34),
  ('SH-YNX-M300', 'Yonex Mavis 300 · plastic (warmup)',  'ống',  84, 40, 12),
  ('SH-LIN-A200', 'Li-Ning A+200 · training',            'ống', 100, 60, 13),
  ('GR-BGY-65',   'Yonex BG65 · dây vợt',                'cuộn', 22, 30,  4),
  ('TW-STD',      'Khăn lau sân · hộp 50',               'hộp',  18, 20,  6);

INSERT INTO news (tournament_id, title, body, tag, published_at, created_by)
SELECT t.id,
       'Khai mạc Giải Cầu Lông Các CLB Toàn Quốc 2026',
       'Sự kiện khai mạc tại Nhà thi đấu Phú Thọ.',
       'Thông báo',
       '2026-04-18 09:00:00+07',
       (SELECT id FROM users WHERE email='phamlam@shuttleops.vn')
FROM tournaments t WHERE t.code='VNBAD-2026-03';

-- -----------------------------------------------------------------------------
-- M7: payment mẫu
-- -----------------------------------------------------------------------------
INSERT INTO payments (code, user_id, amount, purpose, status, paid_at)
SELECT 'PAY-2026-0001', u.id, 500000, 'registration_fee', 'paid', '2026-04-15 10:00:00+07'
FROM users u WHERE u.email='nguyenhaidang@shuttleops.vn';

INSERT INTO payment_transactions (payment_id, gateway, gateway_txn_id, amount, status)
SELECT p.id, 'vnpay', 'VNP-TXN-001', p.amount, 'success'
FROM payments p WHERE p.code='PAY-2026-0001';

-- -----------------------------------------------------------------------------
-- M6: notification template + 1 thông báo mẫu
-- -----------------------------------------------------------------------------
INSERT INTO notification_templates (code, channel, subject, body_template) VALUES
  ('ACCOUNT_APPROVED', 'in_app', 'Tài khoản đã được duyệt',
   'Xin chào {{name}}, tài khoản của bạn đã được phê duyệt với vai trò {{role}}.');

INSERT INTO notifications (user_id, template_id, channel, subject, body, status, sent_at)
SELECT u.id,
       (SELECT id FROM notification_templates WHERE code='ACCOUNT_APPROVED'),
       'in_app',
       'Tài khoản đã được duyệt',
       'Xin chào Nguyễn Hải Đăng, tài khoản của bạn đã được phê duyệt với vai trò athlete.',
       'sent',
       now()
FROM users u WHERE u.email='nguyenhaidang@shuttleops.vn';

-- -----------------------------------------------------------------------------
-- M8: activity_log + 1 report_template ví dụ
-- -----------------------------------------------------------------------------
INSERT INTO report_templates (code, title, description, query_sql, params_schema) VALUES
  ('REVENUE_BY_TOURNAMENT',
   'Doanh thu theo giải đấu',
   'Tổng thu/chi theo purpose cho 1 tournament',
   'SELECT purpose, SUM(amount) FROM payments WHERE status=''paid'' GROUP BY purpose;',
   '{}'::jsonb);

INSERT INTO activity_log (actor_user_id, action, target_type, target_id, message)
VALUES
  ((SELECT id FROM users WHERE email='phamlam@shuttleops.vn'),
   'tournament.create', 'tournament', 'VNBAD-2026-03',
   'Tạo giải Giải Cầu Lông Các CLB Toàn Quốc 2026');

-- =============================================================================
-- HẾT SEED
-- =============================================================================

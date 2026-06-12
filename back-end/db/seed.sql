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
  ('coach',     'Huấn luyện viên'),
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
  ('admin@shuttleops.vn',         NULL,         '$2b$10$iOdKfujT828I9hQIP5WJKeTR1Oi8LqwvinDjiTDiwxLm5wh1Bk7lq', 'Admin',           (SELECT id FROM roles WHERE code='admin'),     'approved'),
  ('phamlam@shuttleops.vn',       '0901234567', '$2b$10$Wr0zPIAvcqNr71qJUyqdG.NjPZDu1LEyNUZUqruRC.GZkSx0HhZX2', 'Phạm Lâm',        (SELECT id FROM roles WHERE code='btc'),       'approved'),
  ('lequanghuy@shuttleops.vn',    '0912345678', '$2b$10$2aijmr8QlNTJZY.SbXC/B.DQvA44GXDXY1mz.rKjJWfHkynnMNJPS', 'Lê Quang Huy',    (SELECT id FROM roles WHERE code='referee'),   'approved'),
  ('nguyenhaidang@shuttleops.vn', '0923456789', '$2b$10$AZIiyQSaMGTRZsjlVyYrleaKe.ijttZLse1T7qD2ivCC/sa9mE6aG', 'Nguyễn Hải Đăng', (SELECT id FROM roles WHERE code='athlete'),   'approved'),
  ('truongdoan@shuttleops.vn',    '0955555555', '$2b$10$AZIiyQSaMGTRZsjlVyYrleaKe.ijttZLse1T7qD2ivCC/sa9mE6aG', 'Trưởng Đoàn',      (SELECT id FROM roles WHERE code='coach'),     'approved'),
  ('khangia@shuttleops.vn',       NULL,         '$2b$10$qKZwjMM5hedQjPXCQP5x8u53EVYOddiRLobHhlZ43w/ocI0q9Bovm', 'Khán giả',        (SELECT id FROM roles WHERE code='spectator'), 'approved'),
  ('tranvanminh@example.com',     '0934567890', '$2b$10$4b0aV7MlmFfdTZX2fboT2.Nm/dtuQBSBsMmeM8w8nryPZuiUVKfJ.', 'Trần Văn Minh',   NULL,                                          'pending'),
  ('lethilan@example.com',        '0945678901', '$2b$10$4b0aV7MlmFfdTZX2fboT2.Nm/dtuQBSBsMmeM8w8nryPZuiUVKfJ.', 'Lê Thị Lan',      NULL,                                          'pending'),
  ('john@shuttleops.vn',          '0999000001', '$2b$10$AZIiyQSaMGTRZsjlVyYrleaKe.ijttZLse1T7qD2ivCC/sa9mE6aG', 'John',             (SELECT id FROM roles WHERE code='athlete'),   'approved');

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

INSERT INTO tournaments (code, name, name_en, venue_id, start_date, end_date, status, format, budget, revenue, created_by)
VALUES (
  'VNBAD-2026-03',
  'Giải Cầu Lông Các CLB Toàn Quốc 2026',
  'National Club Badminton Championship 2026',
  (SELECT id FROM venues WHERE name='Nhà thi đấu Phú Thọ'),
  '2026-04-18', '2026-04-26',
  'live', 'Bảng → Loại trực tiếp',
  780000000, 512400000,
  (SELECT id FROM users WHERE email='phamlam@shuttleops.vn')   -- BTC sở hữu giải demo
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

INSERT INTO players (code, club_id, user_id, name, gender, dob, rating, tier, profile_status) VALUES
  ('A-0999', (SELECT id FROM clubs WHERE code='HCM'), (SELECT id FROM users WHERE email='john@shuttleops.vn'), 'John', 'M', '2000-06-15', 1500, 'C', 'approved');

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
INSERT INTO event_participants (event_id, player_id, seed, status)
SELECT e.id, p.id, CASE p.code WHEN 'A-0142' THEN 3 WHEN 'A-0145' THEN 5 END, 'approved'
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
SELECT m.id, 'A'::side_t, p.id, 3 FROM matches m JOIN players p ON p.code='A-0142' WHERE m.code='#184'
UNION ALL
SELECT m.id, 'B'::side_t, p.id, NULL FROM matches m JOIN players p ON p.code='A-0147' WHERE m.code='#184';

INSERT INTO match_sets (match_id, set_no, score_a, score_b, winner)
SELECT m.id, 1, 21, 18, 'A'::side_t FROM matches m WHERE m.code='#184'
UNION ALL SELECT m.id, 2, 14, 21, 'B'::side_t FROM matches m WHERE m.code='#184'
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

-- -----------------------------------------------------------------------------
-- DEMO DATA: thêm VĐV để demo bốc thăm (draw) bracket nhiều người + ghép cặp thủ công
--   - 12 nam đăng ký Đơn nam (MS)  → cùng 4 VĐV cũ = 16 người, đủ bracket 16
--   - 6  nữ  đăng ký Đơn nữ (WS)   → chưa bốc thăm, dùng demo ghép cặp thủ công
-- -----------------------------------------------------------------------------
INSERT INTO players (code, club_id, name, gender, dob, rating, tier, profile_status) VALUES
  ('A-0301', (SELECT id FROM clubs WHERE code='HCM'), 'Ngô Gia Bảo',     'M', '2000-02-01', 1980, 'B', 'approved'),
  ('A-0302', (SELECT id FROM clubs WHERE code='HN'),  'Phan Anh Tuấn',   'M', '1999-03-12', 1955, 'B', 'approved'),
  ('A-0303', (SELECT id FROM clubs WHERE code='QD'),  'Hoàng Minh Khôi', 'M', '2001-05-20', 1910, 'B', 'approved'),
  ('A-0304', (SELECT id FROM clubs WHERE code='BCM'), 'Đặng Quốc Toản',  'M', '2002-07-08', 1875, 'B', 'approved'),
  ('A-0305', (SELECT id FROM clubs WHERE code='DN'),  'Lý Hoàng Nam',    'M', '2003-09-15', 1840, 'B', 'approved'),
  ('A-0306', (SELECT id FROM clubs WHERE code='BG'),  'Trịnh Văn Sơn',   'M', '2000-11-30', 1790, 'C', 'approved'),
  ('A-0307', (SELECT id FROM clubs WHERE code='HP'),  'Mai Đức Thịnh',   'M', '2004-01-22', 1760, 'C', 'approved'),
  ('A-0308', (SELECT id FROM clubs WHERE code='TH'),  'Cao Bá Đạt',      'M', '2002-04-18', 1730, 'C', 'approved'),
  ('A-0309', (SELECT id FROM clubs WHERE code='NA'),  'Dương Hữu Phước', 'M', '2005-06-09', 1700, 'C', 'approved'),
  ('A-0310', (SELECT id FROM clubs WHERE code='CAND'),'Tô Văn Hậu',      'M', '2001-08-27', 1665, 'C', 'approved'),
  ('A-0311', (SELECT id FROM clubs WHERE code='HCM'), 'Vương Tấn Lực',   'M', '2003-10-03', 1630, 'C', 'approved'),
  ('A-0312', (SELECT id FROM clubs WHERE code='HN'),  'Đỗ Nhật Huy',     'M', '2004-12-14', 1600, 'C', 'approved'),
  ('A-0320', (SELECT id FROM clubs WHERE code='HN'),  'Trần Thanh Thảo', 'F', '2001-02-11', 1820, 'B', 'approved'),
  ('A-0321', (SELECT id FROM clubs WHERE code='HCM'), 'Nguyễn Mỹ Linh',  'F', '2002-03-19', 1785, 'B', 'approved'),
  ('A-0322', (SELECT id FROM clubs WHERE code='DN'),  'Phạm Khánh Vy',   'F', '2003-05-25', 1740, 'C', 'approved'),
  ('A-0323', (SELECT id FROM clubs WHERE code='QD'),  'Lê Thảo Nhi',     'F', '2004-07-07', 1705, 'C', 'approved'),
  ('A-0324', (SELECT id FROM clubs WHERE code='BCM'), 'Võ Hà My',        'F', '2005-09-13', 1670, 'C', 'approved'),
  ('A-0325', (SELECT id FROM clubs WHERE code='HP'),  'Bùi Diễm Quỳnh',  'F', '2002-11-21', 1640, 'C', 'approved');

-- Đăng ký 12 nam vào Đơn nam (MS); A-0301 hạt giống 1, A-0302 hạt giống 2 (còn lại không seed)
INSERT INTO event_participants (event_id, player_id, seed, status)
SELECT e.id, p.id, CASE p.code WHEN 'A-0301' THEN 1 WHEN 'A-0302' THEN 2 END, 'approved'
FROM events e
JOIN tournaments t ON t.id = e.tournament_id
JOIN players p ON p.code IN ('A-0301','A-0302','A-0303','A-0304','A-0305','A-0306',
                             'A-0307','A-0308','A-0309','A-0310','A-0311','A-0312')
WHERE t.code='VNBAD-2026-03' AND e.category_code='MS';

-- Đăng ký 6 nữ vào Đơn nữ (WS) — chưa bốc thăm để demo ghép cặp thủ công
INSERT INTO event_participants (event_id, player_id, seed, status)
SELECT e.id, p.id, NULL, 'approved'
FROM events e
JOIN tournaments t ON t.id = e.tournament_id
JOIN players p ON p.code IN ('A-0320','A-0321','A-0322','A-0323','A-0324','A-0325')
WHERE t.code='VNBAD-2026-03' AND e.category_code='WS';

-- =============================================================================
-- HẾT SEED
-- =============================================================================

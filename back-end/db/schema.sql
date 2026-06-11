-- =============================================================================
-- CNPM Badminton Tournament — PostgreSQL 16 schema
-- Tổ chức theo 8 module. Chạy 1 lần để khởi tạo DB sạch.
-- Phụ thuộc đã được sắp xếp đúng thứ tự CREATE.
-- =============================================================================

-- Cho phép tạo lại sạch khi dev (gỡ thoải mái, KHÔNG dùng trên production)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SET search_path = public;

-- Extension hữu ích (citext: case-insensitive email)
CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================================================
-- ENUM TYPES
-- =============================================================================
CREATE TYPE user_status        AS ENUM ('approved','pending','rejected','incomplete');
CREATE TYPE gender_t           AS ENUM ('M','F');
CREATE TYPE player_profile_st  AS ENUM ('approved','pending','incomplete');
CREATE TYPE referee_cert_t     AS ENUM ('QG_A','QG_B');
CREATE TYPE tournament_status  AS ENUM ('draft','live','finished','cancelled');
CREATE TYPE court_status_t     AS ENUM ('live','idle','maintenance');
CREATE TYPE match_status_t     AS ENUM ('upcoming','live','completed','cancelled');
CREATE TYPE side_t             AS ENUM ('A','B');
CREATE TYPE participant_status AS ENUM ('pending', 'pending_partner', 'registered', 'approved', 'rejected', 'supplement_required', 'checked_in', 'withdrawn');
CREATE TYPE notif_channel_t    AS ENUM ('in_app','email','sms');
CREATE TYPE notif_status_t     AS ENUM ('pending','sent','failed','read');
CREATE TYPE payment_purpose_t  AS ENUM ('registration_fee','sponsor','refund','prize','other');
CREATE TYPE payment_status_t   AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE pay_gateway_t      AS ENUM ('vnpay','momo','bank_transfer','cash');
CREATE TYPE pay_txn_status_t   AS ENUM ('pending','success','failed');
CREATE TYPE inv_status_t       AS ENUM ('ok','warn','critical');

-- =============================================================================
-- TRIGGER FUNCTION: updated_at tự cập nhật
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- MODULE 1 — Authentication & Authorization
-- =============================================================================

CREATE TABLE roles (
  id         SMALLSERIAL PRIMARY KEY,
  code       VARCHAR(32) UNIQUE NOT NULL,   -- admin, btc, referee, athlete, spectator
  label      VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id         SMALLSERIAL PRIMARY KEY,
  code       VARCHAR(64) UNIQUE NOT NULL,   -- vd: match.score.write
  label      VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
  role_id       SMALLINT NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id SMALLINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id                BIGSERIAL PRIMARY KEY,
  email             CITEXT UNIQUE NOT NULL,
  phone             VARCHAR(20),
  password_hash     VARCHAR(255) NOT NULL,
  name              VARCHAR(128) NOT NULL,
  primary_role_id   SMALLINT REFERENCES roles(id),
  status            user_status NOT NULL DEFAULT 'pending',
  requested_role_id SMALLINT REFERENCES roles(id),
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_status      ON users(status) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_users_updated   BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_roles (
  user_id  BIGINT   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id  SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_id)
);

-- =============================================================================
-- MODULE 2 — People Management
-- =============================================================================

CREATE TABLE clubs (
  id         BIGSERIAL PRIMARY KEY,
  code       VARCHAR(32) UNIQUE,            -- vd: HN, HCM, CAND, QD
  name       VARCHAR(128) NOT NULL,
  province   VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id             BIGSERIAL PRIMARY KEY,
  code           VARCHAR(16) UNIQUE,        -- vd: A-0142 (giữ format hiển thị)
  user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  club_id        BIGINT NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  name           VARCHAR(128) NOT NULL,
  gender         gender_t NOT NULL,
  dob            DATE,
  rating         INT NOT NULL DEFAULT 0,
  tier           CHAR(1),                   -- A/B/C
  cccd           VARCHAR(20),
  photo_url      TEXT,
  profile_status player_profile_st NOT NULL DEFAULT 'pending',
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);
CREATE INDEX idx_players_club    ON players(club_id);
CREATE INDEX idx_players_status  ON players(profile_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_players_rating  ON players(rating DESC);
CREATE TRIGGER trg_players_updated BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE coaches (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  club_id    BIGINT REFERENCES clubs(id) ON DELETE SET NULL,
  name       VARCHAR(128) NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE referees (
  id         BIGSERIAL PRIMARY KEY,
  code       VARCHAR(16) UNIQUE,            -- vd: R-01
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name       VARCHAR(128) NOT NULL,
  cert       referee_cert_t NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- MODULE 3 — Tournament Management
-- =============================================================================

CREATE TABLE categories (
  code        CHAR(2) PRIMARY KEY,          -- MS, WS, MD, WD, XD
  label       VARCHAR(64) NOT NULL,
  is_doubles  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE venues (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(128) NOT NULL,
  address    VARCHAR(255),
  province   VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tournaments (
  id          BIGSERIAL PRIMARY KEY,
  code        VARCHAR(32) UNIQUE NOT NULL,  -- vd: VNBAD-2026-03
  name        VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255),
  venue_id    BIGINT REFERENCES venues(id),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      tournament_status NOT NULL DEFAULT 'draft',
  format      VARCHAR(128),
  budget      BIGINT  NOT NULL DEFAULT 0,
  revenue     BIGINT  NOT NULL DEFAULT 0,
  created_by  BIGINT REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_tour_dates CHECK (end_date >= start_date)
);
CREATE TRIGGER trg_tournaments_updated BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE events (
  id              BIGSERIAL PRIMARY KEY,
  tournament_id   BIGINT  NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_code   CHAR(2) NOT NULL REFERENCES categories(code),
  label           VARCHAR(128),
  max_sets        SMALLINT NOT NULL DEFAULT 3 CHECK (max_sets IN (1,3,5)),
  points_per_set  SMALLINT NOT NULL DEFAULT 21 CHECK (points_per_set BETWEEN 11 AND 30),
  content_type    VARCHAR(32),
  gender          VARCHAR(32),
  age_group       VARCHAR(64),
  max_participants SMALLINT NOT NULL DEFAULT 64,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, category_code)
);

CREATE TABLE courts (
  id            BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE CASCADE,
  label         VARCHAR(32) NOT NULL,
  floor         VARCHAR(32),                -- Taraflex / PVC
  status        court_status_t NOT NULL DEFAULT 'idle',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, label)
);
CREATE TRIGGER trg_courts_updated BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- MODULE 5 — Participation / Registration  (đặt trước M4 vì M4 không ràng buộc M5)
-- =============================================================================

CREATE TABLE event_participants (
  id            BIGSERIAL PRIMARY KEY,
  event_id      BIGINT NOT NULL REFERENCES events(id)  ON DELETE CASCADE,
  player_id     BIGINT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  partner_id    BIGINT REFERENCES players(id),         -- NULL nếu đơn
  seed          SMALLINT,
  status        participant_status NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, player_id),
  CONSTRAINT chk_partner_diff CHECK (partner_id IS NULL OR partner_id <> player_id)
);
CREATE INDEX idx_evpart_event  ON event_participants(event_id);
CREATE INDEX idx_evpart_player ON event_participants(player_id);

-- =============================================================================
-- MODULE 4 — Competition Core
-- =============================================================================

CREATE TABLE matches (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(16) UNIQUE,        -- vd: #184
  event_id        BIGINT NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  round           VARCHAR(32),               -- "Vòng 1/16", "Tứ kết"...
  court_id        BIGINT REFERENCES courts(id)   ON DELETE SET NULL,
  referee_id      BIGINT REFERENCES referees(id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  status          match_status_t NOT NULL DEFAULT 'upcoming',
  winner_side     side_t,
  result_type     VARCHAR(16) NOT NULL DEFAULT 'normal',
  next_match_id   BIGINT REFERENCES matches(id) ON DELETE SET NULL,
  next_match_side side_t,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT chk_match_time CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);
CREATE INDEX idx_matches_event     ON matches(event_id);
CREATE INDEX idx_matches_court     ON matches(court_id, scheduled_at);
CREATE INDEX idx_matches_status    ON matches(status) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_matches_updated BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE match_participants (
  id         BIGSERIAL PRIMARY KEY,
  match_id   BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  side       side_t NOT NULL,
  player_id  BIGINT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  seed       SMALLINT,
  UNIQUE (match_id, side, player_id)
);
CREATE INDEX idx_mpart_match  ON match_participants(match_id);
CREATE INDEX idx_mpart_player ON match_participants(player_id);

CREATE TABLE match_sets (
  id         BIGSERIAL PRIMARY KEY,
  match_id   BIGINT  NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_no     SMALLINT NOT NULL CHECK (set_no >= 1),
  score_a    SMALLINT NOT NULL DEFAULT 0 CHECK (score_a >= 0),
  score_b    SMALLINT NOT NULL DEFAULT 0 CHECK (score_b >= 0),
  winner     side_t,
  UNIQUE (match_id, set_no)
);
CREATE INDEX idx_msets_match ON match_sets(match_id);

CREATE TABLE score_events (
  id              BIGSERIAL PRIMARY KEY,
  match_id        BIGINT  NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_no          SMALLINT NOT NULL,
  scorer          side_t   NOT NULL,
  prev_score_a    SMALLINT NOT NULL,
  prev_score_b    SMALLINT NOT NULL,
  prev_serving    side_t   NOT NULL,
  caused_set_end  BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_scoreev_match  ON score_events(match_id, created_at DESC);

-- =============================================================================
-- MODULE 6 — Notification
-- =============================================================================

CREATE TABLE notification_templates (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(64) UNIQUE NOT NULL,    -- vd: ACCOUNT_APPROVED
  channel       notif_channel_t NOT NULL,
  subject       VARCHAR(255),
  body_template TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id  BIGINT REFERENCES notification_templates(id),
  channel      notif_channel_t NOT NULL DEFAULT 'in_app',
  subject      VARCHAR(255),
  body         TEXT NOT NULL,
  status       notif_status_t NOT NULL DEFAULT 'pending',
  sent_at      TIMESTAMPTZ,
  read_at      TIMESTAMPTZ,
  meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user_unread ON notifications(user_id) WHERE status <> 'read';

-- =============================================================================
-- MODULE 7 — Payment
-- =============================================================================

CREATE TABLE payments (
  id                    BIGSERIAL PRIMARY KEY,
  code                  VARCHAR(32) UNIQUE NOT NULL,
  user_id               BIGINT REFERENCES users(id)              ON DELETE SET NULL,
  event_participant_id  BIGINT REFERENCES event_participants(id) ON DELETE SET NULL,
  amount                BIGINT NOT NULL,            -- VND, có thể âm (refund)
  currency              CHAR(3) NOT NULL DEFAULT 'VND',
  purpose               payment_purpose_t NOT NULL,
  status                payment_status_t  NOT NULL DEFAULT 'pending',
  budget_line_id        VARCHAR(32),
  note                  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at               TIMESTAMPTZ
);
CREATE INDEX idx_payments_user    ON payments(user_id);
CREATE INDEX idx_payments_status  ON payments(status, created_at DESC);

CREATE TABLE payment_transactions (
  id              BIGSERIAL PRIMARY KEY,
  payment_id      BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  gateway         pay_gateway_t NOT NULL,
  gateway_txn_id  VARCHAR(128) UNIQUE,
  amount          BIGINT NOT NULL,
  status          pay_txn_status_t NOT NULL DEFAULT 'pending',
  raw_response    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_paytxn_payment ON payment_transactions(payment_id);

-- =============================================================================
-- MODULE 8 — Reporting + Operations (Inventory, News, ActivityLog)
-- =============================================================================

CREATE TABLE report_templates (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(64) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  query_sql     TEXT NOT NULL,
  params_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_items (
  sku        VARCHAR(32) PRIMARY KEY,
  name       VARCHAR(128) NOT NULL,
  unit       VARCHAR(16) DEFAULT 'cái',
  stock      INT NOT NULL DEFAULT 0 CHECK (stock     >= 0),
  min_stock  INT NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  issued     INT NOT NULL DEFAULT 0 CHECK (issued    >= 0),
  status     inv_status_t GENERATED ALWAYS AS (
               CASE
                 WHEN stock <  min_stock              THEN 'critical'::inv_status_t
                 WHEN stock <  (min_stock * 5 / 4)    THEN 'warn'::inv_status_t
                 ELSE 'ok'::inv_status_t
               END
             ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE inventory_issues (
  id         BIGSERIAL PRIMARY KEY,
  sku        VARCHAR(32) NOT NULL REFERENCES inventory_items(sku) ON DELETE RESTRICT,
  match_id   BIGINT REFERENCES matches(id) ON DELETE SET NULL,
  qty        INT NOT NULL CHECK (qty > 0),
  issued_by  BIGINT REFERENCES users(id)   ON DELETE SET NULL,
  issued_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invissue_sku   ON inventory_issues(sku, issued_at DESC);
CREATE INDEX idx_invissue_match ON inventory_issues(match_id);

CREATE TABLE news (
  id            BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE SET NULL,
  title         VARCHAR(255) NOT NULL,
  body          TEXT,
  tag           VARCHAR(32),
  slug          VARCHAR(255),
  thumbnail_url VARCHAR(1024),
  status        VARCHAR(32) DEFAULT 'draft',
  published_at  TIMESTAMPTZ,
  created_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_published ON news(published_at DESC);

CREATE TABLE activity_log (
  id             BIGSERIAL PRIMARY KEY,
  actor_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action         VARCHAR(64) NOT NULL,        -- vd: 'match.score.add'
  target_type    VARCHAR(32),                 -- vd: 'match','player','inventory_item'
  target_id      VARCHAR(64),
  message        TEXT,
  meta           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_actlog_actor  ON activity_log(actor_user_id, created_at DESC);
CREATE INDEX idx_actlog_target ON activity_log(target_type, target_id);

-- =============================================================================
-- HẾT SCHEMA
-- =============================================================================

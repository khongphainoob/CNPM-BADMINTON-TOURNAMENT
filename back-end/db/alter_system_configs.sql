-- Create system_configs table
CREATE TABLE IF NOT EXISTS system_configs (
  config_key   VARCHAR(64) PRIMARY KEY,
  config_value TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO system_configs (config_key, config_value) VALUES
  ('system_name', 'ShuttleOps Platform'),
  ('timezone', 'Asia/Ho_Chi_Minh (UTC+7)'),
  ('maintenance_mode', 'false'),
  ('password_policy', 'strong'),
  ('jwt_expiration_hours', '24'),
  ('vnpay_tmncode', ''),
  ('vnpay_hashsecret', ''),
  ('vnpay_environment', 'Sandbox (Thử nghiệm)'),
  ('sms_provider', 'Twilio'),
  ('sms_apikey', '')
ON CONFLICT (config_key) DO NOTHING;

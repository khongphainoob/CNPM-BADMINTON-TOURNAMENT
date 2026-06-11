import { query, getClient } from '../../config/db.js';

export async function getConfigs() {
  const result = await query('SELECT config_key, config_value FROM system_configs');
  const configs = {};
  for (const row of result.rows) {
    configs[row.config_key] = row.config_value;
  }
  return configs;
}

export async function updateConfigs(updates) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const updated = {};
    for (const [key, val] of Object.entries(updates)) {
      const res = await client.query(
        `INSERT INTO system_configs (config_key, config_value)
         VALUES ($1, $2)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = now()
         RETURNING config_key, config_value`,
        [key, String(val)]
      );
      if (res.rows[0]) {
        updated[res.rows[0].config_key] = res.rows[0].config_value;
      }
    }
    await client.query('COMMIT');
    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

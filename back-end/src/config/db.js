import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function checkDbConnection() {
  const result = await query('SELECT now() AS now');
  return result.rows[0];
}

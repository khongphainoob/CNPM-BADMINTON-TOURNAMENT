import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Acquire a client from the pool for transaction use.
 * Usage:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     // ... do work ...
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
export async function getClient() {
  return pool.connect();
}

export async function checkDbConnection() {
  const result = await query('SELECT now() AS now');
  return result.rows[0];
}

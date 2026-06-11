import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function runAlter() {
  console.log('Running database alteration...');
  const sql = fs.readFileSync(path.join(__dirname, 'alter_system_configs.sql'), 'utf8');

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Database alteration completed successfully!');
  } catch (error) {
    console.error('Failed to run alteration:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAlter();

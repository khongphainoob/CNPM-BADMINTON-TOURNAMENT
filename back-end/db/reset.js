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

async function resetDb() {
  console.log('Resetting database...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Running schema.sql...');
    await client.query(schemaSql);
    console.log('Running seed.sql...');
    await client.query(seedSql);
    await client.query('COMMIT');
    console.log('Database reset completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to reset database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
